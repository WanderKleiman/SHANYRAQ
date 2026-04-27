import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const APIPAY_BASE = 'https://bpapi.bazarbay.site/api/v1'
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { phone, amount, fundId, fundName } = await req.json()

    if (!phone || !amount || !fundId) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const apiKey = Deno.env.get('APIPAY_KEY')
    const formattedPhone = '8' + phone.slice(1)
    const externalSubscriberId = `fund-${fundId}-${formattedPhone}`

    const res = await fetch(`${APIPAY_BASE}/subscriptions`, {
      method: 'POST',
      headers: { 'X-API-Key': apiKey!, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone_number: formattedPhone,
        amount,
        billing_period: 'monthly',
        description: `Ежемесячная помощь фонду «${fundName}»`,
        external_subscriber_id: externalSubscriberId,
      }),
    })

    const data = await res.json()

    return new Response(JSON.stringify({ ...data, externalSubscriberId }), {
      status: res.ok ? 200 : res.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
