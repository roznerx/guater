const ACTIVITY_BONUS_ML: Record<string, number> = {
  sedentary: 0,
  moderate: 300,
  active: 600,
  very_active: 1000,
}

const CLIMATE_BONUS_ML: Record<string, number> = {
  cold: -200,
  temperate: 0,
  hot: 500,
}

export function calculateRecommendedIntake(
  weightKg: number,
  age: number,
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'very_active',
  climate: 'cold' | 'temperate' | 'hot'
): number {
  if (weightKg <= 0 || age <= 0) {
    throw new Error(`Invalid input to calculateRecommendedIntake: weightKg=${weightKg}, age=${age}`)
  }

  let intake = weightKg * 35
  intake += ACTIVITY_BONUS_ML[activityLevel] ?? 0
  intake += CLIMATE_BONUS_ML[climate] ?? 0

  if (age > 55) intake *= 0.95

  return Math.round(intake / 50) * 50
}

export function getHydrationProgress(consumed: number, goal: number) {
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100)
  const remaining = Math.max(goal - consumed, 0)
  const overGoal = Math.max(consumed - goal, 0)
  return { percentage, remaining, overGoal }
}
