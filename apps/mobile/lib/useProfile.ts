import { useEffect, useState } from 'react'
import { supabase } from './supabase'

export interface Profile {
  id: string
  display_name: string | null
  daily_goal_ml: number
  preferred_unit: string
  timezone: string
  theme: string | null
}

export function useProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    async function fetch() {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      setProfile(data)
      setLoading(false)
    }

    fetch()
  }, [userId])

  return { profile, loading }
}