import { NextRequest, NextResponse } from 'next/server'
import { getRewards, registerRewards } from '../../../lib/loyalty'
import { isValidEmail, normalizeEmail } from '../../../lib/rewards'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const email = normalizeEmail(request.nextUrl.searchParams.get('email') || '')
    if (!isValidEmail(email)) {
      return NextResponse.json({ error: 'Enter a valid email' }, { status: 400 })
    }
    const progress = await getRewards(email)
    return NextResponse.json({ progress })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not load rewards' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const progress = await registerRewards({
      email: body.email || '',
      name: body.name || '',
      phone: body.phone || '',
      birthday: body.birthday || '',
      referralCode: body.referralCode || '',
    })
    return NextResponse.json({ progress })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not save rewards'
    const status = message === 'Rewards storage is not configured' ? 500 : 400
    return NextResponse.json({ error: message }, { status })
  }
}
