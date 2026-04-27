import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  console.log('apipay-webhook raw body:', body)

  let event: Record<string, any>
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // ApiPay may nest payload under "data" or send it flat
  const eventType: string = event.type || event.event || ''
  const data = event.data || event

  console.log('apipay-webhook parsed:', JSON.stringify({ eventType, dataStatus: data?.status, dataId: data?.id, externalOrderId: data?.external_order_id }))

  // Handle paid invoice
  const isPaidInvoice =
    (eventType === 'invoice.status_changed' && data.status === 'paid') ||
    eventType === 'invoice.paid'

  if (isPaidInvoice) {
    const apiPayInvoiceId = data.id

    console.log('Processing paid invoice:', { apiPayInvoiceId })

    if (!apiPayInvoiceId) {
      console.error('No invoice id in payload')
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // 1. Find our payment record by apipay_invoice_id to get beneficiary_id and amount
    const { data: paymentRecord, error: findErr } = await supabase
      .from('kaspi_payment_requests')
      .select('id, beneficiary_id, amount')
      .eq('apipay_invoice_id', apiPayInvoiceId)
      .single()

    if (findErr) {
      console.error('kaspi_payment_requests lookup error:', findErr.message)
    }

    // 2. Update payment status to 'paid'
    const { error: updateErr } = await supabase
      .from('kaspi_payment_requests')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('apipay_invoice_id', apiPayInvoiceId)

    if (updateErr) console.error('kaspi_payment_requests update error:', updateErr.message)
    else console.log('Payment marked as paid:', apiPayInvoiceId)

    // 3. Update beneficiary raised_amount using our own record (reliable, no external_order_id needed)
    if (paymentRecord?.beneficiary_id && paymentRecord?.amount) {
      const { data: beneficiary, error: fetchErr } = await supabase
        .from('beneficiaries')
        .select('raised_amount')
        .eq('id', paymentRecord.beneficiary_id)
        .single()

      if (fetchErr) {
        console.error('beneficiaries fetch error:', fetchErr.message)
      } else if (beneficiary) {
        const { error: raiseErr } = await supabase
          .from('beneficiaries')
          .update({ raised_amount: (beneficiary.raised_amount || 0) + paymentRecord.amount })
          .eq('id', paymentRecord.beneficiary_id)

        if (raiseErr) console.error('raised_amount update error:', raiseErr.message)
        else console.log(`raised_amount +${paymentRecord.amount} for beneficiary ${paymentRecord.beneficiary_id}`)
      }
    }
  }

  if (eventType === 'subscription.payment_succeeded') {
    const externalSubscriberId: string = data.external_subscriber_id || ''

    if (externalSubscriberId.startsWith('fund-')) {
      await supabase
        .from('fund_subscriptions')
        .update({
          status: 'active',
          last_payment_at: new Date().toISOString(),
        })
        .eq('apipay_subscriber_id', externalSubscriberId)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
