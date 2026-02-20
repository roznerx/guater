import Link from 'next/link'
import { login } from '../actions'

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
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-semibold text-text-secondary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-semibold text-text-secondary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-core text-white font-semibold rounded-xl px-4 py-2.5 text-sm border-2 border-blue-deep shadow-[3px_3px_0_#0D4F78] hover:shadow-[1px_1px_0_#0D4F78] hover:translate-x-0.5 hover:translate-y-0.5 transition-all mt-1"
        >
          Log in
        </button>
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