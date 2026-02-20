import Link from 'next/link'
import { logout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui'
import ThemeToggle from '../ThemeToggle'

interface NavbarProps {
  displayName?: string
  theme?: 'light' | 'dark'
}

export default function Navbar({ displayName, theme = 'light' }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-white dark:bg-dark-card border-b-2 border-blue-deep dark:border-dark-border shadow-[0_3px_0_#0D4F78]">
      <Link href="/" className="text-2xl font-bold text-blue-deep dark:text-blue-light">
        Güater
      </Link>
      <div className="flex items-center gap-3">
        {displayName && (
          <span className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary hidden sm:block">
            Hey, {displayName}
          </span>
        )}
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
          <Button variant="ghost" type="submit" className="text-xs py-1.5 px-3">
            Log out
          </Button>
        </form>
      </div>
    </nav>
  )
}