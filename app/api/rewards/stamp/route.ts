import { NextRequest, NextResponse } from 'next/server'
import { processRewards } from '../../../../lib/loyalty'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const paymentIntentId = body.paymentIntentId
    if (!paymentIntentId || typeof paymentIntentId !== 'string') {
      return NextResponse.json({ error: 'Missing payment' }, { status: 400 })
    }
    const receipt = await processRewards(paymentIntentId)
    return NextResponse.json({ receipt })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not apply stamps'
    const status = message === 'Payment is not complete' ? 409 : 500
    return NextResponse.json({ error: message }, { status })
  }
}
