import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import { getTodayRange } from '@guater/utils'
import type { WaterLog, DiureticLog } from '@guater/types'

export { getTodayRange }

export function useTodayLogs(
  userId: string | undefined,
  timezone: string,
  refreshKey: number,
  dayOffset = 0
) {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [diureticLogs, setDiureticLogs] = useState<DiureticLog[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setWaterLogs([])
    setDiureticLogs([])
    if (!userId) return

    setLoading(true)
    const { start, end } = getTodayRange(timezone || 'UTC', dayOffset)

    Promise.all([
      supabase
        .from('water_logs')
        .select('id, amount_ml, logged_at, source')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lt('logged_at', end)
        .order('logged_at', { ascending: false }),
      supabase
        .from('diuretic_logs')
        .select('id, label, amount_ml, diuretic_factor, logged_at')
        .eq('user_id', userId)
        .gte('logged_at', start)
        .lt('logged_at', end)
        .order('logged_at', { ascending: false }),
    ]).then(([waterRes, diureticRes]) => {
      setWaterLogs((waterRes.data as WaterLog[]) ?? [])
      setDiureticLogs((diureticRes.data as DiureticLog[]) ?? [])
      setLoading(false)
    })
  }, [userId, timezone, refreshKey, dayOffset])

  return { waterLogs, diureticLogs, loading }
}
