import { useEffect, useRef, useState } from 'react'
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import AuthHeader from '@/components/ui/AuthHeader'
import AuthBanner from '@/components/ui/AuthBanner'
import { useThemeColors } from '@/lib/hooks/useThemeColors'
import { TOKEN_TIMEOUT_MS, MIN_PASSWORD_LENGTH } from '@guater/utils'

export default function ResetPasswordScreen() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [tokenError, setTokenError] = useState(false)

  const recoveryReceived = useRef(false)
  const c = useThemeColors()

  const inputStyle = {
    borderWidth: 2,
    borderColor: '#0D4F78',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    paddingRight: 64,
    fontSize: 14,
    color: c.textPrimary,
    backgroundColor: c.inputBg,
  }

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        recoveryReceived.current = true
        setReady(true)
      }
    })

    const timeout = setTimeout(() => {
      if (!recoveryReceived.current) setTokenError(true)
    }, TOKEN_TIMEOUT_MS)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit() {
    if (!password || !confirmPassword) {
      setError('Please fill in both fields.')
      return
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setError('')
    setLoading(true)

    try {
      const { error: updateError } = await supabase.auth.updateUser({ password })
      if (updateError) {
        setError(updateError.message)
        return
      }
      await supabase.auth.signOut({ scope: 'global' })
      router.replace('/(auth)/login')
    } finally {
      setLoading(false)
    }
  }

  if (tokenError) {
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
        <View className="flex-1 px-6 justify-center">
          <AuthHeader subtitle="Reset your password" />
          <AuthBanner
            message="Reset link is invalid or has expired. Please request a new one."
            type="error"
          />
          <TouchableOpacity
            onPress={() => router.replace('/(auth)/forgot-password')}
            className="border-2 border-blue-deep rounded-xl py-3 items-center mt-2"
          >
            <Text className="text-sm font-semibold text-blue-deep">
              Request a new reset link
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  if (!ready) {
    return (
      <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface items-center justify-center">
        <ActivityIndicator color="#1A6FA0" />
        <Text className="text-sm text-text-muted dark:text-dark-text-muted mt-4">
          Verifying your reset link…
        </Text>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <AuthHeader subtitle="Choose a new password for your account" />

        {error ? <AuthBanner message={error} type="error" /> : null}

        {/* New password */}
        <View className="mb-4">
          <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-2">
            New password
          </Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholder="••••••••"
              placeholderTextColor="#94A8BA"
              autoCapitalize="none"
              returnKeyType="next"
              style={inputStyle}
            />
            <TouchableOpacity
              onPress={() => setShowPassword(v => !v)}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
              style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#94A8BA' }}>
                {showPassword ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xs text-text-muted dark:text-dark-text-muted mt-1">
            Minimum {MIN_PASSWORD_LENGTH} characters
          </Text>
        </View>

        {/* Confirm password */}
        <View className="mb-6">
          <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary mb-2">
            Confirm password
          </Text>
          <View style={{ position: 'relative' }}>
            <TextInput
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirm}
              placeholder="••••••••"
              placeholderTextColor="#94A8BA"
              autoCapitalize="none"
              returnKeyType="done"
              onSubmitEditing={handleSubmit}
              style={inputStyle}
            />
            <TouchableOpacity
              onPress={() => setShowConfirm(v => !v)}
              accessibilityLabel={showConfirm ? 'Hide confirm password' : 'Show confirm password'}
              style={{ position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: '#94A8BA' }}>
                {showConfirm ? 'Hide' : 'Show'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSubmit}
          disabled={loading}
          style={{
            backgroundColor: '#0D4F78',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading
            ? <ActivityIndicator color="white" />
            : <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>
                Update password
              </Text>
          }
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
