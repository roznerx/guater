import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import AuthHeader from '@/components/ui/AuthHeader'
import AuthBanner from '@/components/ui/AuthBanner'
import Input from '@/components/ui/Input'
import { EMAIL_REGEX } from '@guater/utils'

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleReset() {
    const trimmed = email.trim()
    if (!trimmed) {
      setError('Please enter your email.')
      return
    }
    if (!EMAIL_REGEX.test(trimmed)) {
      setError('Please enter a valid email address.')
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(trimmed, {
        redirectTo: 'guater://reset-password',
      })
      if (resetError) {
        setError(resetError.message)
      } else {
        setSent(true)
      }
    } finally {
      setLoading(false)
    }
  }

  const isDisabled = loading || sent

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface dark:bg-dark-surface"
    >
      <View className="flex-1 justify-center px-6">
        <AuthHeader subtitle="Reset your password" />

        {error && <AuthBanner message={error} type="error" />}
        {sent && (
          <AuthBanner message="Check your email for a password reset link." type="success" />
        )}

        <View className="flex flex-col gap-4">
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleReset}
            editable={!sent}
          />

          <TouchableOpacity
            onPress={handleReset}
            disabled={isDisabled}
            style={{ opacity: isDisabled ? 0.5 : 1 }}
            className="bg-blue-deep rounded-xl py-3.5 items-center mt-2"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">
                  {sent ? 'Email sent' : 'Send reset link'}
                </Text>
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
