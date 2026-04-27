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

  // Handle paid invoice — supports "invoice.status_changed" and flat "invoice.paid" events
  const isPaidInvoice =
    (eventType === 'invoice.status_changed' && data.status === 'paid') ||
    eventType === 'invoice.paid' ||
    (eventType === '' && data.status === 'paid' && data.id)

  if (isPaidInvoice) {
    const apiPayInvoiceId = data.id
    const externalOrderId: string = data.external_order_id || ''
    const amount = Number(data.amount) || 0

    console.log('Processing paid invoice:', { apiPayInvoiceId, externalOrderId, amount })

    // 1. Update the payment request record to 'paid'
    if (apiPayInvoiceId) {
      const { error: updateErr } = await supabase
        .from('kaspi_payment_requests')
        .update({ status: 'paid', updated_at: new Date().toISOString() })
        .eq('apipay_invoice_id', apiPayInvoiceId)
      if (updateErr) console.error('kaspi_payment_requests update error:', updateErr.message)
    }

    // 2. Update beneficiary raised_amount
    if (externalOrderId.startsWith('ben-')) {
      const beneficiaryId = externalOrderId.replace('ben-', '')

      const { data: current, error: fetchErr } = await supabase
        .from('beneficiaries')
        .select('raised_amount')
        .eq('id', beneficiaryId)
        .single()

      if (fetchErr) {
        console.error('beneficiaries fetch error:', fetchErr.message)
      } else if (current) {
        const { error: raiseErr } = await supabase
          .from('beneficiaries')
          .update({ raised_amount: (current.raised_amount || 0) + amount })
          .eq('id', beneficiaryId)
        if (raiseErr) console.error('beneficiaries raised_amount update error:', raiseErr.message)
        else console.log(`raised_amount updated for beneficiary ${beneficiaryId}: +${amount}`)
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
