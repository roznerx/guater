
export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string  // ISO UTC string
  source: 'manual' | 'quick' | 'reminder'
  note?: string
  created_at: string
}

export interface UserProfile {
  id: string
  display_name?: string
  daily_goal_ml: number
  timezone: string
  weight_kg?: number | null
  age?: number | null
  activity_level?: 'sedentary' | 'moderate' | 'active' | 'very_active' | null
  climate?: 'cold' | 'temperate' | 'hot' | null
  preferred_unit: 'ml' | 'oz'
  theme?: string | null
  reminder_enabled?: boolean
  reminder_interval_hours?: number
  created_at?: string
}

export interface DailySummary {
  date: string  // YYYY-MM-DD in user's timezone
  total_ml: number
  goal_ml: number
  percentage: number
  logs: WaterLog[]
}

export interface QuickPreset {
  id: string
  user_id: string
  label: string
  amount_ml: number
  icon?: string
  sort_order: number
}

export interface DiureticLog {
  id: string
  user_id: string
  preset_id?: string
  label: string
  amount_ml: number
  diuretic_factor: number
  logged_at: string
  created_at: string
}

export interface DiureticPreset {
  id: string
  user_id: string
  label: string
  amount_ml: number
  diuretic_factor: number
  color: string
  sort_order: number
}
