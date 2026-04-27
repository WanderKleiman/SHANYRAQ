import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
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

  // ApiPay may send event type as "type" or "event"
  const eventType: string = event.type || event.event || ''
  const data = event.data || event

  if (eventType === 'invoice.status_changed' && data.status === 'paid') {
    const apiPayInvoiceId = data.id
    const externalOrderId: string = data.external_order_id || ''
    const amount = Number(data.amount) || 0

    // 1. Update the payment request record to 'paid'
    if (apiPayInvoiceId) {
      await supabase
        .from('kaspi_payment_requests')
        .update({ status: 'paid' })
        .eq('apipay_invoice_id', apiPayInvoiceId)
    }

    // 2. Update beneficiary raised_amount
    if (externalOrderId.startsWith('ben-')) {
      const beneficiaryId = externalOrderId.replace('ben-', '')

      const { data: current } = await supabase
        .from('beneficiaries')
        .select('raised_amount')
        .eq('id', beneficiaryId)
        .single()

      if (current) {
        await supabase
          .from('beneficiaries')
          .update({ raised_amount: (current.raised_amount || 0) + amount })
          .eq('id', beneficiaryId)
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
