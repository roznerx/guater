import { useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import AuthHeader from '@/components/ui/AuthHeader'
import AuthBanner from '@/components/ui/AuthBanner'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleReset() {
    if (!email) {
      setError('Please enter your email.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'guater://reset-password',
      })
      if (error) setError(error.message)
      else setMessage('Check your email for a password reset link.')
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
        <AuthHeader subtitle="Reset your password" />

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
              returnKeyType="done"
              onSubmitEditing={handleReset}
              className="border-2 border-blue-deep rounded-xl px-3 py-3 text-sm text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-card"
            />
          </View>

          <TouchableOpacity
            onPress={handleReset}
            disabled={loading}
            className="bg-blue-deep rounded-xl py-3.5 items-center mt-2 disabled:opacity-50"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">Send reset link</Text>
            }
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/login" className="mt-6 text-center text-sm text-blue-core font-semibold">
          Back to login
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}
