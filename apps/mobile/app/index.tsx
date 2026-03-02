import { Redirect } from 'expo-router'
import { View, ActivityIndicator } from 'react-native'
import { useTheme } from '@/lib/context/ThemeContext'
import { useAuth } from '@/lib/context/AuthContext'
import { useProfileContext } from '@/lib/context/ProfileContext'

export default function Index() {
  const { user, loading } = useAuth()
  const { profile, loading: profileLoading } = useProfileContext()
  const { resolvedTheme } = useTheme()

  if (loading || (user && profileLoading)) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color={resolvedTheme === 'dark' ? '#60A8D4' : '#1A6FA0'} />
      </View>
    )
  }

  if (!user) return <Redirect href="/(auth)/login" />
  if (!profile?.onboarding_completed) return <Redirect href="/(onboarding)" />

  return <Redirect href="/(tabs)" />
}
