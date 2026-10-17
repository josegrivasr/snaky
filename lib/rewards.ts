export const CYCLE = 10
export const SNACK_AT = 5
export const REFERRAL_STAMPS = 2
export const MAX_STAMPS_PER_ORDER = 3

export type RewardType = 'snack' | 'drink'

export interface RewardsView {
  found: boolean
  stamps: number
  orders: number
  filled: number
  cycle: number
  remaining: number
  nextReward: RewardType | null
  pending: RewardType[]
  message: string
  firstName: string
  referralCode: string
}

export interface OrderRewardsReceipt {
  stamps: number
  filled: number
  earned: number
  bonus: boolean
  message: string
  unlocked: RewardType[]
  redeemed: RewardType[]
  firstName: string
  referralCode: string
  included: string
  birthday: boolean
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizeEmail(email))
}

export function sanitizeCode(code: string): string {
  return code.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8)
}

export function isValidBirthday(value: string): boolean {
  const match = /^(\d{2})-(\d{2})$/.exec(value)
  if (!match) return false
  const month = Number(match[1])
  const day = Number(match[2])
  if (month < 1 || month > 12 || day < 1 || day > 31) return false
  const probe = new Date(Date.UTC(2024, month - 1, day))
  return probe.getUTCMonth() === month - 1 && probe.getUTCDate() === day
}

export function firstNameOf(name: string): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  return trimmed.split(/\s+/)[0]
}

export function todayParts(now = new Date()): { monthDay: string; year: string; iso: string } {
  const year = String(now.getUTCFullYear())
  const month = String(now.getUTCMonth() + 1).padStart(2, '0')
  const day = String(now.getUTCDate()).padStart(2, '0')
  return { monthDay: `${month}-${day}`, year, iso: `${year}-${month}-${day}` }
}

export function cardFilled(stamps: number): number {
  if (stamps <= 0) return 0
  const mod = stamps % CYCLE
  return mod === 0 ? CYCLE : mod
}

export function rewardsCrossed(before: number, after: number): RewardType[] {
  const rewards: RewardType[] = []
  const start = Math.max(0, before)
  const end = Math.max(start, after)
  for (let n = start + 1; n <= end; n += 1) {
    if (n % CYCLE === SNACK_AT) rewards.push('snack')
    if (n % CYCLE === 0) rewards.push('drink')
  }
  return rewards
}

export function nextGoal(stamps: number): { type: RewardType; remaining: number } {
  const filled = cardFilled(stamps)
  if (filled === CYCLE) return { type: 'drink', remaining: 0 }
  if (filled < SNACK_AT) return { type: 'snack', remaining: SNACK_AT - filled }
  return { type: 'drink', remaining: CYCLE - filled }
}

export function rewardLabel(type: RewardType): string {
  return type === 'snack' ? 'FREE snack' : 'FREE drink'
}

export function rewardList(types: RewardType[]): string {
  if (types.length === 0) return ''
  return types.map(rewardLabel).join(' and ')
}

export function progressMessage(stamps: number): string {
  const goal = nextGoal(stamps)
  if (stamps <= 0) return '5 stamps to a FREE snack'
  if (goal.remaining === 0) return 'Reward unlocked! Your FREE drink goes on your next order.'
  const noun = goal.remaining === 1 ? 'stamp' : 'stamps'
  return `${goal.remaining} ${noun} to a ${rewardLabel(goal.type)}`
}

export function toView(input: {
  stamps: number
  orders: number
  pending: RewardType[]
  firstName: string
  referralCode: string
  found?: boolean
}): RewardsView {
  const stamps = Math.max(0, input.stamps)
  const goal = nextGoal(stamps)
  return {
    found: input.found ?? true,
    stamps,
    orders: Math.max(0, input.orders),
    filled: cardFilled(stamps),
    cycle: CYCLE,
    remaining: goal.remaining,
    nextReward: goal.remaining === 0 ? 'drink' : goal.type,
    pending: input.pending,
    message: progressMessage(stamps),
    firstName: input.firstName,
    referralCode: input.referralCode,
  }
}

export function emptyView(): RewardsView {
  return toView({
    stamps: 0,
    orders: 0,
    pending: [],
    firstName: '',
    referralCode: '',
    found: false,
  })
}

export function parsePending(value: string | undefined): RewardType[] {
  if (!value) return []
  return value.split(',').filter((item): item is RewardType => item === 'snack' || item === 'drink')
}

export function serializePending(rewards: RewardType[]): string {
  return rewards.join(',')
}

export function stampsForOrder(ordersAfter: number, baseStamps: number): { earned: number; bonus: boolean } {
  const bonus = ordersAfter > 0 && ordersAfter % CYCLE === 3
  const base = Math.min(MAX_STAMPS_PER_ORDER, Math.max(1, baseStamps))
  return { earned: base + (bonus ? 1 : 0), bonus }
}

export function baseStampsForProduct(name: string, metadataValue: string | undefined): number {
  const explicit = Number.parseInt(metadataValue || '', 10)
  const fromName = /premium/i.test(name) ? 2 : 1
  const fromMetadata = Number.isFinite(explicit) && explicit > 0 ? explicit : 1
  return Math.min(MAX_STAMPS_PER_ORDER, Math.max(fromName, fromMetadata))
}
