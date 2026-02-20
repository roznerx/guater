import Link from 'next/link'
import { login } from '../actions'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-blue-deep">Welcome back</h1>
        <p className="text-text-secondary text-sm mt-2 font-light">
          Log in to your Güater account
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-status-error text-sm px-4 py-3 rounded-lg">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Form */}
      <form action={login} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-sm font-medium text-text-primary">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-blue-core focus:border-transparent bg-white transition-all"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-sm font-medium text-text-primary">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            placeholder="••••••••"
            className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-blue-core focus:border-transparent bg-white transition-all"
          />
        </div>

        <button
          type="submit"
          className="bg-blue-core hover:bg-blue-deep text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors mt-1"
        >
          Log in
        </button>
      </form>

      {/* Footer */}
      <p className="text-sm text-text-muted text-center">
        Don`&apos;`t have an account?{' '}
        <Link href="/signup" className="text-blue-core hover:text-blue-deep font-medium transition-colors">
          Sign up
        </Link>
      </p>

    </div>
  )
}