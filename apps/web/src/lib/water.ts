import { unstable_cache } from 'next/cache'
import type { DiureticLog, DiureticPreset, WaterLog } from '@guater/types'
import { createClient } from '@/lib/supabase/server'
import { getTodayRangeForTimezone } from './utils'

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
    { tags: [`profile-${user.id}`] }
  )()
}

export async function getTodayLogs(): Promise<WaterLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .single()

  const timezone = profile?.timezone ?? 'UTC'
  const { start, end } = getTodayRangeForTimezone(timezone)

  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .gte('logged_at', start)
    .lt('logged_at', end)
    .order('logged_at', { ascending: false })

  if (error) return []
  return data
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

export async function getStreak(goalMl: number): Promise<number> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return 0

  return unstable_cache(
    async () => {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('water_logs')
        .select('amount_ml, logged_at')
        .gte('logged_at', thirtyDaysAgo.toISOString())
        .order('logged_at', { ascending: false })

      if (error || !data) return 0

      const byDay: Record<string, number> = {}
      for (const log of data) {
        const day = new Date(log.logged_at).toLocaleDateString('en-CA')
        byDay[day] = (byDay[day] ?? 0) + log.amount_ml
      }

      let streak = 0
      const today = new Date()

      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(date.getDate() - i)
        const key = date.toLocaleDateString('en-CA')

        if ((byDay[key] ?? 0) >= goalMl) {
          streak++
        } else {
          if (i === 0) continue
          break
        }
      }

      return streak
    },
    [`streak-${user.id}`],
    { tags: [`logs-${user.id}`] }
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

export async function getMonthlyLogs(): Promise<WaterLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .gte('logged_at', thirtyDaysAgo.toISOString())
    .order('logged_at', { ascending: true })

  if (error) return []
  return data
}

export async function getTodayDiureticLogs(): Promise<DiureticLog[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .single()

  const timezone = profile?.timezone ?? 'UTC'
  const { start, end } = getTodayRangeForTimezone(timezone)

  const { data, error } = await supabase
    .from('diuretic_logs')
    .select('*')
    .gte('logged_at', start)
    .lt('logged_at', end)
    .order('logged_at', { ascending: false })

  if (error) return []
  return data
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

