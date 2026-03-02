import { unstable_cache } from 'next/cache'
import type { WaterLog } from '@guater/types'
import { getAuthenticatedClient } from './auth'
import { getTodayRange } from '@guater/utils'
import { getTimezoneOffset } from '@/lib/utils'

export async function getTodayLogs(timezone: string, dayOffset = 0): Promise<WaterLog[]> {
  const auth = await getAuthenticatedClient()
  if (!auth) return []
  const { supabase, userId } = auth

  return unstable_cache(
    async () => {
      const { start, end } = getTodayRange(timezone, dayOffset)
      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .gte('logged_at', start)
        .lt('logged_at', end)
        .order('logged_at', { ascending: false })
      if (error) return []
      return data
    },
    [`logs-${userId}-${timezone}-${dayOffset}`],
    { tags: [`logs-${userId}`], revalidate: 60 }
  )()
}

export async function getWeeklyLogs(timezone: string): Promise<WaterLog[]> {
  const auth = await getAuthenticatedClient()
  if (!auth) return []
  const { supabase, userId } = auth

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const offset = getTimezoneOffset(sevenDaysAgo, timezone)
  const start = new Date(sevenDaysAgo.setHours(0, 0, 0, 0) - offset)

  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('water_logs')
        .select('*')
        .gte('logged_at', start.toISOString())
        .order('logged_at', { ascending: false })
      if (error) return []
      return data
    },
    [`weekly-${userId}-${timezone}`],
    { tags: [`logs-${userId}`], revalidate: 120 }
  )()
}

export async function getMonthlyLogs(
  timezone: string,
  start: Date,
  end: Date
): Promise<Pick<WaterLog, 'logged_at' | 'amount_ml'>[]> {
  const auth = await getAuthenticatedClient()
  if (!auth) return []
  const { supabase, userId } = auth

  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('water_logs')
        .select('logged_at, amount_ml')
        .gte('logged_at', start.toISOString())
        .lte('logged_at', end.toISOString())
        .order('logged_at', { ascending: true })
      if (error) return []
      return data
    },
    [`monthly-${userId}-${timezone}-${start.toISOString().slice(0, 7)}`],
    { tags: [`logs-${userId}`], revalidate: 300 }
  )()
}

export async function getStreak(goal: number, timezone: string): Promise<number> {
  const auth = await getAuthenticatedClient()
  if (!auth) return 0
  const { supabase, userId } = auth

  return unstable_cache(
    async () => {
      const now = new Date()
      const cutoff = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
      const offset = getTimezoneOffset(now, timezone)

      const { data, error } = await supabase
        .from('water_logs')
        .select('logged_at, amount_ml')
        .gte('logged_at', cutoff.toISOString())
        .order('logged_at', { ascending: false })

      if (error || !data) return 0

      const byDay: Record<string, number> = {}
      for (const log of data) {
        const localDate = new Date(new Date(log.logged_at).getTime() + offset)
        const dayStr = localDate.toLocaleDateString('en-CA')
        byDay[dayStr] = (byDay[dayStr] ?? 0) + log.amount_ml
      }

      const todayStr = new Date(now.getTime() + offset).toLocaleDateString('en-CA')

      let streak = 0
      for (let i = 0; i < 90; i++) {
        const date = new Date(now.getTime() + offset)
        date.setDate(date.getDate() - i)
        const dayStr = date.toLocaleDateString('en-CA')

        if (dayStr === todayStr && (byDay[dayStr] ?? 0) < goal) continue
        if ((byDay[dayStr] ?? 0) >= goal) {
          streak++
        } else {
          break
        }
      }

      return streak
    },
    [`streak-${userId}-${goal}-${timezone}`],
    { tags: [`logs-${userId}`], revalidate: 300 }
  )()
}
