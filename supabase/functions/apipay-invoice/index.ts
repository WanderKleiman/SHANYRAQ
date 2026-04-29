import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const APIPAY_BASE = 'https://bpapi.bazarbay.site/api/v1'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { phone, amount, beneficiaryId, title, visitorId } = await req.json()

    if (!phone || !amount || !beneficiaryId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('APIPAY_KEY')
    // Convert 7XXXXXXXXXX → 8XXXXXXXXXX (ApiPay format)
    const formattedPhone = '8' + phone.slice(1)

    const res = await fetch(`${APIPAY_BASE}/invoices`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey!, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: formattedPhone,
        amount,
        description: `Помощь: ${title}`,
        external_order_id: `ben-${beneficiaryId}`,
      }),
    })

    const apiPayData = await res.json()

    if (!res.ok) {
      return new Response(JSON.stringify({ error: apiPayData.message || 'ApiPay error' }), {
        status: res.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Write to kaspi_payment_requests so the profile can track this invoice
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { error: dbError } = await supabase.from('kaspi_payment_requests').insert({
      beneficiary_id: beneficiaryId,
      beneficiary_title: title,
      phone,
      amount,
      status: 'invoice_sent',
      apipay_invoice_id: apiPayData.id,
    })

    if (dbError) {
      console.error('DB insert error:', JSON.stringify(dbError))
    }

    return new Response(JSON.stringify({ success: true, invoiceId: apiPayData.id, dbError: dbError?.message || null }), {
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
