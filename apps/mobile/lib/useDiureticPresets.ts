import { useEffect, useState, useCallback } from 'react'
import { supabase } from './supabase'
import type { DiureticPreset } from '@guater/types'

export function useDiureticPresets(userId: string | undefined) {
  const [presets, setPresets] = useState<DiureticPreset[]>([])

  const fetch = useCallback(async () => {
    if (!userId) return
    try {
      const { data } = await supabase
        .from('diuretic_presets')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
      setPresets(data as DiureticPreset[] ?? [])
    } catch {
      setPresets([])
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch])

  return { presets, refresh: fetch }
}
