import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import { DiureticLog, WaterLog } from '@guater/types';

function getTodayRange(timezone: string): { start: string; end: string } {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })

  function toUTCISO(dateStr: string, timeStr: string): string {
    const localDate = new Date(`${dateStr}T${timeStr}`)
    const utc = new Date(localDate.toLocaleString('en-US', { timeZone: 'UTC' }))
    const local = new Date(localDate.toLocaleString('en-US', { timeZone: timezone }))
    const offsetMs = local.getTime() - utc.getTime()
    return new Date(localDate.getTime() - offsetMs).toISOString()
  }

  return {
    start: toUTCISO(todayStr, '00:00:00.000'),
    end: toUTCISO(todayStr, '23:59:59.999'),
  }
}

export function useTodayLogs(userId: string | undefined, timezone: string) {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [diureticLogs, setDiureticLogs] = useState<DiureticLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }

    const { start, end } = getTodayRange(timezone || 'UTC')

    const [waterRes, diureticRes] = await Promise.all([
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
    ])

    setWaterLogs(waterRes.data as WaterLog[] ?? [])
    setDiureticLogs(diureticRes.data as DiureticLog[] ?? [])
    setLoading(false)
  }, [userId, timezone])

  useEffect(() => { fetch() }, [fetch])

  return { waterLogs, diureticLogs, loading, refresh: fetch }
}
