"use client"

import React from 'react'
import { RewardType, RewardsView, rewardLabel } from '../../lib/rewards'

interface RewardsCardProps {
  progress: RewardsView
  note?: string | null
}

export default function RewardsCard({ progress, note }: RewardsCardProps) {
  const dots = Array.from({ length: progress.cycle }, (_, index) => index < progress.filled)

  return (
    <div className="rounded-2xl border border-orange-400/40 bg-gradient-to-b from-orange-950/80 to-slate-900 p-4 text-white shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div>
          {progress.firstName ? (
            <p className="text-sm text-orange-200">Hi, {progress.firstName}</p>
          ) : null}
          <h3 className="text-lg font-black tracking-tight">Snaky Rewards</h3>
        </div>
        <p className="text-2xl font-black text-orange-300">
          {progress.filled}
          <span className="text-base font-semibold text-orange-100/80"> / {progress.cycle}</span>
        </p>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5" aria-hidden="true">
        {dots.map((filled, index) => (
          <span
            key={index}
            className={`h-4 w-4 rounded-full ${filled ? 'bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.8)]' : 'border border-white/40 bg-white/10'}`}
          />
        ))}
      </div>

      <p className="mt-3 text-sm font-semibold text-orange-50">{progress.message}</p>

      {progress.pending.length > 0 ? (
        <p className="mt-2 text-sm text-amber-200">
          Ready on your next order: {progress.pending.map((reward: RewardType) => rewardLabel(reward)).join(' and ')}
        </p>
      ) : null}

      {note ? <p className="mt-2 text-sm font-bold text-amber-300">{note}</p> : null}
    </div>
  )
}
