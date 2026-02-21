'use client'

import { useState, useRef } from 'react'
import { updateTheme } from '@/app/actions'

interface ThemeToggleProps {
  currentTheme: 'light' | 'dark'
}

export default function ThemeToggle({ currentTheme }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(currentTheme === 'dark')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  function handleToggle() {
    const newDark = !isDark
    setIsDark(newDark)

    if (newDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updateTheme(newDark ? 'dark' : 'light')
    }, 600)
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={`
        relative w-12 h-6 rounded-full border-2 transition-colors duration-300 cursor-pointer flex-shrink-0
        ${isDark
          ? 'bg-blue-core border-blue-deep'
          : 'bg-slate-soft border-border'
        }
      `}
      aria-label="Toggle dark mode"
    >
      <span
        className={`
          absolute top-0.5 left-0.5 w-4 h-4 rounded-full border-2 transition-transform duration-300
          ${isDark
            ? 'translate-x-6 bg-white border-blue-deep'
            : 'translate-x-0 bg-white border-border'
          }
        `}
      />
    </button>
  )
}