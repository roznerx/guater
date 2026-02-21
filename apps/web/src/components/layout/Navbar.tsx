import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui'
import ThemeToggle from '@/components/ThemeToggle'

interface NavbarProps {
  displayName?: string
  theme?: 'light' | 'dark'
}

export default function Navbar({ displayName, theme = 'light' }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center px-4 sm:px-6 py-3 bg-white dark:bg-dark-card border-b-2 border-blue-deep dark:border-dark-border shadow-[0_3px_0_#0D4F78]">
      <div className="flex items-center gap-3">
        <Link href="/" className="text-2xl font-bold text-blue-deep dark:text-blue-light">
          Güater
        </Link>
        {displayName && (
          <span className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary hidden sm:block">
            Hey, {displayName}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle currentTheme={theme} />
        <Link href="/history">
          <Button variant="secondary" className="text-xs py-1.5 px-3">
            History
          </Button>
        </Link>
        <Link href="/settings">
          <Button variant="secondary" className="text-xs py-1.5 px-3">
            Settings
          </Button>
        </Link>
       <form action={logout}>
          <button
            type="submit"
            title="Log out"
            className="flex items-center justify-center w-8 h-8 sm:w-auto sm:h-auto sm:px-3 sm:py-1.5 rounded-xl border-2 border-border dark:border-dark-border bg-white dark:bg-dark-card text-text-muted dark:text-dark-text-muted shadow-[3px_3px_0_#DDE8F0] hover:shadow-[1px_1px_0_#DDE8F0] hover:translate-x-0.5 hover:translate-y-0.5 transition-all cursor-pointer text-xs font-semibold"
          >
            <span className="hidden sm:block">Log out</span>
            <span className="sm:hidden">⏻</span>
          </button>
        </form>
      </div>
    </nav>
  )
}