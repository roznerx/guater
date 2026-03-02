import { useEffect, useState, useCallback } from 'react'
import { QuickPreset } from '@guater/types'
import { supabase } from '../supabase'

export function usePresets(userId: string | undefined, refreshKey = 0) {
  const [presets, setPresets] = useState<QuickPreset[]>([])

  const fetch = useCallback(async () => {
    if (!userId) return
    try {
      const { data } = await supabase
        .from('quick_presets')
        .select('id, label, amount_ml')
        .eq('user_id', userId)
        .order('sort_order', { ascending: true })
      setPresets(data as QuickPreset[] ?? [])
    } catch {
      setPresets([])
    }
  }, [userId])

  useEffect(() => { fetch() }, [fetch, refreshKey])

  return { presets, refresh: fetch }
}
