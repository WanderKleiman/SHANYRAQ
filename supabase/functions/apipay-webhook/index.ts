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

  // ApiPay sends: { event: "invoice.status_changed", invoice: { id, status, amount, ... } }
  const eventType: string = event.type || event.event || ''
  const invoice = event.invoice || event.data || {}

  console.log('apipay-webhook parsed:', JSON.stringify({ eventType, invoiceId: invoice.id, status: invoice.status }))

  const isPaidInvoice =
    (eventType === 'invoice.status_changed' && invoice.status === 'paid') ||
    eventType === 'invoice.paid'

  if (isPaidInvoice) {
    const apiPayInvoiceId = invoice.id
    const amount = Number(invoice.amount) || 0

    console.log('Processing paid invoice:', { apiPayInvoiceId, amount })

    if (!apiPayInvoiceId) {
      console.error('No invoice id in payload')
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // 1. Find our payment record by apipay_invoice_id
    const { data: paymentRecord, error: findErr } = await supabase
      .from('kaspi_payment_requests')
      .select('id, beneficiary_id, amount')
      .eq('apipay_invoice_id', String(apiPayInvoiceId))
      .single()

    if (findErr) console.error('kaspi_payment_requests lookup error:', findErr.message)

    // 2. Update payment status to 'paid'
    const { error: updateErr } = await supabase
      .from('kaspi_payment_requests')
      .update({ status: 'paid', updated_at: new Date().toISOString() })
      .eq('apipay_invoice_id', String(apiPayInvoiceId))

    if (updateErr) console.error('kaspi_payment_requests update error:', updateErr.message)
    else console.log('Payment marked as paid:', apiPayInvoiceId)

    // 3. Update beneficiary raised_amount
    const beneficiaryId = paymentRecord?.beneficiary_id
    const paidAmount = paymentRecord?.amount || amount

    if (beneficiaryId && paidAmount) {
      const { data: beneficiary, error: fetchErr } = await supabase
        .from('beneficiaries')
        .select('raised_amount')
        .eq('id', beneficiaryId)
        .single()

      if (fetchErr) {
        console.error('beneficiaries fetch error:', fetchErr.message)
      } else if (beneficiary) {
        const { error: raiseErr } = await supabase
          .from('beneficiaries')
          .update({ raised_amount: (beneficiary.raised_amount || 0) + paidAmount })
          .eq('id', beneficiaryId)

        if (raiseErr) console.error('raised_amount update error:', raiseErr.message)
        else console.log(`raised_amount +${paidAmount} for beneficiary ${beneficiaryId}`)
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
