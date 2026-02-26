import type { SupabaseClient } from '@supabase/supabase-js'

export async function getUserTimezone(
  supabase: SupabaseClient,
  userId: string
): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', userId)
    .single()
  return data?.timezone ?? 'UTC'
}
