export function calculateRecommendedIntake(
  weightKg: number,
  age: number,
  activityLevel: 'sedentary' | 'moderate' | 'active' | 'very_active',
  climate: 'cold' | 'temperate' | 'hot'
): number {
  let intake = weightKg * 35

  const activityBonus: Record<string, number> = {
    sedentary: 0,
    moderate: 300,
    active: 600,
    very_active: 1000,
  }
  intake += activityBonus[activityLevel] ?? 0

  const climateBonus: Record<string, number> = {
    cold: -200,
    temperate: 0,
    hot: 500,
  }
  intake += climateBonus[climate] ?? 0

  if (age > 55) intake *= 0.95

  return Math.round(intake / 50) * 50
}