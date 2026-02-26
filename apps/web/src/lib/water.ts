import { unstable_cache } from 'next/cache'
import type { DiureticLog, DiureticPreset, WaterLog } from '@guater/types'
import { createClient } from '@/lib/supabase/server'
import { getTimezoneOffset, getTodayRangeForTimezone } from './utils'

export async function getProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) return null
      return data
    },
    [`profile-${user.id}`],
    { tags: [`profile-${user.id}`], revalidate: 300 }
  )()
}

export async function getTodayLogs(timezone: string): Promise<WaterLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return unstable_cache(
    async () => {
      const { start, end } = getTodayRangeForTimezone(timezone)

      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .gte('logged_at', start)
        .lt('logged_at', end)
        .order('logged_at', { ascending: false })

      if (error) return []
      return data
    },
    [`logs-${user.id}`],
    { tags: [`logs-${user.id}`], revalidate: 60 }
  )()
}

export async function getWeeklyLogs(): Promise<WaterLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .gte('logged_at', sevenDaysAgo.toISOString())
    .order('logged_at', { ascending: false })

  if (error) return []
  return data
}

export async function getStreak(goal: number, timezone: string): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  return unstable_cache(
    async () => {
      const now = new Date()
      const offset = getTimezoneOffset(now, timezone)
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)

      const { data, error } = await supabase
        .from('water_logs')
        .select('logged_at, amount_ml')
        .gte('logged_at', cutoff.toISOString())
        .order('logged_at', { ascending: false })

      if (error || !data) return 0

      const byDay: Record<string, number> = {}
      for (const log of data) {
        const localDate = new Date(new Date(log.logged_at).getTime() - offset)
        const dayStr = localDate.toLocaleDateString('en-CA')
        byDay[dayStr] = (byDay[dayStr] ?? 0) + log.amount_ml
      }

      let streak = 0
      const todayStr = new Date(now.getTime() - offset).toLocaleDateString('en-CA')

      for (let i = 0; i < 90; i++) {
        const date = new Date(now.getTime() - offset)
        date.setDate(date.getDate() - i)
        const dayStr = date.toLocaleDateString('en-CA')
        if (dayStr === todayStr && (byDay[dayStr] ?? 0) < goal) break
        if ((byDay[dayStr] ?? 0) >= goal) {
          streak++
        } else {
          break
        }
      }

      return streak
    },
    [`streak-${user.id}`],
    { tags: [`logs-${user.id}`], revalidate: 300 }
  )()
}

export async function getPresets() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('quick_presets')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) return []
  return data
}

export async function getMonthlyLogs(timezone: string): Promise<Pick<WaterLog, 'logged_at' | 'amount_ml'>[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const offset = getTimezoneOffset(now, timezone)
  const startLocal = new Date(`${todayStr}T00:00:00`)
  startLocal.setDate(startLocal.getDate() - 29)
  const start = new Date(startLocal.getTime() + offset)

  const { data, error } = await supabase
    .from('water_logs')
    .select('logged_at, amount_ml')
    .gte('logged_at', start.toISOString())
    .order('logged_at', { ascending: true })

  if (error) return []
  return data
}

export async function getTodayDiureticLogs(timezone: string): Promise<DiureticLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return unstable_cache(
    async () => {
      const { start, end } = getTodayRangeForTimezone(timezone)

      const { data, error } = await supabase
        .from('diuretic_logs')
        .select('*')
        .gte('logged_at', start)
        .lt('logged_at', end)
        .order('logged_at', { ascending: false })

      if (error) return []
      return data
    },
    [`diuretic-${user.id}`],
    { tags: [`diuretic-${user.id}`], revalidate: 60 }
  )()
}

export async function getDiureticPresets(): Promise<DiureticPreset[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('diuretic_presets')
    .select('*')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  if (error) return []
  return data
}

