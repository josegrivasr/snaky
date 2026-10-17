import type { Metadata } from 'next'
import RewardsScreen from './RewardsScreen'

export const metadata: Metadata = {
  title: 'Snaky Rewards',
  description: 'Collect a stamp on every Snaky order. 5 stamps unlock a free snack. 10 stamps unlock a free drink.',
}

export default function RewardsPage() {
  return <RewardsScreen />
}
