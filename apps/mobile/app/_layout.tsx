import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'
import { AuthProvider, useAuth } from '@/lib/context/AuthContext'
import { ThemeProvider, useTheme } from '@/lib/context/ThemeContext'
import { ProfileProvider, useProfileContext } from '@/lib/context/ProfileContext'
import '../global.css'

function AuthGate() {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useProfileContext()
  const segments = useSegments()
  const segmentKey = segments.join('/')

  useEffect(() => {
    if (loading || profileLoading) return

    const [firstSegment] = segmentKey.split('/')
    const inAuthGroup = firstSegment === '(auth)'
    const inOnboarding = firstSegment === '(onboarding)'
    const needsOnboarding = user && !profile?.onboarding_completed

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace(needsOnboarding ? '/(onboarding)' : '/(tabs)')
    } else if (user && inOnboarding && !needsOnboarding) {
      router.replace('/(tabs)')
    } else if (user && !inAuthGroup && !inOnboarding && needsOnboarding) {
      router.replace('/(onboarding)')
    }
  }, [user, loading, profile, profileLoading, segmentKey])

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
          <ProfileProvider>
            <AppShell />
          </ProfileProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  )
}
