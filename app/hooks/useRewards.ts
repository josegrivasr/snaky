"use client"

import { useEffect, useState } from 'react'
import { RewardsView, isValidEmail, normalizeEmail } from '../../lib/rewards'

const STORAGE_KEY = 'snaky-rewards-email'

export function rememberRewardsEmail(email: string) {
  rememberCustomer({ email })
}

export function rememberCustomer(order: { email: string; name?: string; apartment?: string }) {
  if (typeof window === 'undefined' || !isValidEmail(order.email)) return
  window.localStorage.setItem(STORAGE_KEY, normalizeEmail(order.email))
  if (order.name?.trim()) window.localStorage.setItem('snaky-rewards-name', order.name.trim())
  if (order.apartment?.trim()) window.localStorage.setItem('snaky-rewards-apartment', order.apartment.trim())
}

export function rememberedRewardsEmail(): string {
  if (typeof window === 'undefined') return ''
  return window.localStorage.getItem(STORAGE_KEY) || ''
}

export function useRewards(email: string) {
  const [progress, setProgress] = useState<RewardsView | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isValidEmail(email)) {
      setProgress(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = window.setTimeout(async () => {
      setLoading(true)
      try {
        const response = await fetch(`/api/rewards?email=${encodeURIComponent(normalizeEmail(email))}`, {
          signal: controller.signal,
        })
        if (!response.ok) {
          setProgress(null)
          return
        }
        const data = await response.json()
        setProgress(data.progress || null)
      } catch (error) {
        if (error instanceof DOMException && error.name === 'AbortError') return
        setProgress(null)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }, 350)

    return () => {
      controller.abort()
      window.clearTimeout(timer)
    }
  }, [email])

  return { progress, loading }
}
