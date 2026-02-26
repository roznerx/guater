import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'

export interface Preset {
  id: string
  label: string
  amount_ml: number
}

export function usePresets(userId: string | undefined) {
  const [presets, setPresets] = useState<Preset[]>([])

  const fetch = useCallback(async () => {
    if (!userId) return

    const { data } = await supabase
      .from('quick_presets')
      .select('id, label, amount_ml')
      .eq('user_id', userId)
      .order('sort_order', { ascending: true })

    setPresets(data ?? [])
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { presets, refresh: fetch }
}