import Link from 'next/link'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { signup } from '@/app/actions/auth-actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-deep dark:text-blue-light">
          Create account
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
          Start tracking your hydration
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="border-2 border-status-error bg-white dark:bg-dark-card text-status-error text-sm px-4 py-3 rounded-xl"
        >
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={signup} className="flex flex-col gap-4">
        <Input
          id="email"
          name="email"
          type="email"
          required
          label="Email"
          placeholder="you@example.com"
        />
        <Input
          id="password"
          name="password"
          type="password"
          required
          label="Password"
          placeholder="••••••••"
        />
        <Button type="submit" fullWidth className="mt-1">
          Sign up
        </Button>
      </form>

      <p className="text-sm text-text-muted dark:text-dark-text-muted text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-core font-semibold hover:text-blue-deep transition-colors">
          Log in
        </Link>
      </p>
    </div>
  )
}
