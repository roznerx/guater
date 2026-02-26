import { unstable_cache } from 'next/cache'
import { getAuthenticatedClient } from './auth'

export async function getProfile() {
  const auth = await getAuthenticatedClient()
  if (!auth) return null
  const { supabase, userId } = auth

  return unstable_cache(
    async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) return null
      return data
    },
    [`profile-${userId}`],
    { tags: [`profile-${userId}`], revalidate: 300 }
  )()
}
