import Link from 'next/link'
import { signup } from '../actions'
import { Button, Input } from '@/components/ui'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-blue-deep">Create account</h1>
        <p className="text-text-muted text-sm mt-1">
          Start tracking your hydration today
        </p>
      </div>

      {error && (
        <div className="border-2 border-status-error bg-white text-status-error text-sm px-4 py-3 rounded-xl">
          {decodeURIComponent(error)}
        </div>
      )}

      <form action={signup} className="flex flex-col gap-4">
        <Input
          id="display_name"
          name="display_name"
          type="text"
          required
          label="Name"
          placeholder="Your name"
        />
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
          minLength={6}
          label="Password"
          placeholder="••••••••"
          hint="Minimum 6 characters"
        />
        <Button type="submit" fullWidth className="mt-1">
          Create account
        </Button>
      </form>

      <p className="text-sm text-text-muted text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-core font-semibold hover:text-blue-deep transition-colors">
          Log in
        </Link>
      </p>

    </div>
  )
}