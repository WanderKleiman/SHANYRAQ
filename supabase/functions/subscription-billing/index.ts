import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const XPAYMENT_BASE = 'https://api.xpayment.kz/v1'

serve(async (req) => {
  // Allow manual trigger via POST, cron triggers via GET
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const token = Deno.env.get('XPAYMENT_TOKEN')
  if (!token) {
    return new Response(JSON.stringify({ error: 'No XPAYMENT_TOKEN' }), { status: 500 })
  }

  // Find active subscriptions due for billing:
  // - status = 'active' AND last_payment_at < 30 days ago
  // - OR status = 'active' AND last_payment_at is null AND created_at < 30 days ago
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const { data: subscriptions, error } = await supabase
    .from('fund_subscriptions')
    .select('id, phone, amount, fund_name')
    .eq('status', 'active')
    .or(`last_payment_at.lt.${thirtyDaysAgo},and(last_payment_at.is.null,created_at.lt.${thirtyDaysAgo})`)

  if (error) {
    console.error('Error fetching subscriptions:', error.message)
    return new Response(JSON.stringify({ error: error.message }), { status: 500 })
  }

  console.log(`Processing ${subscriptions?.length || 0} subscriptions`)

  const results = []
  for (const sub of (subscriptions || [])) {
    try {
      const merchantOrderId = crypto.randomUUID()

      const res = await fetch(`${XPAYMENT_BASE}/payments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'X-Idempotency-Key': merchantOrderId,
        },
        body: JSON.stringify({
          amount: sub.amount,
          payer_phone: sub.phone.startsWith('+') ? sub.phone : `+${sub.phone}`,
          merchant_order_id: merchantOrderId,
          comment: `Ежемесячная помощь фонду ${sub.fund_name || ''}`.trim(),
        }),
      })

      const data = await res.json()

      if (res.ok) {
        // Update merchant_order_id so webhook can match this new payment to the subscription
        await supabase
          .from('fund_subscriptions')
          .update({
            merchant_order_id: merchantOrderId,
            xpayment_payment_id: data.payment_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sub.id)

        console.log(`Invoice sent for subscription ${sub.id}, phone ${sub.phone}`)
        results.push({ id: sub.id, status: 'sent' })
      } else {
        console.error(`Failed to send invoice for ${sub.id}:`, JSON.stringify(data))
        results.push({ id: sub.id, status: 'failed', error: data.message })
      }
    } catch (err) {
      console.error(`Error processing subscription ${sub.id}:`, err)
      results.push({ id: sub.id, status: 'error' })
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
