'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getAuthenticatedClient } from './auth'
import { getUserTimezone } from './utils'
import { getTodayRange } from '@guater/utils'

export async function logDiuretic(formData: FormData) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  const label = formData.get('label') as string
  const amount_ml = parseInt(formData.get('amount_ml') as string)
  const diuretic_factor = parseFloat(formData.get('diuretic_factor') as string)

  if (!label || !amount_ml || amount_ml <= 0 || isNaN(diuretic_factor)) return

  await supabase.from('diuretic_logs').insert({
    user_id: userId,
    preset_id: formData.get('preset_id') as string || null,
    label,
    amount_ml,
    diuretic_factor,
  })

  revalidateTag(`diuretic-${userId}`, 'default')
}

export async function deleteDiureticLog(id: string) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  await supabase
    .from('diuretic_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  revalidateTag(`diuretic-${userId}`, 'default')
}

export async function clearAllDiureticLogs() {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  const timezone = await getUserTimezone(supabase, userId)
  const { start, end } = getTodayRange(timezone)

  await supabase
    .from('diuretic_logs')
    .delete()
    .eq('user_id', userId)
    .gte('logged_at', start)
    .lt('logged_at', end)

  revalidateTag(`diuretic-${userId}`, 'default')
}

export async function addDiureticPreset(formData: FormData) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  const label = formData.get('label') as string
  const amount_ml = parseInt(formData.get('amount_ml') as string)
  const diuretic_factor = parseFloat(formData.get('diuretic_factor') as string)
  const color = formData.get('color') as string

  if (!label || !amount_ml || amount_ml <= 0 || isNaN(diuretic_factor) || !color) return

  const { data: existing } = await supabase
    .from('diuretic_presets')
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0
    ? existing[0].sort_order + 1
    : 0

  await supabase.from('diuretic_presets').insert({
    user_id: userId,
    label,
    amount_ml,
    diuretic_factor,
    color,
    sort_order: nextOrder,
  })

  revalidatePath('/')
}

export async function deleteDiureticPreset(id: string) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  await supabase
    .from('diuretic_presets')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  revalidatePath('/')
}