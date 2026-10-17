"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import RewardsCard from './RewardsCard'
import { rememberedRewardsEmail, useRewards } from '../hooks/useRewards'

export default function RewardsBanner() {
  const [email, setEmail] = useState('')
  const { progress } = useRewards(email)

  useEffect(() => {
    setEmail(rememberedRewardsEmail())
  }, [])

  if (progress?.found) {
    return (
      <div className="mx-auto mb-4 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
        <Link href="/rewards" className="block">
          <RewardsCard progress={progress} />
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto mb-4 w-full max-w-4xl px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl border border-orange-400/40 bg-gradient-to-r from-orange-600 to-amber-500 p-5 text-white shadow-lg">
        <p className="text-sm font-bold uppercase tracking-wide text-orange-100">Snaky Rewards</p>
        <h2 className="mt-1 text-2xl font-black">Buy. Collect. Enjoy.</h2>
        <p className="mt-1 text-sm text-orange-50">Every purchase counts. Your email is your stamp card.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold">5 stamps: a FREE snack. 10 stamps: a FREE drink.</p>
          <Link
            href="/rewards"
            className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2.5 text-sm font-black text-orange-700 hover:bg-orange-50"
          >
            Create my free account
          </Link>
        </div>
      </div>
    </div>
  )
}
