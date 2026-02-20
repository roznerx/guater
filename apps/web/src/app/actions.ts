'use server'

import { revalidatePath, updateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

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

  updateTag(`logs-${user.id}`)
}

export async function deleteLog(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('water_logs')
    .delete()
    .eq('id', id)

  updateTag(`logs-${user.id}`)
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

  updateTag(`profile-${user.id}`)
  revalidatePath('/settings', 'layout')
}

export async function clearAllLogs() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  await supabase
    .from('water_logs')
    .delete()
    .eq('user_id', user.id)
    .gte('logged_at', startOfDay.toISOString())
    .lt('logged_at', endOfDay.toISOString())

  updateTag(`logs-${user.id}`)
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

  updateTag(`presets-${user.id}`)
}

export async function deletePreset(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('quick_presets')
    .delete()
    .eq('id', id)

  updateTag(`presets-${user.id}`)
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

  updateTag(`logs-${user.id}`)
}