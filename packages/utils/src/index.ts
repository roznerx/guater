export type ActivityLevel = 'sedentary' | 'moderate' | 'active' | 'very_active'
export type Climate = 'cold' | 'temperate' | 'hot'

const ACTIVITY_BONUS_ML: Record<ActivityLevel, number> = {
  sedentary: 0,
  moderate: 300,
  active: 600,
  very_active: 1000,
}

const CLIMATE_BONUS_ML: Record<Climate, number> = {
  cold: -200,
  temperate: 0,
  hot: 500,
}

export function calculateRecommendedIntake(
  weightKg: number,
  age: number,
  activityLevel: ActivityLevel,
  climate: Climate,
): number {
  if (weightKg <= 0 || age <= 0) {
    throw new Error(`Invalid input to calculateRecommendedIntake: weightKg=${weightKg}, age=${age}`)
  }
  let intake = weightKg * 35
  intake += ACTIVITY_BONUS_ML[activityLevel]
  intake += CLIMATE_BONUS_ML[climate]
  if (age > 55) intake *= 0.95
  return Math.round(intake / 50) * 50
}

export function getHydrationProgress(
  consumed: number,
  goal: number,
): { percentage: number; remaining: number; overGoal: number } {
  if (goal <= 0) throw new Error('Goal must be greater than 0')
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100)
  const remaining = Math.max(goal - consumed, 0)
  const overGoal = Math.max(consumed - goal, 0)
  return { percentage, remaining, overGoal }
}

function getTimezoneOffsetMs(timezone: string, date: Date): number {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  })
  const parts = Object.fromEntries(fmt.formatToParts(date).map((p) => [p.type, p.value]))
  const localAsUtcMs = Date.UTC(
    parseInt(parts.year),
    parseInt(parts.month) - 1,
    parseInt(parts.day),
    parseInt(parts.hour) % 24,
    parseInt(parts.minute),
    parseInt(parts.second),
  )
  return date.getTime() - localAsUtcMs
}

function shiftDateStr(dateStr: string, dayOffset: number): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  const shifted = new Date(Date.UTC(year, month - 1, day + dayOffset))
  return shifted.toISOString().slice(0, 10)
}

export function getTodayRange(timezone: string, dayOffset = 0): { start: string; end: string } {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const dateStr = dayOffset !== 0 ? shiftDateStr(todayStr, dayOffset) : todayStr
  const [year, month, day] = dateStr.split('-').map(Number)

  const noonUTC = new Date(Date.UTC(year, month - 1, day, 12, 0, 0))
  const offsetMs = getTimezoneOffsetMs(timezone, noonUTC)

  const startUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) + offsetMs)
  const endUTC = new Date(Date.UTC(year, month - 1, day, 23, 59, 59, 999) + offsetMs)

  return {
    start: startUTC.toISOString(),
    end: endUTC.toISOString(),
  }
}

export function getMonthBounds(
  monthOffset: number,
  timezone: string,
): {
  start: Date
  end: Date
  label: string
  daysInMonth: number
  monthStr: string
} {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const [currentYear, currentMonth] = todayStr.split('-').map(Number)

  const target = new Date(Date.UTC(currentYear, currentMonth - 1 + monthOffset, 1))
  const targetYear = target.getUTCFullYear()
  const targetMonth = target.getUTCMonth()
  const daysInMonth = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate()

  const firstNoonUTC = new Date(Date.UTC(targetYear, targetMonth, 1, 12, 0, 0))
  const lastNoonUTC = new Date(Date.UTC(targetYear, targetMonth, daysInMonth, 12, 0, 0))
  const startOffsetMs = getTimezoneOffsetMs(timezone, firstNoonUTC)
  const endOffsetMs = getTimezoneOffsetMs(timezone, lastNoonUTC)

  const startUTC = new Date(Date.UTC(targetYear, targetMonth, 1, 0, 0, 0, 0) + startOffsetMs)
  const endUTC = new Date(
    Date.UTC(targetYear, targetMonth, daysInMonth, 23, 59, 59, 999) + endOffsetMs,
  )

  const monthStr = `${targetYear}-${String(targetMonth + 1).padStart(2, '0')}`

  const labelDate = new Date(Date.UTC(targetYear, targetMonth, 15, 12, 0, 0))
  const label = labelDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: timezone,
  })

  return { start: startUTC, end: endUTC, label, daysInMonth, monthStr }
}
