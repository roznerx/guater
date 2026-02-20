'use server'

import { updateTag } from 'next/cache'
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

  await supabase
    .from('profiles')
    .update({
      display_name: formData.get('display_name') as string,
      daily_goal_ml: parseInt(formData.get('daily_goal_ml') as string),
      preferred_unit: formData.get('preferred_unit') as string,
      timezone: formData.get('timezone') as string,
    })
    .eq('id', user.id)

  updateTag(`profile-${user.id}`)
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