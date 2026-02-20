export interface UserProfile {
  id: string
  display_name: string
  weight_kg?: number
  daily_goal_ml: number
  preferred_unit: 'ml' | 'oz'
  reminder_enabled: boolean
  reminder_interval_hours: number
  timezone: string
  created_at: string
}

export interface QuickAddPreset {
  id: string
  user_id: string
  label: string
  amount_ml: number
  icon?: string
}