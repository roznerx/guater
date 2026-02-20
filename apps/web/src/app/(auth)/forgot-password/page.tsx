import Link from 'next/link'
import { requestPasswordReset } from '../actions'
import { Button, Input } from '@/components/ui'

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-blue-deep">Reset password</h1>
        <p className="text-text-muted text-sm mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div className="border-2 border-status-error bg-white text-status-error text-sm px-4 py-3 rounded-xl">
          {decodeURIComponent(error)}
        </div>
      )}

      {message && (
        <div className="border-2 border-teal-core bg-white text-teal-deep text-sm px-4 py-3 rounded-xl">
          {decodeURIComponent(message)}
        </div>
      )}

      <form action={requestPasswordReset} className="flex flex-col gap-4">
        <Input
          id="email"
          name="email"
          type="email"
          required
          label="Email"
          placeholder="you@example.com"
        />
        <Button type="submit" fullWidth>
          Send reset link
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center">
        Remember your password?{' '}
        <Link href="/login" className="text-blue-core font-semibold hover:text-blue-deep transition-colors">
          Log in
        </Link>
      </p>

    </div>
  )
}