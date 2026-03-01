import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { ThemeProvider, useTheme } from '@/lib/ThemeContext'
import '../global.css'
import { useProfile } from '@/lib/useProfile'

function AuthGate() {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useProfile(user?.id)
  const segments = useSegments()

  useEffect(() => {
    if (loading || profileLoading) return
    const inAuthGroup = segments[0] === '(auth)'
    const inOnboarding = segments[0] === '(onboarding)'

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      if (profile && !profile.onboarding_completed) {
        router.replace('/(onboarding)/index')
      } else {
        router.replace('/(tabs)')
      }
    } else if (user && !inAuthGroup && !inOnboarding) {
      if (profile && !profile.onboarding_completed) {
        router.replace('/(onboarding)/index')
      }
    }
  }, [user, loading, profile, profileLoading, segments])

  return null
}

function ThemeSync() {
  const { resolvedTheme } = useTheme()
  const { setColorScheme } = useColorScheme()

  useEffect(() => {
    setColorScheme(resolvedTheme)
  }, [resolvedTheme])

  return null
}

function AppShell() {
  const { resolvedTheme } = useTheme()

  return (
    <>
      <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      <ThemeSync />
      <AuthGate />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <AppShell />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
