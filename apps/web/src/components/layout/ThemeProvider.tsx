'use client'
import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { updateTheme } from '@/app/actions'

interface ThemeContextValue {
  isDark: boolean
  toggle: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}

interface ThemeProviderProps {
  theme: 'light' | 'dark'
  children: React.ReactNode
}

const DEBOUNCE_MS = 600

export default function ThemeProvider({ theme, children }: ThemeProviderProps) {
  const [isDark, setIsDark] = useState(theme === 'dark')
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  function toggle() {
    const newDark = !isDark
    setIsDark(newDark)

    if (debounceTimer.current) clearTimeout(debounceTimer.current)
    debounceTimer.current = setTimeout(() => {
      updateTheme(newDark ? 'dark' : 'light')
    }, DEBOUNCE_MS)
  }

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      {children}
    </ThemeContext.Provider>
  )
}
