'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getTodayRangeForTimezone } from '@/lib/utils'
import { getAuthenticatedClient } from './auth'
import { getUserTimezone } from './utils'

export async function logWater(formData: FormData) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  const amount = parseInt(formData.get('amount') as string)
  if (!amount || amount <= 0) return

  await supabase.from('water_logs').insert({
    user_id: userId,
    amount_ml: amount,
    source: 'quick',
  })

  revalidateTag(`logs-${userId}`, 'default')
}

export async function deleteLog(id: string) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  await supabase
    .from('water_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  revalidateTag(`logs-${userId}`, 'default')
}

export async function editLog(id: string, amount: number) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  await supabase
    .from('water_logs')
    .update({ amount_ml: amount })
    .eq('id', id)
    .eq('user_id', userId)

  revalidateTag(`logs-${userId}`, 'default')
}

export async function clearAllLogs() {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  const timezone = await getUserTimezone(supabase, userId)
  const { start, end } = getTodayRangeForTimezone(timezone)

  await supabase
    .from('water_logs')
    .delete()
    .eq('user_id', userId)
    .gte('logged_at', start)
    .lt('logged_at', end)

  revalidateTag(`logs-${userId}`, 'default')
}

export async function addPreset(formData: FormData) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  const label = formData.get('label') as string
  const amount_ml = parseInt(formData.get('amount_ml') as string)
  if (!label || !amount_ml || amount_ml <= 0) return

  const { data: existing } = await supabase
    .from('quick_presets')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0
    ? existing[0].sort_order + 1
    : 0

  await supabase.from('quick_presets').insert({
    user_id: userId,
    label,
    amount_ml,
    sort_order: nextOrder,
  })

  revalidatePath('/')
}

export async function deletePreset(id: string) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  await supabase
    .from('quick_presets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  revalidatePath('/')
}
