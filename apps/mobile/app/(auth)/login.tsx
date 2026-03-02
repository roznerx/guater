import { useState } from 'react'
import { View, Text, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { supabase } from '@/lib/supabase'
import AuthHeader from '@/components/ui/AuthHeader'
import AuthBanner from '@/components/ui/AuthBanner'
import Input from '@/components/ui/Input'
import { EMAIL_REGEX, MIN_PASSWORD_LENGTH } from '@guater/utils'

export default function LoginScreen() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  async function handleLogin() {
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
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      })
      if (authError) setError(authError.message)
    } finally {
      setLoading(false)
    }
  }

  const EyeToggle = (
    <TouchableOpacity
      onPress={() => setShowPassword(v => !v)}
      accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
    >
      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={18} color="#94A8BA" />
    </TouchableOpacity>
  )

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-surface dark:bg-dark-surface"
    >
      <View className="flex-1 justify-center px-6">
        <AuthHeader subtitle="Log in to your account" />

        {error && <AuthBanner message={error} type="error" />}

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
          />

          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="••••••••"
            secureTextEntry={!showPassword}
            autoComplete="password"
            returnKeyType="done"
            onSubmitEditing={handleLogin}
            suffix={EyeToggle}
          />

          <TouchableOpacity
            onPress={handleLogin}
            disabled={loading}
            style={{ opacity: loading ? 0.5 : 1 }}
            className="bg-blue-deep rounded-xl py-3.5 items-center mt-2"
          >
            {loading
              ? <ActivityIndicator color="white" />
              : <Text className="text-white font-semibold text-base">Log in</Text>
            }
          </TouchableOpacity>
        </View>

        <Link href="/(auth)/signup" className="mt-6 text-center text-sm text-text-muted dark:text-dark-text-muted">
          Don't have an account?{' '}
          <Text className="text-blue-core font-semibold">Sign up</Text>
        </Link>

        <Link href="/(auth)/forgot-password" className="mt-3 text-center text-sm text-blue-core font-semibold">
          Forgot your password?
        </Link>
      </View>
    </KeyboardAvoidingView>
  )
}
