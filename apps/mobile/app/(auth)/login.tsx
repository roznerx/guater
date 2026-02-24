import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) setError(error.message)
    setLoading(false)
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface dark:bg-dark-surface"
    >
      <View className="flex-1 justify-center px-6">

        <Text className="text-4xl font-bold text-blue-deep dark:text-blue-light mb-2">
          Güater
        </Text>
        <Text className="text-base text-text-muted dark:text-dark-text-muted mb-10">
          Log in to your account
        </Text>

        {error && (
          <View className="bg-white dark:bg-dark-card border-2 border-status-error rounded-xl px-4 py-3 mb-4">
            <Text className="text-status-error text-sm">{error}</Text>
          </View>
        )}

        <View className="flex flex-col gap-4">
          <View>
            <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Email
            </Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              placeholderTextColor="#94A8BA"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              returnKeyType="next"
              className="border-2 border-blue-deep rounded-xl px-3 py-3 text-sm text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-card"
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Password
            </Text>
            <View className="flex-row items-center border-2 border-blue-deep rounded-xl bg-white dark:bg-dark-card">
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor="#94A8BA"
                secureTextEntry={!showPassword}
                autoComplete="password"
                returnKeyType="done"
                onSubmitEditing={handleLogin}
                className="flex-1 px-3 py-3 text-sm text-text-primary dark:text-dark-text-primary"
              />
              <TouchableOpacity
                onPress={() => setShowPassword(v => !v)}
                className="px-3"
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={18}
                  color="#94A8BA"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            className="bg-blue-deep rounded-xl py-3.5 items-center mt-2"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">Log in</Text>
            }
          </TouchableOpacity>
        </View>

        <Link href={"/(auth)/signup" as any} className="mt-6 text-center text-sm text-text-muted dark:text-dark-text-muted">
          Don't have an account?{' '}
          <Text className="text-blue-core font-semibold">Sign up</Text>
        </Link>

        <Link href={"/(auth)/forgot-password" as any} className="mt-3 text-center text-sm text-blue-core font-semibold">
          Forgot your password?
        </Link>

      </View>
    </KeyboardAvoidingView>
  )
}