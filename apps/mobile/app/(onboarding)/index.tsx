import { useMemo, useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity,
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { router } from 'expo-router'
import { supabase } from '@/lib/supabase'
import {
  calculateRecommendedIntake,
  validateGoalHealth,
  ACTIVITY_LEVELS,
  CLIMATES,
} from '@guater/utils'
import type { ActivityLevel, Climate, GoalHealthStatus } from '@guater/utils'
import { useAuth } from '@/lib/context/AuthContext'
import { useProfileContext } from '@/lib/context/ProfileContext'
import { useThemeColors } from '@/lib/hooks/useThemeColors'

type Step = 'welcome' | 'goal'
const STEPS: Step[] = ['welcome', 'goal']

function ProgressDots({ current, total, borderColor }: { current: number; total: number; borderColor: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: 32 }}>
      {Array.from({ length: total }).map((_, i) => (
        <View key={i} style={{
          width: i === current ? 20 : 8,
          height: 8, borderRadius: 4,
          backgroundColor: i === current ? '#0D4F78' : borderColor,
        }} />
      ))}
    </View>
  )
}

function GoalHealthBanner({ status }: { status: GoalHealthStatus }) {
  if (status.level === 'ok') return null
  const isDanger = status.level === 'danger'
  return (
    <View style={{
      borderRadius: 10, borderWidth: 2, padding: 12, marginBottom: 12,
      backgroundColor: isDanger ? '#FEE2E2' : '#FEF9C3',
      borderColor: isDanger ? '#DC2626' : '#CA8A04',
    }}>
      <Text style={{ fontSize: 13, fontWeight: '500', lineHeight: 18, color: isDanger ? '#991B1B' : '#713F12' }}>
        {isDanger ? '⛔' : '⚠️'}{'  '}{status.message}
      </Text>
    </View>
  )
}

export default function OnboardingScreen() {
  const { user } = useAuth()
  const { refresh: refreshProfile } = useProfileContext()
  const c = useThemeColors()

  const [step, setStep] = useState<Step>('welcome')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [displayName, setDisplayName] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [age, setAge] = useState('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
  const [climate, setClimate] = useState<Climate>('temperate')
  const [dailyGoal, setDailyGoal] = useState('')

  const weight = parseFloat(weightKg)
  const ageNum = parseInt(age, 10)

  const recommended = useMemo(() => {
    if (weight > 0 && ageNum > 0) {
      return calculateRecommendedIntake(weight, ageNum, activityLevel, climate)
    }
    return null
  }, [weight, ageNum, activityLevel, climate])

  const parsedGoal  = parseInt(dailyGoal, 10)
  const goalHealth: GoalHealthStatus = dailyGoal && !Number.isNaN(parsedGoal)
    ? validateGoalHealth(parsedGoal)
    : { level: 'ok' }

  const resolvedGoal = !Number.isNaN(parsedGoal) && parsedGoal > 0
    ? parsedGoal
    : (recommended ?? 2500)

  const inputStyle = {
    borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: c.textPrimary, backgroundColor: c.inputBg,
  }

  async function handleFinish(skip = false) {
    if (!user) return

    if (!skip) {
      if (resolvedGoal <= 0) {
        setSaveError('Please enter a daily goal or fill in your stats to get a recommendation.')
        return
      }
      if (goalHealth.level === 'danger') return
    }

    setSaveError(null)
    setSaving(true)

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName.trim() || null,
          daily_goal_ml: skip ? 2500 : resolvedGoal,
          weight_kg: weight > 0 ? weight : null,
          age: ageNum > 0 ? ageNum : null,
          activity_level: activityLevel,
          climate,
          onboarding_completed: true,
        })
        .eq('id', user.id)

      if (error) {
        setSaveError(error.message)
        return
      }

      await refreshProfile()

      router.replace('/(tabs)')
    } catch {
      setSaveError('Something went wrong. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const currentIndex = STEPS.indexOf(step)

  if (step === 'welcome') {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: c.surface }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <View style={{ alignItems: 'center', marginBottom: 40 }}>
              <Text style={{ fontSize: 48, marginBottom: 16 }}>💧</Text>
              <Text style={{ fontSize: 28, fontWeight: '800', color: '#0D4F78', textAlign: 'center', marginBottom: 8 }}>
                Welcome to Güater
              </Text>
              <Text style={{ fontSize: 15, color: c.textMuted, textAlign: 'center', lineHeight: 22 }}>
                Track your hydration and build healthy habits — let's set you up in 2 quick steps.
              </Text>
            </View>

            <ProgressDots current={currentIndex} total={STEPS.length} borderColor={c.border} />

            <View style={{ gap: 8, marginBottom: 8 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 4 }}>
                What should we call you?{' '}
                <Text style={{ color: c.textMuted, fontWeight: '400' }}>(optional)</Text>
              </Text>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor="#94A8BA"
                returnKeyType="done"
                style={inputStyle}
              />
            </View>

            <TouchableOpacity
              onPress={() => setStep('goal')}
              style={{
                backgroundColor: '#0D4F78', borderRadius: 12,
                paddingVertical: 14, alignItems: 'center', marginTop: 24,
              }}
            >
              <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>
                Let's go →
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.surface }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 32, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={{ fontSize: 22, fontWeight: '800', color: '#0D4F78', marginBottom: 4 }}>
          Set your daily goal
        </Text>
        <Text style={{ fontSize: 14, color: c.textMuted, marginBottom: 24, lineHeight: 20 }}>
          We'll calculate a recommendation based on your body and lifestyle.
        </Text>

        <ProgressDots current={currentIndex} total={STEPS.length} borderColor={c.border} />

        {/* Body stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 6 }}>Weight (kg)</Text>
            <TextInput
              value={weightKg}
              onChangeText={setWeightKg}
              placeholder="70"
              placeholderTextColor="#94A8BA"
              keyboardType="numeric"
              style={inputStyle}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 6 }}>Age</Text>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="30"
              placeholderTextColor="#94A8BA"
              keyboardType="numeric"
              style={inputStyle}
            />
          </View>
        </View>

        {/* Activity level */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 6 }}>Activity level</Text>
        <View style={{ borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
          {ACTIVITY_LEVELS.map((opt, i) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setActivityLevel(opt.value)}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                paddingHorizontal: 16, paddingVertical: 12,
                backgroundColor: activityLevel === opt.value ? c.selectedBg : c.card,
                borderTopWidth: i > 0 ? 1 : 0, borderTopColor: c.border,
              }}
            >
              <View>
                <Text style={{ fontSize: 13, fontWeight: '600', color: c.selectedText }}>{opt.label}</Text>
                <Text style={{ fontSize: 12, color: c.textMuted }}>{opt.description}</Text>
              </View>
              {activityLevel === opt.value && (
                <Text style={{ color: c.selectedText, fontWeight: '700' }}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Climate */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 6 }}>Climate</Text>
        <View style={{ flexDirection: 'row', borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12, overflow: 'hidden', marginBottom: 20 }}>
          {CLIMATES.map((opt, i) => (
            <TouchableOpacity
              key={opt.value}
              onPress={() => setClimate(opt.value)}
              style={{
                flex: 1, paddingVertical: 10, alignItems: 'center',
                backgroundColor: climate === opt.value ? '#0D4F78' : c.card,
                borderLeftWidth: i > 0 ? 2 : 0, borderLeftColor: '#0D4F78',
              }}
            >
              <Text style={{ fontSize: 13, fontWeight: '600', color: climate === opt.value ? '#ffffff' : c.selectedText }}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recommendation banner */}
        {recommended !== null && (
          <View style={{
            borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12,
            padding: 16, backgroundColor: c.selectedBg, marginBottom: 16,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#1A6FA0', textTransform: 'uppercase', marginBottom: 4 }}>
              Recommended
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 22, fontWeight: '800', color: c.selectedText }}>
                {recommended.toLocaleString()} ml / day
              </Text>
              <TouchableOpacity onPress={() => setDailyGoal(String(recommended))}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A6FA0' }}>Use this →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Manual goal input */}
        <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 6 }}>
          Daily goal (ml)
        </Text>
        <TextInput
          value={dailyGoal}
          onChangeText={(v) => { setDailyGoal(v); setSaveError(null) }}
          placeholder={recommended !== null ? String(recommended) : '2500'}
          placeholderTextColor="#94A8BA"
          keyboardType="numeric"
          style={{ ...inputStyle, marginBottom: 8 }}
        />

        <GoalHealthBanner status={goalHealth} />

        {saveError && (
          <Text style={{ fontSize: 12, fontWeight: '600', color: '#DC2626', marginBottom: 8 }}>
            {saveError}
          </Text>
        )}

        <TouchableOpacity
          onPress={() => handleFinish()}
          disabled={saving || goalHealth.level === 'danger'}
          style={{
            backgroundColor: '#0D4F78', borderRadius: 12,
            paddingVertical: 14, alignItems: 'center',
            opacity: saving || goalHealth.level === 'danger' ? 0.5 : 1,
            marginBottom: 12,
          }}
        >
          {saving
            ? <ActivityIndicator color="white" />
            : <Text style={{ color: 'white', fontWeight: '700', fontSize: 16 }}>Set my goal</Text>
          }
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleFinish(true)} disabled={saving}>
          <Text style={{ textAlign: 'center', fontSize: 13, color: c.textMuted, fontWeight: '600' }}>
            Skip for now — use 2,500 ml default
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}
