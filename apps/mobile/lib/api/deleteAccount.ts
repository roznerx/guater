import { supabase } from "../supabase"

export async function deleteAccount(): Promise<{ error: string | null }> {
  try {
    const { error: rpcError } = await supabase.rpc('delete_account')
    if (rpcError) return { error: rpcError.message }

    try {
      await supabase.auth.signOut()
    } catch (error) {
      console.log(error)
    }
    return { error: null }
  } catch {
    return { error: 'Something went wrong. Please try again.' }
  }
}
