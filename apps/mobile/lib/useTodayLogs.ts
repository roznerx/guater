import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

function getTodayRange(timezone: string): { start: string; end: string } {
  const now = new Date()

  // Get today's date in the target timezone
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)

  const year = parseInt(parts.find(p => p.type === 'year')!.value)
  const month = parseInt(parts.find(p => p.type === 'month')!.value)
  const day = parseInt(parts.find(p => p.type === 'day')!.value)

  const midnight = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
  const tzMidnight = findMidnightUTC(year, month, day, timezone)

  return {
    start: tzMidnight.toISOString(),
    end: new Date(tzMidnight.getTime() + 24 * 60 * 60 * 1000 - 1).toISOString(),
  }
}

function findMidnightUTC(year: number, month: number, day: number, timezone: string): Date {
  let candidate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
  
  for (let offsetHours = -14; offsetHours <= 14; offsetHours++) {
    const test = new Date(Date.UTC(year, month - 1, day, -offsetHours, 0, 0))
    const testParts = new Intl.DateTimeFormat('en-CA', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(test)

    const tYear = parseInt(testParts.find(p => p.type === 'year')!.value)
    const tMonth = parseInt(testParts.find(p => p.type === 'month')!.value)
    const tDay = parseInt(testParts.find(p => p.type === 'day')!.value)
    const tHour = parseInt(testParts.find(p => p.type === 'hour')!.value)
    const tMinute = parseInt(testParts.find(p => p.type === 'minute')!.value)

    if (tYear === year && tMonth === month && tDay === day && tHour === 0 && tMinute === 0) {
      return test
    }
  }

  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0))
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

export function useTodayLogs(userId: string | undefined, timezone: string) {
  const [waterLogs, setWaterLogs] = useState<WaterLog[]>([])
  const [diureticLogs, setDiureticLogs] = useState<DiureticLog[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    console.log('fetch called, userId:', userId, 'timezone:', timezone)
    if (!userId) {
      setLoading(false)
      return
    }

    const tz = timezone || 'UTC'
    const { start, end } = getTodayRange(tz)
    console.log('range start:', start)
    console.log('range end:', end)
    console.log('now UTC:', new Date().toISOString())

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

    console.log('waterRes:', waterRes.data, waterRes.error)
    console.log('diureticRes:', diureticRes.data, diureticRes.error)

    setWaterLogs(waterRes.data ?? [])
    setDiureticLogs(diureticRes.data ?? [])
    setLoading(false)
  }, [userId, timezone])

  useEffect(() => {
    console.log('useEffect, userId:', userId)
    fetch()
  }, [fetch])

  return { waterLogs, diureticLogs, loading, refresh: fetch }
}