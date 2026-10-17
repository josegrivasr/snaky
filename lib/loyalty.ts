import { createHash, randomUUID } from 'crypto'
import Stripe from 'stripe'
import {
  REFERRAL_STAMPS,
  RewardType,
  RewardsView,
  OrderRewardsReceipt,
  baseStampsForProduct,
  emptyView,
  firstNameOf,
  isValidBirthday,
  isValidEmail,
  normalizeEmail,
  parsePending,
  rewardList,
  rewardsCrossed,
  sanitizeCode,
  serializePending,
  stampsForOrder,
  todayParts,
  toView,
  cardFilled,
} from './rewards'

function getStripe(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null
  return new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-09-30.clover',
  })
}

interface Profile {
  id: string
  email: string
  name: string
  phone: string
  stamps: number
  orders: number
  pending: RewardType[]
  refCode: string
  referredBy: string
  refDone: boolean
  birthday: string
  birthdaySet: string
  birthdayYear: string
}

function isLiveCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer
): customer is Stripe.Customer {
  return !('deleted' in customer && customer.deleted)
}

function makeReferralCode(email: string): string {
  return createHash('sha256').update(normalizeEmail(email)).digest('hex').slice(0, 6).toUpperCase()
}

function readCount(value: string | undefined): number {
  const parsed = Number.parseInt(value || '0', 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function fromCustomer(customer: Stripe.Customer): Profile {
  const metadata = customer.metadata || {}
  return {
    id: customer.id,
    email: normalizeEmail(customer.email || ''),
    name: customer.name || '',
    phone: customer.phone || metadata.phone || '',
    stamps: readCount(metadata.stamps),
    orders: readCount(metadata.orders),
    pending: parsePending(metadata.pending),
    refCode: sanitizeCode(metadata.ref_code || '') || makeReferralCode(customer.email || customer.id),
    referredBy: sanitizeCode(metadata.referred_by || ''),
    refDone: metadata.ref_done === '1',
    birthday: metadata.birthday || '',
    birthdaySet: metadata.birthday_set || '',
    birthdayYear: metadata.birthday_year || '',
  }
}

function metadataOf(profile: Profile): Stripe.MetadataParam {
  return {
    stamps: String(profile.stamps),
    orders: String(profile.orders),
    pending: serializePending(profile.pending),
    ref_code: profile.refCode,
    referred_by: profile.referredBy,
    ref_done: profile.refDone ? '1' : '',
    birthday: profile.birthday,
    birthday_set: profile.birthdaySet,
    birthday_year: profile.birthdayYear,
    phone: profile.phone,
  }
}

function viewOf(profile: Profile, found = true): RewardsView {
  return toView({
    stamps: profile.stamps,
    orders: profile.orders,
    pending: profile.pending,
    firstName: firstNameOf(profile.name),
    referralCode: profile.refCode,
    found,
  })
}

async function findByEmail(stripe: Stripe, email: string): Promise<Stripe.Customer | null> {
  const listed = await stripe.customers.list({ email: normalizeEmail(email), limit: 1 })
  const customer = listed.data[0]
  return customer && isLiveCustomer(customer) ? customer : null
}

async function findByRef(stripe: Stripe, code: string): Promise<Stripe.Customer | null> {
  const safe = sanitizeCode(code)
  if (!safe) return null
  const result = await stripe.customers.search({
    query: `metadata['ref_code']:'${safe}'`,
    limit: 1,
  })
  const customer = result.data[0]
  return customer && isLiveCustomer(customer) ? customer : null
}

async function saveProfile(stripe: Stripe, profile: Profile, extra?: { name?: string; phone?: string }) {
  await stripe.customers.update(profile.id, {
    name: extra?.name ?? profile.name,
    phone: extra?.phone ?? (profile.phone || undefined),
    metadata: metadataOf(profile),
  })
}

function birthdayDue(profile: Profile, now = new Date()): boolean {
  if (!isValidBirthday(profile.birthday)) return false
  const today = todayParts(now)
  if (profile.birthday !== today.monthDay) return false
  if (profile.birthdayYear === today.year) return false
  if (!profile.birthdaySet || profile.birthdaySet >= today.iso) return false
  return true
}

function takeBirthday(profile: Profile, now = new Date()): boolean {
  if (!birthdayDue(profile, now)) return false
  profile.stamps += 1
  profile.birthdayYear = todayParts(now).year
  return true
}

async function ensureReferralCode(stripe: Stripe, profile: Profile) {
  if (profile.refCode) return
  profile.refCode = makeReferralCode(profile.email || profile.id)
  const clash = await findByRef(stripe, profile.refCode)
  if (clash && clash.id !== profile.id) {
    profile.refCode = `${profile.refCode}${profile.id.slice(-2)}`.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
  }
}

async function orderBaseStamps(stripe: Stripe, cartJson: string | undefined): Promise<number> {
  let cart: Array<{ stripeProductId?: string; name?: string }> = []
  try {
    cart = cartJson ? JSON.parse(cartJson) : []
  } catch {
    cart = []
  }
  if (!Array.isArray(cart) || cart.length === 0) return 1

  let base = 1
  for (const item of cart) {
    const productId = item?.stripeProductId
    if (!productId) continue
    try {
      const product = await stripe.products.retrieve(productId)
      base = Math.max(base, baseStampsForProduct(product.name, product.metadata?.reward_stamps))
    } catch {
      // Client-supplied names are not a stamp source.
    }
  }
  return base
}

function receiptFromMetadata(metadata: Stripe.Metadata): OrderRewardsReceipt | null {
  if (metadata.rewards_processed !== '1') return null
  const stamps = readCount(metadata.rewards_stamps)
  return {
    stamps,
    filled: cardFilled(stamps),
    earned: readCount(metadata.rewards_earned),
    bonus: metadata.rewards_bonus === '1',
    message: metadata.rewards_message || '',
    unlocked: parsePending(metadata.rewards_unlocked),
    redeemed: parsePending(metadata.rewards_redeemed),
    firstName: metadata.rewards_name || '',
    referralCode: metadata.rewards_ref || '',
    included: metadata.rewards_included || '',
    birthday: metadata.rewards_birthday === '1',
  }
}

function includedLine(redeemed: RewardType[]): string {
  const list = rewardList(redeemed)
  return list ? `${list} is included in this order.` : ''
}

async function loadMutable(stripe: Stripe, email: string, name?: string): Promise<Profile> {
  const existing = await findByEmail(stripe, email)
  if (existing) {
    const profile = fromCustomer(existing)
    if (name && name.trim()) profile.name = name.trim()
    await ensureReferralCode(stripe, profile)
    return profile
  }

  const created = await stripe.customers.create({
    email: normalizeEmail(email),
    name: name?.trim() || undefined,
    metadata: {
      stamps: '0',
      orders: '0',
      pending: '',
      ref_code: makeReferralCode(email),
      referred_by: '',
      ref_done: '',
      birthday: '',
      birthday_set: '',
      birthday_year: '',
      phone: '',
    },
  })
  return fromCustomer(created)
}

export async function getRewards(email: string): Promise<RewardsView> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Rewards storage is not configured')
  if (!isValidEmail(email)) return emptyView()

  const existing = await findByEmail(stripe, email)
  if (!existing) return emptyView()

  const profile = fromCustomer(existing)
  await ensureReferralCode(stripe, profile)
  const stampsBefore = profile.stamps
  const birthday = takeBirthday(profile)
  if (birthday) {
    profile.pending = [...profile.pending, ...rewardsCrossed(stampsBefore, profile.stamps)]
  }
  if (birthday || profile.refCode !== sanitizeCode(existing.metadata?.ref_code || '')) {
    await saveProfile(stripe, profile)
  }
  return viewOf(profile)
}

export async function registerRewards(input: {
  email: string
  name: string
  phone?: string
  birthday?: string
  referralCode?: string
}): Promise<RewardsView> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Rewards storage is not configured')
  if (!isValidEmail(input.email)) throw new Error('Enter a valid email')
  if (!input.name.trim()) throw new Error('Enter your name')

  const birthday = (input.birthday || '').trim()
  if (birthday && !isValidBirthday(birthday)) throw new Error('Enter a real birthday')

  const profile = await loadMutable(stripe, input.email, input.name)
  profile.name = input.name.trim()
  if (input.phone && input.phone.trim()) profile.phone = input.phone.trim().slice(0, 30)

  if (birthday && birthday !== profile.birthday) {
    profile.birthday = birthday
    profile.birthdaySet = todayParts().iso
  }

  const friendCode = sanitizeCode(input.referralCode || '')
  if (friendCode && !profile.refDone && profile.orders === 0 && friendCode !== profile.refCode) {
    const referrer = await findByRef(stripe, friendCode)
    if (!referrer) throw new Error('That friend code was not found')
    if (referrer.id !== profile.id) profile.referredBy = friendCode
  }

  const stampsBefore = profile.stamps
  if (takeBirthday(profile)) {
    profile.pending = [...profile.pending, ...rewardsCrossed(stampsBefore, profile.stamps)]
  }
  await saveProfile(stripe, profile, { name: profile.name, phone: profile.phone })
  return viewOf(profile)
}

export async function processRewards(paymentIntentId: string): Promise<OrderRewardsReceipt> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Rewards storage is not configured')

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (paymentIntent.status !== 'succeeded') {
    throw new Error('Payment is not complete')
  }

  const cached = receiptFromMetadata(paymentIntent.metadata)
  if (cached) return cached

  const lock = randomUUID()
  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: { rewards_processed: 'pending', rewards_lock: lock },
  })
  const locked = await stripe.paymentIntents.retrieve(paymentIntentId)
  if (locked.metadata.rewards_lock !== lock) {
    const winner = receiptFromMetadata(locked.metadata)
    if (winner) return winner
    throw new Error('Rewards are already being applied to this order')
  }

  const email = normalizeEmail(locked.metadata.customer_email || '')
  if (!isValidEmail(email)) throw new Error('This order has no customer email')

  const profile = await loadMutable(stripe, email, locked.metadata.customer_name || '')
  const stampsBefore = profile.stamps
  const ordersBefore = profile.orders
  const pendingBefore = [...profile.pending]
  const redeemed = pendingBefore
  profile.pending = []

  const base = await orderBaseStamps(stripe, locked.metadata.cart)
  const ordersAfter = ordersBefore + 1
  const { earned: orderStamps, bonus } = stampsForOrder(ordersAfter, base)
  profile.orders = ordersAfter
  profile.stamps += orderStamps

  let referrerBonus = 0
  let referrerId = ''
  let referrerBefore = 0
  let referrerPendingBefore = ''
  const friendCode = sanitizeCode(locked.metadata.referral_code || profile.referredBy || '')
  if (ordersBefore === 0 && !profile.refDone && friendCode && friendCode !== profile.refCode) {
    try {
      const referrerCustomer = await findByRef(stripe, friendCode)
      if (referrerCustomer && referrerCustomer.id !== profile.id) {
        const referrer = fromCustomer(referrerCustomer)
        referrerBefore = referrer.stamps
        referrerPendingBefore = serializePending(referrer.pending)
        referrer.stamps += REFERRAL_STAMPS
        referrer.pending = [
          ...referrer.pending,
          ...rewardsCrossed(referrerBefore, referrer.stamps),
        ]
        await saveProfile(stripe, referrer)
        profile.referredBy = friendCode
        profile.refDone = true
        referrerBonus = REFERRAL_STAMPS
        referrerId = referrer.id
      }
    } catch {
      referrerBonus = 0
      referrerId = ''
    }
  }

  const birthdayApplied = takeBirthday(profile)
  const unlocked = rewardsCrossed(stampsBefore, profile.stamps)
  profile.pending = unlocked
  await saveProfile(stripe, profile)

  const progress = viewOf(profile)
  const receipt: OrderRewardsReceipt = {
    stamps: profile.stamps,
    filled: progress.filled,
    earned: profile.stamps - stampsBefore,
    bonus,
    message: progress.message,
    unlocked,
    redeemed,
    firstName: progress.firstName,
    referralCode: profile.refCode,
    included: includedLine(redeemed),
    birthday: birthdayApplied,
  }

  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: {
      rewards_processed: '1',
      rewards_lock: lock,
      rewards_stamps: String(profile.stamps),
      rewards_before: String(stampsBefore),
      rewards_orders_before: String(ordersBefore),
      rewards_earned: String(receipt.earned),
      rewards_bonus: bonus ? '1' : '',
      rewards_unlocked: serializePending(unlocked),
      rewards_redeemed: serializePending(redeemed),
      rewards_message: receipt.message,
      rewards_name: receipt.firstName,
      rewards_ref: profile.refCode,
      rewards_included: receipt.included,
      rewards_birthday: birthdayApplied ? '1' : '',
      rewards_referrer_id: referrerId,
      rewards_referrer_bonus: referrerBonus ? String(referrerBonus) : '',
      rewards_referrer_before: referrerId ? String(referrerBefore) : '',
      rewards_referrer_pending_before: referrerPendingBefore,
    },
  })

  return receipt
}

export async function reverseRewards(paymentIntentId: string): Promise<void> {
  const stripe = getStripe()
  if (!stripe) throw new Error('Rewards storage is not configured')

  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
  const metadata = paymentIntent.metadata || {}
  if (metadata.rewards_processed !== '1' || metadata.rewards_reversed === '1') return

  const email = normalizeEmail(metadata.customer_email || '')
  if (!isValidEmail(email)) return
  const existing = await findByEmail(stripe, email)
  if (!existing) return

  const profile = fromCustomer(existing)
  const stampsBefore = readCount(metadata.rewards_before)
  const ordersBefore = readCount(metadata.rewards_orders_before)
  const stampsAfter = readCount(metadata.rewards_stamps)
  const buyerUntouched = profile.stamps === stampsAfter && profile.orders === ordersBefore + 1

  if (!buyerUntouched) {
    await stripe.paymentIntents.update(paymentIntentId, {
      metadata: { rewards_reversed: '1', rewards_reverse_skipped: '1' },
    })
    return
  }

  let referralReversed = !metadata.rewards_referrer_bonus
  if (metadata.rewards_referrer_id && metadata.rewards_referrer_bonus) {
    try {
      const referrerCustomer = await stripe.customers.retrieve(metadata.rewards_referrer_id)
      if (isLiveCustomer(referrerCustomer)) {
        const referrer = fromCustomer(referrerCustomer)
        const referrerAfter = readCount(metadata.rewards_referrer_before) + readCount(metadata.rewards_referrer_bonus)
        if (referrer.stamps === referrerAfter) {
          referrer.stamps = readCount(metadata.rewards_referrer_before)
          referrer.pending = parsePending(metadata.rewards_referrer_pending_before)
          await saveProfile(stripe, referrer)
          referralReversed = true
        }
      }
    } catch {
      referralReversed = false
    }
  }

  profile.stamps = stampsBefore
  profile.orders = ordersBefore
  profile.pending = parsePending(metadata.rewards_redeemed)
  if (metadata.rewards_birthday === '1' && profile.birthdayYear === todayParts().year) {
    profile.birthdayYear = ''
  }
  if (referralReversed) profile.refDone = false
  await saveProfile(stripe, profile)

  await stripe.paymentIntents.update(paymentIntentId, {
    metadata: { rewards_reversed: '1' },
  })
}
