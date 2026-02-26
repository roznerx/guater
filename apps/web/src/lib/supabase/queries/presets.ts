import { getAuthenticatedClient } from './auth'

export async function getPresets() {
  const auth = await getAuthenticatedClient()
  if (!auth) return []
  const { supabase, userId } = auth

  const { data, error } = await supabase
    .from('quick_presets')
    .select('*')
    .eq('user_id', userId)
    .order('sort_order', { ascending: true })

  if (error) return []
  return data
}
