'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui'

export default function ResetPasswordClient() {
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [pending, setPending] = useState(false)
  const [accessToken, setAccessToken] = useState('')
  const [refreshToken, setRefreshToken] = useState('')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function init() {
      const hash = window.location.hash
      const params = new URLSearchParams(hash.replace('#', ''))
      const at = params.get('access_token')
      const rt = params.get('refresh_token')

      if (!at || !rt) {
        setError('Reset link is invalid or has expired. Please request a new one.')
        return
      }

      // Store tokens but do NOT create a session yet
      setAccessToken(at)
      setRefreshToken(rt)

      // Clear the hash from URL
      window.history.replaceState(null, '', '/reset-password')

      // Sign out any existing session to prevent auto-login
      await supabase.auth.signOut({ scope: 'global' })

      setReady(true)
    }

    init()
  }, [])

  async function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setPending(true)

    // Now create the session with the stored tokens
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    if (sessionError) {
      setError('Reset link has expired. Please request a new one.')
      setPending(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password })

    if (updateError) {
      setError(updateError.message)
      setPending(false)
      return
    }

    await supabase.auth.signOut({ scope: 'global' })
    window.location.href = '/login?message=Password updated successfully. Please log in.'
  }

  if (error && !ready) {
    return (
      <div className="flex flex-col gap-4">
        <div className="border-2 border-status-error bg-white text-status-error text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
        <a
          href="/forgot-password"
          className="text-sm text-blue-core font-semibold hover:text-blue-deep transition-colors text-center"
        >
          Request a new reset link
        </a>
      </div>
    )
  }

  if (!ready) {
    return (
      <div className="text-sm text-text-muted text-center py-6">
        Verifying your reset link…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div className="border-2 border-status-error bg-white text-status-error text-sm px-4 py-3 rounded-xl">
          {error}
        </div>
      )}

      <form action={handleSubmit} className="flex flex-col gap-4">

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-text-secondary">
            New password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full border-2 border-blue-deep rounded-xl px-3 py-2.5 pr-16 text-sm text-text-primary placeholder:text-text-muted outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <span className="text-xs text-text-muted">Minimum 6 characters</span>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="confirm_password" className="text-sm font-semibold text-text-secondary">
            Confirm password
          </label>
          <div className="relative">
            <input
              id="confirm_password"
              name="confirm_password"
              type={showPassword ? 'text' : 'password'}
              required
              minLength={6}
              placeholder="••••••••"
              className="w-full border-2 border-blue-deep rounded-xl px-3 py-2.5 pr-16 text-sm text-text-primary placeholder:text-text-muted outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          fullWidth
          disabled={pending}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Updating…' : 'Update password'}
        </Button>

      </form>
    </div>
  )
}