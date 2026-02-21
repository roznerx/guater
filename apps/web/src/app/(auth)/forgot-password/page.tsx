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
        <h1 className="text-2xl font-bold text-blue-deep dark:text-blue-light">
          Reset password
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      {error && (
        <div className="border-2 border-status-error bg-white dark:bg-dark-card text-status-error text-sm px-4 py-3 rounded-xl">
          {decodeURIComponent(error)}
        </div>
      )}

      {message && (
        <div className="border-2 border-teal-core bg-white dark:bg-dark-card text-teal-deep text-sm px-4 py-3 rounded-xl">
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
        <Button type="submit" fullWidth className="mt-1">
          Send reset link
        </Button>
      </form>

      <p className="text-sm text-text-muted dark:text-dark-text-muted text-center">
        <Link href="/login" className="text-blue-core font-semibold hover:text-blue-deep transition-colors">
          Back to login
        </Link>
      </p>
    </div>
  )
}