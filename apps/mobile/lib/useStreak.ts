import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { getTodayRange } from '@guater/utils'

export function useStreak(userId: string | undefined, goal: number, timezone: string) {
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    if (!userId || goal <= 0) return

    const { start } = getTodayRange(timezone, -89)
    const { end } = getTodayRange(timezone, 0)

    supabase
      .from('water_logs')
      .select('amount_ml, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lte('logged_at', end)
      .then(({ data }) => {
        if (!data) return

        const byDay: Record<string, number> = {}
        for (const log of data) {
          const day = new Date(log.logged_at).toLocaleDateString('en-CA', { timeZone: timezone })
          byDay[day] = (byDay[day] ?? 0) + log.amount_ml
        }

        let count = 0
        let offset = 0
        while (true) {
          const { start: s } = getTodayRange(timezone, offset)
          const day = new Date(s).toLocaleDateString('en-CA', { timeZone: timezone })
          if ((byDay[day] ?? 0) >= goal) {
            count++
            offset--
          } else {
            break
          }
        }

        setStreak(count)
      })
  }, [userId, goal, timezone])

  return streak
}
