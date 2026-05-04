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
    const { amount, beneficiaryId, title, visitorId, fundId, fundName } = await req.json()

    if (!amount || (!beneficiaryId && !fundId)) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = Deno.env.get('XPAYMENT_TOKEN')
    const merchantOrderId = crypto.randomUUID()

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

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

    // beneficiaryId must be a valid integer — 'kaspi-bonus' and similar strings are not real DB IDs
    const numericBeneficiaryId = beneficiaryId && /^\d+$/.test(String(beneficiaryId)) ? Number(beneficiaryId) : null
    const numericFundId = fundId && /^\d+$/.test(String(fundId)) ? Number(fundId) : null

    // DB requires either beneficiary_id OR fund_id to be set (CHECK constraint).
    // Old cached frontend sends beneficiaryId='kaspi-bonus' without fundId — fall back to Shanyraq (3).
    const effectiveFundId = numericFundId ?? (numericBeneficiaryId === null ? 3 : null)

    const { error: dbError } = await supabase.from('kaspi_payment_requests').insert({
      beneficiary_id: numericBeneficiaryId,
      beneficiary_title: title || null,
      fund_id: effectiveFundId,
      fund_name: fundName || null,
      amount,
      status: 'link_created',
      merchant_order_id: merchantOrderId,
      visitor_id: visitorId || null,
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
