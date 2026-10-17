"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import RewardsCard from '../components/RewardsCard'
import { rememberRewardsEmail, rememberedRewardsEmail, useRewards } from '../hooks/useRewards'
import { RewardsView, isValidEmail } from '../../lib/rewards'

const MONTHS = [
  ['01', 'Jan'], ['02', 'Feb'], ['03', 'Mar'], ['04', 'Apr'],
  ['05', 'May'], ['06', 'Jun'], ['07', 'Jul'], ['08', 'Aug'],
  ['09', 'Sep'], ['10', 'Oct'], ['11', 'Nov'], ['12', 'Dec'],
]

export default function RewardsScreen() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [month, setMonth] = useState('')
  const [day, setDay] = useState('')
  const [referralCode, setReferralCode] = useState('')
  const [saved, setSaved] = useState<RewardsView | null>(null)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const { progress } = useRewards(email)

  useEffect(() => {
    const stored = rememberedRewardsEmail()
    if (stored) setEmail(stored)
    const storedName = window.localStorage.getItem('snaky-rewards-name') || ''
    if (storedName) setName(storedName)
  }, [])

  const visible = saved?.found ? saved : progress

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    if (!name.trim() || !isValidEmail(email)) {
      setError('Name and a valid email are required.')
      return
    }
    if ((month && !day) || (!month && day)) {
      setError('Choose both a month and a day, or leave birthday blank.')
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          name,
          phone,
          birthday: month && day ? `${month}-${day.padStart(2, '0')}` : '',
          referralCode,
        }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || 'Could not save your card')
        return
      }
      rememberRewardsEmail(email)
      setSaved(data.progress)
    } catch {
      setError('Could not save your card')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4 py-8 text-white">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm font-semibold text-orange-300 hover:text-orange-200">
          Back to the shop
        </Link>
        <h1 className="mt-4 text-4xl font-black">Snaky Rewards</h1>
        <p className="mt-2 text-gray-300">
          Your email is your stamp card. Paid orders add a stamp on their own. Nothing to scan.
        </p>

        {visible?.found ? <div className="mt-6"><RewardsCard progress={visible} /></div> : null}

        <form onSubmit={save} className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white p-6 text-gray-900">
          <h2 className="text-2xl font-black">Create my free account</h2>
          <label className="block text-sm font-semibold">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              placeholder="Your name"
            />
          </label>
          <label className="block text-sm font-semibold">
            Email
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              placeholder="you@email.com"
            />
          </label>
          <label className="block text-sm font-semibold">
            Phone, optional
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              placeholder="555-0100"
            />
          </label>
          <div>
            <p className="text-sm font-semibold">Birthday, optional</p>
            <div className="mt-1 grid grid-cols-2 gap-2">
              <select
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <option value="">Month</option>
                {MONTHS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <select
                value={day}
                onChange={(event) => setDay(event.target.value)}
                className="rounded-xl border border-gray-200 bg-gray-50 px-3 py-2"
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, index) => String(index + 1)).map((value) => (
                  <option key={value} value={value}>{value}</option>
                ))}
              </select>
            </div>
            <p className="mt-1 text-xs text-gray-500">A stamp on your birthday, after the date has been saved.</p>
          </div>
          <label className="block text-sm font-semibold">
            Friend&apos;s code, optional
            <input
              value={referralCode}
              onChange={(event) => setReferralCode(event.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 uppercase"
              placeholder="ABC123"
            />
          </label>
          {error ? <p className="text-sm font-semibold text-red-600">{error}</p> : null}
          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-xl bg-orange-600 py-3 font-black text-white hover:bg-orange-700 disabled:bg-gray-300"
          >
            {saving ? 'Saving...' : 'Save my card'}
          </button>
        </form>

        {visible?.referralCode ? (
          <div className="mt-6 rounded-2xl border border-orange-400/30 bg-orange-950/40 p-4">
            <p className="text-sm font-bold text-orange-200">Invite a friend</p>
            <p className="mt-1 text-3xl font-black tracking-widest">{visible.referralCode}</p>
            <p className="mt-2 text-sm text-orange-50">
              They enter your code. You get 2 stamps when their first order is paid.
            </p>
          </div>
        ) : null}

        <ul className="mt-6 space-y-2 text-sm text-gray-300">
          <li>Each paid order adds 1 stamp.</li>
          <li>Premium orders add 2 stamps.</li>
          <li>5 stamps: a free snack on the next order. 10 stamps: a free drink. Then the card starts again.</li>
        </ul>
      </div>
    </div>
  )
}
