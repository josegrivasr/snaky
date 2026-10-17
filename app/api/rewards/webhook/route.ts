import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { reverseRewards } from '../../../../lib/loyalty'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const key = process.env.STRIPE_SECRET_KEY
  if (!secret || !key) {
    return NextResponse.json({ error: 'Webhook is not configured' }, { status: 500 })
  }

  const stripe = new Stripe(key, { apiVersion: '2025-09-30.clover' })
  const signature = request.headers.get('stripe-signature')
  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(await request.text(), signature, secret)
    if (event.type === 'charge.refunded') {
      const charge = event.data.object as Stripe.Charge
      const paymentIntentId = typeof charge.payment_intent === 'string' ? charge.payment_intent : ''
      if (charge.refunded && paymentIntentId) {
        await reverseRewards(paymentIntentId)
      }
    }
    return NextResponse.json({ received: true })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid webhook' },
      { status: 400 }
    )
  }
}
