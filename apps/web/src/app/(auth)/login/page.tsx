import Link from 'next/link'
import { login } from '../actions'
import { Button, Input } from '@/components/ui'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex flex-col gap-6">

      <div>
        <h1 className="text-2xl font-bold text-blue-deep">Welcome back</h1>
        <p className="text-text-muted text-sm mt-1">
          Log in to your Güater account
        </p>
      </div>

      {error && (
        <div className="border-2 border-status-error bg-white text-status-error text-sm px-4 py-3 rounded-xl">
          {decodeURIComponent(error)}
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

      <p className="text-sm text-text-muted text-center">
        Don&apos;t have an account?{' '}
        <Link href="/signup" className="text-blue-core font-semibold hover:text-blue-deep transition-colors">
          Sign up
        </Link>
      </p>

    </div>
  )
}