'use server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { getTodayRange } from '@guater/utils'
import type { SupabaseClient } from '@supabase/supabase-js'

export type ActionResult = { success: true } | { success: false; error: string }

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  if (error || !user) throw new Error('Unauthorized')
  return { supabase, user }
}

async function getUserTimezone(supabase: SupabaseClient, userId: string): Promise<string> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', userId)
    .single()
  return profile?.timezone ?? 'UTC'
}

function getTodayRangeExclusive(timezone: string): { start: string; end: string } {
  const { start } = getTodayRange(timezone)
  const { start: nextDayStart } = getTodayRange(timezone, 1)
  return { start, end: nextDayStart }
}
async function getNextSortOrder(
  supabase: SupabaseClient,
  table: string,
  userId: string,
): Promise<number> {
  const { data } = await supabase
    .from(table)
    .select('sort_order')
    .eq('user_id', userId)
    .order('sort_order', { ascending: false })
    .limit(1)
  return data && data.length > 0 ? data[0].sort_order + 1 : 0
}

function assertValidAmount(value: number, label = 'amount'): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${label}: ${value}`)
  }
}

export async function logWater(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const amount = parseInt(formData.get('amount') as string)
    assertValidAmount(amount)
    const { error } = await supabase.from('water_logs').insert({
      user_id: user.id,
      amount_ml: amount,
      source: 'quick',
    })
    if (error) throw new Error(error.message)
    revalidatePath('/')
    revalidateTag(`logs-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function deleteLog(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/')
    revalidateTag(`logs-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function editLog(id: string, amount: number): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    assertValidAmount(amount)
    const { error } = await supabase
      .from('water_logs')
      .update({ amount_ml: amount })
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/')
    revalidateTag(`logs-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function clearAllLogs(): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const timezone = await getUserTimezone(supabase, user.id)
    const { start, end } = getTodayRangeExclusive(timezone)
    const { error } = await supabase
      .from('water_logs')
      .delete()
      .eq('user_id', user.id)
      .gte('logged_at', start)
      .lt('logged_at', end)
    if (error) throw new Error(error.message)
    revalidatePath('/')
    revalidateTag(`logs-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function addPreset(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const label = (formData.get('label') as string)?.trim()
    const amount_ml = parseInt(formData.get('amount_ml') as string)
    if (!label) throw new Error('Label is required')
    assertValidAmount(amount_ml, 'amount_ml')
    const nextOrder = await getNextSortOrder(supabase, 'quick_presets', user.id)
    const { error } = await supabase.from('quick_presets').insert({
      user_id: user.id,
      label,
      amount_ml,
      sort_order: nextOrder,
    })
    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function deletePreset(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase
      .from('quick_presets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()

    const weightKgRaw = formData.get('weight_kg')
    const ageRaw = formData.get('age')
    const displayName = formData.get('display_name')
    const dailyGoalMlRaw = formData.get('daily_goal_ml')
    const preferredUnit = formData.get('preferred_unit')
    const timezone = formData.get('timezone')
    const activityLevel = formData.get('activity_level')
    const climate = formData.get('climate')
    const onboardingCompleted = formData.get('onboarding_completed')

    const weightKg = weightKgRaw ? parseFloat(weightKgRaw as string) : null
    const age = ageRaw ? parseInt(ageRaw as string) : null
    const dailyGoalMl = dailyGoalMlRaw ? parseInt(dailyGoalMlRaw as string) : null

    if (weightKg !== null && !Number.isFinite(weightKg))
      throw new Error('Invalid weight_kg')
    if (age !== null && !Number.isFinite(age))
      throw new Error('Invalid age')
    if (dailyGoalMl !== null && !Number.isFinite(dailyGoalMl))
      throw new Error('Invalid daily_goal_ml')

    const update: Record<string, unknown> = {
      weight_kg: weightKg,
      age,
    }

    if (displayName !== null) update.display_name = displayName as string
    if (dailyGoalMl !== null) update.daily_goal_ml = dailyGoalMl
    if (preferredUnit !== null) update.preferred_unit = preferredUnit as string
    if (timezone !== null) update.timezone = timezone as string
    if (activityLevel !== null) update.activity_level = activityLevel as string
    if (climate !== null) update.climate = climate as string
    if (onboardingCompleted === 'true') update.onboarding_completed = true

    const { error } = await supabase
      .from('profiles')
      .update(update)
      .eq('id', user.id)
    if (error) throw new Error(error.message)

    revalidatePath('/')
    revalidatePath('/settings', 'layout')
    revalidateTag(`profile-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function updateTheme(theme: 'light' | 'dark'): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase
      .from('profiles')
      .update({ theme })
      .eq('id', user.id)
    if (error) throw new Error(error.message)
    revalidateTag(`profile-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function logDiuretic(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const amount_ml = parseInt(formData.get('amount_ml') as string)
    const diuretic_factor = parseFloat(formData.get('diuretic_factor') as string)
    const label = (formData.get('label') as string)?.trim()
    assertValidAmount(amount_ml, 'amount_ml')
    if (!Number.isFinite(diuretic_factor) || diuretic_factor <= 0)
      throw new Error(`Invalid diuretic_factor: ${diuretic_factor}`)
    if (!label) throw new Error('Label is required')
    const { error } = await supabase.from('diuretic_logs').insert({
      user_id: user.id,
      preset_id: (formData.get('preset_id') as string) || null,
      label,
      amount_ml,
      diuretic_factor,
    })
    if (error) throw new Error(error.message)
    revalidatePath('/')
    revalidateTag(`diuretic-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function deleteDiureticLog(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase
      .from('diuretic_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/')
    revalidateTag(`diuretic-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function clearAllDiureticLogs(): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const timezone = await getUserTimezone(supabase, user.id)
    const { start, end } = getTodayRangeExclusive(timezone)
    const { error } = await supabase
      .from('diuretic_logs')
      .delete()
      .eq('user_id', user.id)
      .gte('logged_at', start)
      .lt('logged_at', end)
    if (error) throw new Error(error.message)
    revalidatePath('/')
    revalidateTag(`diuretic-${user.id}`, 'default')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function addDiureticPreset(formData: FormData): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const label = (formData.get('label') as string)?.trim()
    const amount_ml = parseInt(formData.get('amount_ml') as string)
    const diuretic_factor = parseFloat(formData.get('diuretic_factor') as string)
    const color = (formData.get('color') as string)?.trim()
    if (!label) throw new Error('Label is required')
    assertValidAmount(amount_ml, 'amount_ml')
    if (!Number.isFinite(diuretic_factor) || diuretic_factor <= 0)
      throw new Error(`Invalid diuretic_factor: ${diuretic_factor}`)
    const nextOrder = await getNextSortOrder(supabase, 'diuretic_presets', user.id)
    const { error } = await supabase.from('diuretic_presets').insert({
      user_id: user.id,
      label,
      amount_ml,
      diuretic_factor,
      color,
      sort_order: nextOrder,
    })
    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function deleteDiureticPreset(id: string): Promise<ActionResult> {
  try {
    const { supabase, user } = await getAuthenticatedUser()
    const { error } = await supabase
      .from('diuretic_presets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)
    if (error) throw new Error(error.message)
    revalidatePath('/')
    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
