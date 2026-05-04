import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const XPAYMENT_BASE = 'https://api.xpayment.kz/v1'

serve(async (req) => {
  // Allow manual trigger via POST, and scheduled calls
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )
  const token = Deno.env.get('XPAYMENT_TOKEN')!

  // Fetch payments stuck in link_created/pending for more than 2 minutes
  const cutoff = new Date(Date.now() - 2 * 60 * 1000).toISOString()

  const { data: stuckPayments } = await supabase
    .from('kaspi_payment_requests')
    .select('id, merchant_order_id, beneficiary_id, amount, visitor_id')
    .in('status', ['link_created', 'pending'])
    .lt('updated_at', cutoff)
    .not('merchant_order_id', 'is', null)

  const { data: stuckSubs } = await supabase
    .from('fund_subscriptions')
    .select('id, merchant_order_id')
    .eq('status', 'pending')
    .lt('updated_at', cutoff)
    .not('merchant_order_id', 'is', null)

  let confirmed = 0
  let cancelled = 0
  const debugLog: any[] = []

  // Reconcile kaspi_payment_requests
  for (const payment of stuckPayments ?? []) {
    try {
      const res = await fetch(
        `${XPAYMENT_BASE}/payments?merchant_order_id=${payment.merchant_order_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      const rawBody = await res.text()
      debugLog.push({ merchant_order_id: payment.merchant_order_id, http: res.status, body: rawBody.slice(0, 500) })
      if (!res.ok) continue

      let parsed: any
      try { parsed = JSON.parse(rawBody) } catch { continue }
      const { data } = parsed
      const xp = data?.[0]
      if (!xp) continue

      const xpStatus = (xp.status || '').toUpperCase()

      if (xpStatus === 'COMPLETED') {
        const phone = (xp.payer_phone || '').replace(/^\+/, '')

        await supabase
          .from('kaspi_payment_requests')
          .update({ status: 'paid', phone: phone || null, updated_at: new Date().toISOString() })
          .eq('id', payment.id)

        // Update beneficiary raised_amount
        if (payment.beneficiary_id && payment.amount) {
          const { data: ben } = await supabase
            .from('beneficiaries')
            .select('raised_amount')
            .eq('id', payment.beneficiary_id)
            .single()
          if (ben) {
            await supabase
              .from('beneficiaries')
              .update({ raised_amount: (ben.raised_amount || 0) + payment.amount })
              .eq('id', payment.beneficiary_id)
          }
        }

        // Update visitor phone
        if (phone && payment.visitor_id) {
          await supabase
            .from('visitors')
            .update({ phone, updated_at: new Date().toISOString() })
            .eq('visitor_id', payment.visitor_id)
        }

        confirmed++
        console.log(`Reconciled payment ${payment.merchant_order_id} → paid`)

      } else if (xpStatus === 'CANCELLED' || xpStatus === 'FAILED' || xpStatus === 'EXPIRED') {
        await supabase
          .from('kaspi_payment_requests')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', payment.id)
        cancelled++
      }
    } catch (err) {
      console.error(`Error reconciling payment ${payment.merchant_order_id}:`, err)
    }
  }

  // Reconcile fund_subscriptions
  for (const sub of stuckSubs ?? []) {
    try {
      const res = await fetch(
        `${XPAYMENT_BASE}/payments?merchant_order_id=${sub.merchant_order_id}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      )
      if (!res.ok) continue

      const { data } = await res.json()
      const xp = data?.[0]
      if (!xp) continue

      const subStatus = (xp.status || '').toUpperCase()
      if (subStatus === 'COMPLETED') {
        await supabase
          .from('fund_subscriptions')
          .update({ status: 'active', last_payment_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', sub.id)
        confirmed++
        console.log(`Reconciled subscription ${sub.merchant_order_id} → active`)
      } else if (subStatus === 'CANCELLED' || subStatus === 'FAILED' || subStatus === 'EXPIRED') {
        await supabase
          .from('fund_subscriptions')
          .update({ status: 'cancelled', updated_at: new Date().toISOString() })
          .eq('id', sub.id)
        cancelled++
      }
    } catch (err) {
      console.error(`Error reconciling subscription ${sub.merchant_order_id}:`, err)
    }
  }

  console.log(`Reconcile done: ${confirmed} confirmed, ${cancelled} cancelled`)
  return new Response(JSON.stringify({ confirmed, cancelled, debug: debugLog }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
