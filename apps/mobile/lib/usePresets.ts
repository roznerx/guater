import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

export interface Preset {
  id: string
  label: string
  amount_ml: number
}

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>([])

  const fetch = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('quick_presets')
      .select('id, label, amount_ml')
      .eq('user_id', user.id)
      .order('sort_order', { ascending: true })

    setPresets(data ?? [])
  }, [])

  useEffect(() => { fetch() }, [fetch])

  return { presets, refresh: fetch }
}