'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function logWater(formData: FormData) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const amount = parseInt(formData.get('amount') as string)
  if (!amount || amount <= 0) return

  await supabase.from('water_logs').insert({
    user_id: user.id,
    amount_ml: amount,
    source: 'quick',
  })

  revalidatePath('/')
}

export async function deleteLog(id: string) {
  const supabase = await createClient()

  await supabase
    .from('water_logs')
    .delete()
    .eq('id', id)

  revalidatePath('/')
}