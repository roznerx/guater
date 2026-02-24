import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

function getTodayRange(timezone: string) {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzDate = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
  const offset = utcDate.getTime() - tzDate.getTime()
  const startLocal = new Date(`${todayStr}T00:00:00`)
  const endLocal = new Date(`${todayStr}T23:59:59.999`)
  return {
    start: new Date(startLocal.getTime() + offset).toISOString(),
    end: new Date(endLocal.getTime() + offset).toISOString(),
  }
}

export interface WaterLog {
  id: string
  amount_ml: number
  logged_at: string
  source: string
}

export interface DiureticLog {
  id: string
  label: string
  amount_ml: number
  diuretic_factor: number
  logged_at: string
}

export function useTodayLogs(timezone: string) {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [diureticLogs, setDiureticLogs] = useState<DiureticLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || !timezone) return

    const { start, end } = getTodayRange(timezone)

    const [waterRes, diureticRes] = await Promise.all([
      supabase
        .from('water_logs')
        .select('id, amount_ml, logged_at, source')
        .eq('user_id', user.id)
        .gte('logged_at', start)
        .lt('logged_at', end)
        .order('logged_at', { ascending: false }),
      supabase
        .from('diuretic_logs')
        .select('id, label, amount_ml, diuretic_factor, logged_at')
        .eq('user_id', user.id)
        .gte('logged_at', start)
        .lt('logged_at', end)
        .order('logged_at', { ascending: false }),
    ])

    setWaterLogs(waterRes.data ?? [])
    setDiureticLogs(diureticRes.data ?? [])
    setLoading(false)
  }, [timezone])

  useEffect(() => {
    if (timezone) fetch()
  }, [timezone, fetch])

  return { waterLogs, diureticLogs, loading, refresh: fetch }
}