import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { visitorId, phones, authUserId } = await req.json()

    // Service role bypasses RLS — safe here because we only return data
    // that belongs to the caller (identified by visitorId / phone / authUserId)
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const merged = new Map<string, Record<string, unknown>>()

    // 1. Direct lookup by visitor_id (same device, most reliable)
    if (visitorId) {
      const { data } = await supabase
        .from('kaspi_payment_requests')
        .select('*')
        .eq('visitor_id', visitorId)
        .order('created_at', { ascending: false })
      ;(data || []).forEach((p: Record<string, unknown>) => merged.set(p.id as string, p))
    }

    // 2. Lookup by phones provided by the client (localStorage / from payment records)
    const allPhones = new Set<string>(phones || [])

    // 3. If authenticated, also pull phones from all visitor records linked to that user
    if (authUserId) {
      const { data: linkedVisitors } = await supabase
        .from('visitors')
        .select('phone')
        .eq('auth_user_id', authUserId)
        .not('phone', 'is', null)
      ;(linkedVisitors || []).forEach((v: Record<string, unknown>) => {
        if (v.phone) allPhones.add(v.phone as string)
      })
    }

    if (allPhones.size > 0) {
      const { data } = await supabase
        .from('kaspi_payment_requests')
        .select('*')
        .in('phone', [...allPhones])
        .order('created_at', { ascending: false })
      ;(data || []).forEach((p: Record<string, unknown>) => merged.set(p.id as string, p))
    }

    const payments = [...merged.values()].sort(
      (a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime()
    )

    return new Response(JSON.stringify({ payments }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('get-user-payments error:', err)
    return new Response(JSON.stringify({ error: String(err), payments: [] }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
