import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface dark:bg-dark-surface">
      <div className="w-full max-w-md px-6 py-12">
        <div className="mb-10">
          <Link href="/" className="text-3xl font-bold text-blue-deep dark:text-blue-light">
            Güater
          </Link>
        </div>
        {children}
      </div>
    </div>
  )
}
