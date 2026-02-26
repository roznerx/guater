'use client'

import { useEffect, useMemo, useRef, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function ResetPasswordClient() {
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isPending, startTransition] = useTransition()

  const supabase = useMemo(() => createClient(), [])

  const accessTokenRef = useRef('')
  const refreshTokenRef = useRef('')

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

      accessTokenRef.current = at
      refreshTokenRef.current = rt

      window.history.replaceState(null, '', '/reset-password')
      await supabase.auth.signOut({ scope: 'global' })

      setReady(true)
    }

    init()
  }, [supabase])

  function handleSubmit(formData: FormData) {
    const password = formData.get('password') as string
    const confirm = formData.get('confirm_password') as string

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setError('')

    startTransition(async () => {
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessTokenRef.current,
        refresh_token: refreshTokenRef.current,
      })

      if (sessionError) {
        setError('Reset link has expired. Please request a new one.')
        return
      }

      const { error: updateError } = await supabase.auth.updateUser({ password })

      if (updateError) {
        setError(updateError.message)
        return
      }

      await supabase.auth.signOut({ scope: 'global' })
      window.location.href = '/login?message=Password updated successfully. Please log in.'
    })
  }

  const ShowHideToggle = (
    <button
      type="button"
      onClick={() => setShowPassword(v => !v)}
      className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer"
      aria-label={showPassword ? 'Hide password' : 'Show password'}
    >
      {showPassword ? 'Hide' : 'Show'}
    </button>
  )

  if (error && !ready) {
    return (
      <div className="flex flex-col gap-4">
        <div
          role="alert"
          className="border-2 border-status-error bg-white dark:bg-dark-card text-status-error text-sm px-4 py-3 rounded-xl"
        >
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
      <div className="text-sm text-text-muted dark:text-dark-text-muted text-center py-6">
        Verifying your reset link…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {error && (
        <div
          role="alert"
          className="border-2 border-status-error bg-white dark:bg-dark-card text-status-error text-sm px-4 py-3 rounded-xl"
        >
          {error}
        </div>
      )}

      <form action={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          label="New password"
          placeholder="••••••••"
          hint="Minimum 6 characters"
          suffix={ShowHideToggle}
          disabled={isPending}
        />
        <Input
          id="confirm_password"
          name="confirm_password"
          type={showPassword ? 'text' : 'password'}
          required
          minLength={6}
          label="Confirm password"
          placeholder="••••••••"
          suffix={ShowHideToggle}
          disabled={isPending}
        />
        <Button type="submit" fullWidth disabled={isPending}>
          {isPending ? 'Updating…' : 'Update password'}
        </Button>
      </form>
    </div>
  )
}
