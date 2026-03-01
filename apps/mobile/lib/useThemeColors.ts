import { useTheme } from './ThemeContext'

export function useThemeColors() {
  const { resolvedTheme } = useTheme()
  const dark = resolvedTheme === 'dark'

  return {
    surface:        dark ? '#0F1E2A' : '#F4F8FB',
    card:           dark ? '#152433' : '#ffffff',
    cardAlt:        dark ? '#1E3448' : '#F4F8FB',
    border:         dark ? '#1E3448' : '#DDE8F0',
    inputBg:        dark ? '#152433' : '#ffffff',
    textPrimary:    dark ? '#E8F0F7' : '#0F2A3A',
    textSecondary:  dark ? '#94A8BA' : '#4A6070',
    textMuted:      dark ? '#4A6070' : '#94A8BA',
    selectedBg:     dark ? '#1A3A52' : '#C8DCEE',
    selectedText:   dark ? '#7FB8D8' : '#0D4F78',
    progressTrack:  dark ? '#1E3448' : '#E8EEF4',
  }
}
