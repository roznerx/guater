import { useEffect } from 'react'
import { Stack, router, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { useColorScheme } from 'nativewind'
import { AuthProvider, useAuth } from '@/lib/AuthContext'
import { ThemeProvider, useTheme } from '@/lib/ThemeContext'
import '../global.css'

function AuthGate() {
  const { user, loading } = useAuth()
  const segments = useSegments()

  useEffect(() => {
    if (loading) return
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/(tabs)')
    }
  }, [user, loading, segments])

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
