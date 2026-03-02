'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function deleteAccount() {
  const supabase = await createClient()

  const { error } = await supabase.rpc('delete_account')
  if (error) throw new Error(error.message)

  await supabase.auth.signOut()
  redirect('/login')
}
