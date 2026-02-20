import { createClient } from '@/lib/supabase/server'

export async function getTodayLogs() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const endOfDay = new Date(startOfDay)
  endOfDay.setDate(endOfDay.getDate() + 1)

  const { data, error } = await supabase
    .from('water_logs')
    .select('*')
    .gte('logged_at', startOfDay.toISOString())
    .lt('logged_at', endOfDay.toISOString())
    .order('logged_at', { ascending: false })

  if (error) return []
  return data
}

export async function getProfile() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data
}