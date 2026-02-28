import { useEffect, useState } from 'react'
import { supabase } from './supabase'
import type { WaterLog, DiureticLog } from '@guater/types'

export function getTodayRange(timezone: string): { start: string; end: string } {
  const now = new Date()
  
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const [year, month, day] = todayStr.split('-').map(Number)
  
  const startUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  const endUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999))

  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString(),
  }
}

export function useTodayLogs(userId: string | undefined, timezone: string, refreshKey: number) {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [diureticLogs, setDiureticLogs] = useState<DiureticLog[]>([])

  useEffect(() => {
    if (!userId) return

    const { start, end } = getTodayRange(timezone || 'UTC')

    supabase
      .from('water_logs')
      .select('id, amount_ml, logged_at, source')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lt('logged_at', end)
      .order('logged_at', { ascending: false })
      .then(({ data }) => {
        setWaterLogs(data as WaterLog[] ?? [])
      })

    supabase
      .from('diuretic_logs')
      .select('id, label, amount_ml, diuretic_factor, logged_at')
      .eq('user_id', userId)
      .gte('logged_at', start)
      .lt('logged_at', end)
      .order('logged_at', { ascending: false })
      .then(({ data }) => {
        setDiureticLogs(data as DiureticLog[] ?? [])
      })

  }, [userId, timezone, refreshKey])

  return { waterLogs, diureticLogs }
}
