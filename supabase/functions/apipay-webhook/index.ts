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

  // xPayment sends: { event: "payment.completed", payment: { payment_id, merchant_order_id, amount, payer_phone, ... } }
  if (event.event === 'payment.completed') {
    const payment = event.payment || {}
    const merchantOrderId: string = payment.merchant_order_id || ''
    const payerPhone: string = payment.payer_phone || ''
    const amount = Number(payment.amount) || 0

    if (!merchantOrderId) {
      console.error('No merchant_order_id in payload')
      return new Response(JSON.stringify({ received: true }), { status: 200, headers: { 'Content-Type': 'application/json' } })
    }

    // 1. Find our payment record by merchant_order_id (stored in apipay_invoice_id)
    const { data: paymentRecord, error: findErr } = await supabase
      .from('kaspi_payment_requests')
      .select('id, beneficiary_id, amount')
      .eq('merchant_order_id', merchantOrderId)
      .single()

    if (findErr) console.error('kaspi_payment_requests lookup error:', findErr.message)

    // 2. Update payment status to 'paid', save payer phone
    const { error: updateErr } = await supabase
      .from('kaspi_payment_requests')
      .update({
        status: 'paid',
        phone: payerPhone || null,
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

    // 4. If Kaspi gave us the payer phone — save it to visitors (links payment to a profile)
    if (payerPhone) {
      const { error: visitorErr } = await supabase
        .from('visitors')
        .upsert({
          phone: payerPhone,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'phone' })

      if (visitorErr) console.error('visitors upsert error:', visitorErr.message)
      else console.log('Saved payer phone to visitors:', payerPhone)
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
