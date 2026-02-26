import Link from 'next/link'
import { login } from '@/app/actions/auth-actions'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  const { error, message } = await searchParams

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-blue-deep dark:text-blue-light">
          Welcome back
        </h1>
        <p className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
          Log in to your Güater account
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

      {message && (
        <div
          role="alert"
          className="border-2 border-teal-core bg-white dark:bg-dark-card text-teal-deep text-sm px-4 py-3 rounded-xl"
        >
          {decodeURIComponent(message)}
        </div>
      )}

      <form action={login} className="flex flex-col gap-4">
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
          Log in
        </Button>
      </form>

      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm text-text-muted dark:text-dark-text-muted">
          <Link href="/forgot-password" className="text-blue-core font-semibold hover:text-blue-deep transition-colors">
            Forgot your password?
          </Link>
        </p>
        <p className="text-sm text-text-muted dark:text-dark-text-muted">
          Don&apos;t have an account?{' '}
          <Link href="/signup" className="text-blue-core font-semibold hover:text-blue-deep transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
