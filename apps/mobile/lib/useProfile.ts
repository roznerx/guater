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

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data: { user }, error } = await supabase.auth.getUser()
      console.log('user:', user?.id, 'error:', error)
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      setProfile(data)
      setLoading(false)
    }
    fetch()
  }, [])

  return { profile, loading }
}