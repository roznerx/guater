import { Redirect } from 'expo-router'
import { useAuth } from '@/lib/AuthContext'
import { View, ActivityIndicator } from 'react-native'

export default function Index() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-surface">
        <ActivityIndicator color="#1A6FA0" />
      </View>
    )
  }

  return <Redirect href={user ? '/(tabs)' : '/(auth)/login'} />
}
