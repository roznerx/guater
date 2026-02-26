'use client'
import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const REFRESH_COOLDOWN_MS = 5000

export default function RefreshOnFocus() {
  const router = useRouter()
  const lastRefresh = useRef<number>(0)

  useEffect(() => {
    function handleFocus() {
      const now = Date.now()
      if (now - lastRefresh.current < REFRESH_COOLDOWN_MS) return
      lastRefresh.current = now
      router.refresh()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [router])

  return null
}
