import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { WaterLog } from '@guater/types'

export function useMonthlyLogs(userId: string | undefined, timezone: string, refreshKey: number = 0) {
  const [logs, setLogs] = useState<WaterLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const now = new Date()
    const from = new Date(now.getTime() - 30 * 86_400_000)
    const fromStr = from.toLocaleDateString('en-CA', { timeZone: timezone })
    const [year, month, day] = fromStr.split('-').map(Number)
    const startUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))

    supabase
      .from('water_logs')
      .select('id, user_id, amount_ml, logged_at, source, created_at')
      .eq('user_id', userId)
      .gte('logged_at', startUTC.toISOString())
      .order('logged_at', { ascending: true })
      .then(({ data }) => {
        setLogs(data as WaterLog[] ?? [])
        setLoading(false)
      })
  }, [userId, timezone, refreshKey])

  return { logs, loading }
}
