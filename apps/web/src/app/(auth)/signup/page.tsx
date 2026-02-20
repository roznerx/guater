import Link from 'next/link'
import { signup } from '../actions'

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const { error } = await searchParams

  return (
    <div className="flex flex-col gap-8">

      {/* Header */}
      <div>
        <h1 className="font-serif text-3xl text-blue-deep">Create account</h1>
        <p className="text-text-secondary text-sm mt-2 font-light">
          Start tracking your hydration today
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-status-error text-sm px-4 py-3 rounded-lg">
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Form */}
      <form action={signup} className="flex flex-col gap-5">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="display_name" className="text-sm font-medium text-text-primary">
            Name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            required
            placeholder="Your name"
            className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-blue-core focus:border-transparent bg-white transition-all"
          />
        </div>

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
            minLength={6}
            placeholder="••••••••"
            className="border border-border rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none focus:ring-2 focus:ring-blue-core focus:border-transparent bg-white transition-all"
          />
          <span className="text-xs text-text-muted">Minimum 6 characters</span>
        </div>

        <button
          type="submit"
          className="bg-blue-core hover:bg-blue-deep text-white font-medium rounded-lg px-4 py-2.5 text-sm transition-colors mt-1"
        >
          Create account
        </button>
      </form>

      {/* Footer */}
      <p className="text-sm text-text-muted text-center">
        Already have an account?{' '}
        <Link href="/login" className="text-blue-core hover:text-blue-deep font-medium transition-colors">
          Log in
        </Link>
      </p>

    </div>
  )
}