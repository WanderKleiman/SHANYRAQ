import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const XPAYMENT_BASE = 'https://api.xpayment.kz/v1'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { phone, amount, fundId, fundName, visitorId } = await req.json()

    if (!phone || !amount || !fundId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = Deno.env.get('XPAYMENT_TOKEN')
    const merchantOrderId = crypto.randomUUID()

    // Send invoice to payer's Kaspi via push notification
    const res = await fetch(`${XPAYMENT_BASE}/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': merchantOrderId,
      },
      body: JSON.stringify({
        amount,
        payer_phone: phone.startsWith('+') ? phone : `+${phone}`,
        merchant_order_id: merchantOrderId,
        comment: `Ежемесячная помощь фонду ${fundName || ''}`.trim(),
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('xPayment invoice error:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: data.message || 'xPayment error' }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: dbError } = await supabase.from('fund_subscriptions').insert({
      fund_id: fundId,
      fund_name: fundName || null,
      phone,
      amount,
      payment_method: 'kaspi',
      status: 'pending',
      visitor_id: visitorId || null,
      merchant_order_id: merchantOrderId,
      xpayment_payment_id: data.payment_id || null,
    })

    if (dbError) console.error('DB insert error:', JSON.stringify(dbError))

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
