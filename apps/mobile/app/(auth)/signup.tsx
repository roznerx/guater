import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { supabase } from '@/lib/supabase'
import AuthHeader from '@/components/ui/AuthHeader'
import AuthBanner from '@/components/ui/AuthBanner'
import Input from '@/components/ui/Input'
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '@guater/utils'

export default function SignupScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState(false)

  async function handleSignup() {
    const trimmedEmail = email.trim()
    if (!trimmedEmail || !password) {
      setError('Please enter your email and password.')
      return
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.')
      return
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
      })
      if (authError) {
        setError(authError.message)
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
        <AuthHeader subtitle="Create your account" />

        {error && <AuthBanner message={error} type="error" />}
        {sent && (
          <AuthBanner message="Check your email to confirm your account." type="success" />
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
            returnKeyType="next"
            editable={!sent}
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleSignup}
            hint={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
            editable={!sent}
          />

          <TouchableOpacity
            onPress={handleSignup}
            disabled={isDisabled}
            style={{ opacity: isDisabled ? 0.5 : 1 }}
            className="bg-blue-deep rounded-xl py-3.5 items-center mt-2"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">
                  {sent ? 'Email sent' : 'Sign up'}
                </Text>
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
