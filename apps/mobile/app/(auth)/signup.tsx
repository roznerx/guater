import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import AuthHeader from '@/components/ui/AuthHeader'
import AuthBanner from '@/components/ui/AuthBanner'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSignup() {
    if (!email || !password) {
      setError('Please enter your email and password.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('Check your email to confirm your account.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface dark:bg-dark-surface"
    >
      <View className="flex-1 justify-center px-6">
        <AuthHeader subtitle="Create your account" />

        {error && <AuthBanner message={error} type="error" />}
        {message && <AuthBanner message={message} type="success" />}

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
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A8BA"
              secureTextEntry
              autoComplete="password"
              returnKeyType="done"
              onSubmitEditing={handleSignup}
              className="border-2 border-blue-deep rounded-xl px-3 py-3 text-sm text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-card"
            />
          </View>

          <TouchableOpacity
            onPress={handleSignup}
            disabled={loading}
            className="bg-blue-deep rounded-xl py-3.5 items-center mt-2 disabled:opacity-50"
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
