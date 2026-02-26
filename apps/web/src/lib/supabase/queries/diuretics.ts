import { unstable_cache } from 'next/cache'
import type { DiureticLog, DiureticPreset } from '@guater/types'
import { getAuthenticatedClient } from './auth'
import { getTodayRangeForTimezone } from '@/lib/utils'

export async function getTodayDiureticLogs(timezone: string, dayOffset = 0): Promise<DiureticLog[]> {
  const auth = await getAuthenticatedClient()
  if (!auth) return []
  const { supabase, userId } = auth

  return unstable_cache(
    async () => {
      const { start, end } = getTodayRangeForTimezone(timezone, dayOffset)
      const { data, error } = await supabase
        .from('diuretic_logs')
        .select('*')
        .gte('logged_at', start)
        .lt('logged_at', end)
        .order('logged_at', { ascending: false })
      if (error) return []
      return data
    },
    [`diuretic-${userId}-${timezone}-${dayOffset}`],
    { tags: [`diuretic-${userId}`], revalidate: 60 }
  )()
}

export async function getDiureticPresets(): Promise<DiureticPreset[]> {
  const auth = await getAuthenticatedClient()
  if (!auth) return []
  const { supabase, userId } = auth

  const { data, error } = await supabase
    .from('diuretic_presets')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (error) return []
  return data
}