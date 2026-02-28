'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTodayRange } from '@guater/utils'

export async function logWater(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const amount = parseInt(formData.get('amount') as string)
  if (!amount || amount <= 0) return

  await supabase.from('water_logs').insert({
    user_id: user.id,
    amount_ml: amount,
    source: 'quick',
  })

  revalidatePath('/')
  revalidateTag(`logs-${user.id}`, 'default')
}

export async function deleteLog(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('water_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidateTag(`logs-${user.id}`, 'default')
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const weightKg = formData.get('weight_kg')
  const age = formData.get('age')

  await supabase
    .from('profiles')
    .update({
      display_name: formData.get('display_name') as string,
      daily_goal_ml: parseInt(formData.get('daily_goal_ml') as string),
      preferred_unit: formData.get('preferred_unit') as string,
      timezone: formData.get('timezone') as string,
      weight_kg: weightKg ? parseFloat(weightKg as string) : null,
      age: age ? parseInt(age as string) : null,
      activity_level: formData.get('activity_level') as string,
      climate: formData.get('climate') as string,
    })
    .eq('id', user.id)

  revalidatePath('/')
  revalidatePath('/settings', 'layout')
  revalidateTag(`profile-${user.id}`, 'default')
}

export async function clearAllLogs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .single()

  const timezone = profile?.timezone ?? 'UTC'
  const { start, end } = getTodayRange(timezone)

  await supabase
    .from('water_logs')
    .delete()
    .eq('user_id', user.id)
    .gte('logged_at', start)
    .lt('logged_at', end)

  revalidatePath('/')
  revalidateTag(`logs-${user.id}`, 'default')
}

export async function addPreset(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const label = formData.get('label') as string
  const amount_ml = parseInt(formData.get('amount_ml') as string)
  if (!label || !amount_ml || amount_ml <= 0) return

  const { data: existing } = await supabase
    .from('quick_presets')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0
    ? existing[0].sort_order + 1
    : 0

  await supabase.from('quick_presets').insert({
    user_id: user.id,
    label,
    amount_ml,
    sort_order: nextOrder,
  })

  revalidatePath('/')
}

export async function deletePreset(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('quick_presets')
    .delete()
    .eq('id', id)

  revalidatePath('/')
}

export async function editLog(id: string, amount: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('water_logs')
    .update({ amount_ml: amount })
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidateTag(`logs-${user.id}`, 'default')
}

export async function updateTheme(theme: 'light' | 'dark') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('profiles')
    .update({ theme })
    .eq('id', user.id)

  revalidateTag(`profile-${user.id}`, 'default')
}

export async function logDiuretic(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('diuretic_logs').insert({
    user_id: user.id,
    preset_id: formData.get('preset_id') as string || null,
    label: formData.get('label') as string,
    amount_ml: parseInt(formData.get('amount_ml') as string),
    diuretic_factor: parseFloat(formData.get('diuretic_factor') as string),
  })

  revalidatePath('/')
  revalidateTag(`diuretic-${user.id}`, 'default')
}

export async function deleteDiureticLog(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('diuretic_logs')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
  revalidateTag(`diuretic-${user.id}`, 'default')
}

export async function addDiureticPreset(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: existing } = await supabase
    .from('diuretic_presets')
    .select('sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0
    ? existing[0].sort_order + 1
    : 0

  await supabase.from('diuretic_presets').insert({
    user_id: user.id,
    label: formData.get('label') as string,
    amount_ml: parseInt(formData.get('amount_ml') as string),
    diuretic_factor: parseFloat(formData.get('diuretic_factor') as string),
    color: formData.get('color') as string,
    sort_order: nextOrder,
  })

  revalidatePath('/')
}

export async function deleteDiureticPreset(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('diuretic_presets')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  revalidatePath('/')
}

export async function clearAllDiureticLogs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', user.id)
    .single()

  const timezone = profile?.timezone ?? 'UTC'
  const { start, end } = getTodayRange(timezone)

  await supabase
    .from('diuretic_logs')
    .delete()
    .eq('user_id', user.id)
    .gte('logged_at', start)
    .lt('logged_at', end)

  revalidatePath('/')
  revalidateTag(`diuretic-${user.id}`, 'default')
}
