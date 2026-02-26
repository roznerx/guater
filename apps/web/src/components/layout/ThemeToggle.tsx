'use client'
import { useTheme } from '@/components/layout/ThemeProvider'

export default function ThemeToggle() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      className={`
        relative w-12 h-6 rounded-full border-2 transition-colors duration-300 cursor-pointer flex-shrink-0
        ${isDark ? 'bg-blue-core border-blue-deep' : 'bg-slate-soft border-border'}
      `}
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-4 h-4 rounded-full border-2 transition-transform duration-300
          ${isDark ? 'translate-x-6 bg-white border-blue-deep' : 'translate-x-0 bg-white border-border'}
        `}
      />
    </button>
  )
}