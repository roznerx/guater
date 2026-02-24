import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSignup() {
    if (!email || !password) return
    setLoading(true)
    setError(null)

    const { error } = await supabase.auth.signUp({ email, password })

    if (error) setError(error.message)
    else setMessage('Check your email to confirm your account.')
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
          Create your account
        </Text>

        {error && (
          <View className="bg-white dark:bg-dark-card border-2 border-status-error rounded-xl px-4 py-3 mb-4">
            <Text className="text-status-error text-sm">{error}</Text>
          </View>
        )}

        {message && (
          <View className="bg-white dark:bg-dark-card border-2 border-teal-core rounded-xl px-4 py-3 mb-4">
            <Text className="text-teal-deep text-sm">{message}</Text>
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
              className="border-2 border-blue-deep rounded-xl px-3 py-3 text-sm text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-card"
            />
          </View>

          <View>
            <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-1.5">
              Password
            </Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A8BA"
              secureTextEntry
              autoComplete="password"
              className="border-2 border-blue-deep rounded-xl px-3 py-3 text-sm text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-card"
            />
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="bg-blue-deep rounded-xl py-3.5 items-center mt-2"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">Sign up</Text>
            }
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/login" className="mt-6 text-center text-sm text-text-muted dark:text-dark-text-muted">
          Already have an account?{' '}
          <Text className="text-blue-core font-semibold">Log in</Text>
        </Link>

      </View>
    </KeyboardAvoidingView>
  )
}