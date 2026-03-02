import { useEffect, useState, useCallback } from 'react'
import { UserProfile } from '@guater/types'
import { supabase } from '../supabase'

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      return
    }
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      setProfile(data)
    } catch {
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { profile, loading, refresh: fetch }
}
