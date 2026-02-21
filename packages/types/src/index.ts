export * from './water'
export * from './user'

export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  logged_at: string
  source: 'manual' | 'quick' | 'reminder'
  note?: string
  created_at: string
}

export interface UserProfile {
  id: string
  display_name?: string
  daily_goal_ml: number
  preferred_unit: string
  timezone: string
  weight_kg?: number | null
  age?: number | null
  activity_level?: string | null
  climate?: string | null
  theme?: string | null
}

export interface DailySummary {
  date: string
  total_ml: number
  goal_ml: number
  percentage: number
  logs: WaterLog[]
}

export interface QuickAddPreset {
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