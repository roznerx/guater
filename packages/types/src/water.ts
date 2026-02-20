export interface WaterLog {
  id: string
  user_id: string
  amount_ml: number
  // ISO UTC string
  logged_at: string
  source: 'manual' | 'quick' | 'reminder'
  note?: string
}

export interface DailySummary {
// YYYY-MM-DD in user's timezone
  date: string
  total_ml: number
  goal_ml: number
  percentage: number
  logs: WaterLog[]
}