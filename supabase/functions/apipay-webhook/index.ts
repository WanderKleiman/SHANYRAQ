import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

async function verifySignature(secret: string, body: string, sigHeader: string | null): Promise<boolean> {
  if (!sigHeader || !secret) return false
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw', encoder.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(body))
  const hexSig = 'sha256=' + Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return hexSig === sigHeader
}

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const body = await req.text()
  console.log('xpayment-webhook raw body:', body)

  // Verify HMAC-SHA256 signature if secret is configured
  const webhookSecret = Deno.env.get('XPAYMENT_WEBHOOK_SECRET')
  if (webhookSecret) {
    const signature = req.headers.get('X-xPayment-Signature')
    const valid = await verifySignature(webhookSecret, body, signature)
    if (!valid) {
      console.error('Invalid webhook signature')
      return new Response('Forbidden', { status: 403 })
    }
  }

  let event: Record<string, any>
  try {
    event = JSON.parse(body)
  } catch {
    return new Response('Invalid JSON', { status: 400 })
  }

  console.log('xpayment-webhook parsed:', JSON.stringify({ event: event.event, paymentId: event.payment?.payment_id }))

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  if (event.event === 'payment.completed') {
    // merchant_order_id may be nested under payment/data or at top level
    const payment = event.payment || event.data || {}
    const merchantOrderId: string = payment.merchant_order_id || event.merchant_order_id || ''
    const rawPhone: string = payment.payer_phone || event.payer_phone || ''
    // Normalize phone: remove leading + so format matches existing visitors records
    const payerPhone: string = rawPhone.replace(/^\+/, '')
    const amount = Number(payment.amount ?? event.amount) || 0

    const paymentId: string = payment.payment_id || event.payment_id || ''
    console.log('Webhook resolved:', JSON.stringify({ merchantOrderId, paymentId, payerPhone, amount }))

    if (!merchantOrderId) {
      console.error('No merchant_order_id in payload:', JSON.stringify(event))
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // 1. Find our payment record by merchant_order_id
    const { data: paymentRecord, error: findErr } = await supabase
      .from('kaspi_payment_requests')
      .select('id, beneficiary_id, amount, visitor_id')
      .eq('merchant_order_id', merchantOrderId)
      .single()

    if (findErr) console.error('kaspi_payment_requests lookup error:', findErr.message)

    // If payer_phone missing from webhook — fetch it from xpayment API
    let resolvedPhone = payerPhone
    if (!resolvedPhone && paymentId) {
      const xpayToken = Deno.env.get('XPAYMENT_TOKEN')
      if (xpayToken) {
        const fetchRes = await fetch(`https://api.xpayment.kz/v1/payments/${paymentId}`, {
          headers: { 'Authorization': `Bearer ${xpayToken}` }
        })
        if (fetchRes.ok) {
          const fetchData = await fetchRes.json()
          const raw: string = fetchData.payer_phone || ''
          resolvedPhone = raw.replace(/^\+/, '')
          if (resolvedPhone) console.log(`Fetched payer_phone from xpayment API: ${resolvedPhone}`)
        } else {
          console.error('xpayment fetch payment failed:', await fetchRes.text())
        }
      }
    }

    // 2. Update payment status to 'paid', save payer phone
    const { error: updateErr } = await supabase
      .from('kaspi_payment_requests')
      .update({
        status: 'paid',
        phone: resolvedPhone || null,
        updated_at: new Date().toISOString(),
      })
      .eq('merchant_order_id', merchantOrderId)

    if (updateErr) console.error('kaspi_payment_requests update error:', updateErr.message)
    else console.log('Payment marked as paid:', merchantOrderId)

    // 3. Update beneficiary raised_amount
    const beneficiaryId = paymentRecord?.beneficiary_id
    const paidAmount = paymentRecord?.amount || amount

    if (beneficiaryId && paidAmount) {
      const { data: beneficiary, error: fetchErr } = await supabase
        .from('beneficiaries')
        .select('raised_amount')
        .eq('id', beneficiaryId)
        .single()

      if (fetchErr) {
        console.error('beneficiaries fetch error:', fetchErr.message)
      } else if (beneficiary) {
        const { error: raiseErr } = await supabase
          .from('beneficiaries')
          .update({ raised_amount: (beneficiary.raised_amount || 0) + paidAmount })
          .eq('id', beneficiaryId)

        if (raiseErr) console.error('raised_amount update error:', raiseErr.message)
        else console.log(`raised_amount +${paidAmount} for beneficiary ${beneficiaryId}`)
      }
    }

    // 4. Real Kaspi phone → update the visitor who created the QR link
    // This replaces any manually entered test phone with the verified bank number
    if (resolvedPhone && paymentRecord?.visitor_id) {
      const { error: visitorErr } = await supabase
        .from('visitors')
        .update({
          phone: resolvedPhone,
          updated_at: new Date().toISOString(),
        })
        .eq('visitor_id', paymentRecord.visitor_id)

      if (visitorErr) console.error('visitors update error:', visitorErr.message)
      else console.log(`Updated phone for visitor ${paymentRecord.visitor_id} → ${resolvedPhone}`)
    } else if (resolvedPhone) {
      // No visitor_id in record — upsert by phone as fallback
      await supabase.from('visitors').upsert({
        phone: resolvedPhone,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'phone' })
    }
  }

  if (event.event === 'payment.cancelled') {
    const payment = event.payment || {}
    const merchantOrderId: string = payment.merchant_order_id || ''

    if (merchantOrderId) {
      await supabase
        .from('kaspi_payment_requests')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('merchant_order_id', merchantOrderId)

      console.log('Payment marked as cancelled:', merchantOrderId)
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
})
