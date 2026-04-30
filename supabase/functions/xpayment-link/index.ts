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
    const { amount, beneficiaryId, title, visitorId } = await req.json()

    if (!amount || !beneficiaryId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = Deno.env.get('XPAYMENT_TOKEN')
    const merchantOrderId = crypto.randomUUID()

    const res = await fetch(`${XPAYMENT_BASE}/payments/link`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-Idempotency-Key': merchantOrderId,
      },
      body: JSON.stringify({
        amount,
        merchant_order_id: merchantOrderId,
        device_interface: 'Pos',
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      console.error('xPayment error:', JSON.stringify(data))
      return new Response(JSON.stringify({ error: data.message || 'xPayment error' }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: dbError } = await supabase.from('kaspi_payment_requests').insert({
      beneficiary_id: beneficiaryId,
      beneficiary_title: title,
      amount,
      status: 'link_created',
      merchant_order_id: merchantOrderId,
    })

    if (dbError) console.error('DB insert error:', JSON.stringify(dbError))

    return new Response(JSON.stringify({
      success: true,
      qr_token: data.qr_token,
      merchant_order_id: merchantOrderId,
    }), {
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
