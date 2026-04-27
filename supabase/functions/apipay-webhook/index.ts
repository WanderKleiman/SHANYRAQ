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

  const eventType: string = event.type || event.event || ''
  const data = event.data || event

  if (eventType === 'invoice.status_changed' && data.status === 'paid') {
    const externalOrderId: string = data.external_order_id || ''
    if (externalOrderId.startsWith('ben-')) {
      const beneficiaryId = externalOrderId.replace('ben-', '')
      const amount = Number(data.amount) || 0

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
    const amount = Number(data.amount) || 0

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
