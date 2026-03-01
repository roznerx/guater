'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { getAuthenticatedClient } from './auth'

export async function updateProfile(formData: FormData) {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  const weightKg = formData.get('weight_kg')
  const age = formData.get('age')
  const onboardingCompleted = formData.get('onboarding_completed')

  await supabase
    .from('profiles')
    .update({
      display_name:          formData.get('display_name') as string,
      daily_goal_ml:         parseInt(formData.get('daily_goal_ml') as string),
      preferred_unit:        formData.get('preferred_unit') as string,
      timezone:              formData.get('timezone') as string,
      weight_kg:             weightKg ? parseFloat(weightKg as string) : null,
      age:                   age ? parseInt(age as string) : null,
      activity_level:        formData.get('activity_level') as string,
      climate:               formData.get('climate') as string,
      ...(onboardingCompleted === 'true' && { onboarding_completed: true }),
    })
    .eq('id', userId)

  revalidatePath('/', 'layout')
  revalidateTag(`profile-${userId}`, 'default')
}

export async function updateTheme(theme: 'light' | 'dark') {
  const auth = await getAuthenticatedClient()
  if (!auth) return
  const { supabase, userId } = auth

  await supabase
    .from('profiles')
    .update({ theme })
    .eq('id', userId)

  revalidateTag(`profile-${userId}`, 'default')
}
