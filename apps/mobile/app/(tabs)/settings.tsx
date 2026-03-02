import { useMemo, useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { supabase } from '@/lib/supabase'
import { calculateRecommendedIntake, ACTIVITY_LEVELS, CLIMATES } from '@guater/utils'
import type { ActivityLevel, Climate } from '@guater/utils'
import Card from '@/components/ui/Card'
import PresetsManager from '@/components/water/PresetsManager'
import DiureticPresetsManager from '@/components/water/DiureticPresetsManager'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useTheme, type ThemePreference } from '@/lib/context/ThemeContext'
import { useProfileContext } from '@/lib/context/ProfileContext'
import { deleteAccount } from '@/lib/api/deleteAccount'
import { useAuth } from '@/lib/context/AuthContext'
import { useDiureticPresets } from '@/lib/hooks/useDiureticPresets'
import { usePresets } from '@/lib/hooks/usePresets'
import { useThemeColors } from '@/lib/hooks/useThemeColors'

const UNITS = [
  { value: 'ml', label: 'ml' },
  { value: 'oz', label: 'oz' },
]

const TIMEZONES = [
  { value: 'UTC', label: 'UTC' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/New_York', label: 'New York (EST)' },
  { value: 'America/Chicago', label: 'Chicago (CST)' },
  { value: 'America/Denver', label: 'Denver (MST)' },
  { value: 'America/Los_Angeles', label: 'Los Angeles (PST)' },
  { value: 'Europe/London', label: 'London (GMT)' },
  { value: 'Europe/Paris', label: 'Paris (CET)' },
]

function SegmentedControl({ options, value, onChange }: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const c = useThemeColors()
  return (
    <View style={{ flexDirection: 'row', borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12, overflow: 'hidden' }}>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            flex: 1, paddingVertical: 10, alignItems: 'center',
            backgroundColor: value === opt.value ? '#0D4F78' : c.card,
            borderLeftWidth: i > 0 ? 2 : 0, borderLeftColor: '#0D4F78',
          }}
        >
          <Text style={{ fontSize: 13, fontWeight: '600', color: value === opt.value ? '#ffffff' : c.selectedText }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function OptionList({ options, value, onChange }: {
  options: { value: string; label: string; description?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  const c = useThemeColors()
  return (
    <View style={{ borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12, overflow: 'hidden' }}>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
            paddingHorizontal: 16, paddingVertical: 12,
            backgroundColor: value === opt.value ? c.selectedBg : c.card,
            borderTopWidth: i > 0 ? 2 : 0, borderTopColor: c.border,
          }}
        >
          <View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: c.selectedText }}>{opt.label}</Text>
            {opt.description && (
              <Text style={{ fontSize: 12, color: c.textMuted, marginTop: 1 }}>{opt.description}</Text>
            )}
          </View>
          {value === opt.value && (
            <Text style={{ color: c.selectedText, fontWeight: '700' }}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

function SectionLabel({ label }: { label: string }) {
  const c = useThemeColors()
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: c.textMuted, textTransform: 'uppercase', marginBottom: 8 }}>
      {label}
    </Text>
  )
}

function FieldLabel({ label }: { label: string }) {
  const c = useThemeColors()
  return (
    <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary, marginBottom: 6 }}>
      {label}
    </Text>
  )
}

export default function SettingsScreen() {
  const { user } = useAuth()
  const { profile, loading, refresh: refreshProfile } = useProfileContext()
  const [deleting, setDeleting] = useState(false)

  const c = useThemeColors()
  const tabBarHeight = useBottomTabBarHeight()

  const [presetsRefreshKey, setPresetsRefreshKey] = useState(0)
  const [diureticPresetsRefreshKey, setDiureticPresetsRefreshKey] = useState(0)

  const { presets } = usePresets(user?.id, presetsRefreshKey)
  const { presets: diureticPresets } = useDiureticPresets(user?.id, diureticPresetsRefreshKey)
  const { theme, setTheme } = useTheme()

  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName]  = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [age, setAge] = useState('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
  const [climate, setClimate] = useState<Climate>('temperate')
  const [dailyGoal, setDailyGoal] = useState('2500')
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml')
  const [timezone, setTimezone] = useState('UTC')

  const inputStyle = {
    borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12,
    paddingHorizontal: 12, paddingVertical: 10, fontSize: 14,
    color: c.textPrimary, backgroundColor: c.inputBg,
  }

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name ?? '')
    setWeightKg(profile.weight_kg?.toString() ?? '')
    setAge(profile.age?.toString() ?? '')
    setActivityLevel((profile.activity_level as ActivityLevel) ?? 'moderate')
    setClimate((profile.climate as Climate) ?? 'temperate')
    setDailyGoal(profile.daily_goal_ml?.toString() ?? '2500')
    setUnit((profile.preferred_unit as 'ml' | 'oz') ?? 'ml')
    setTimezone(profile.timezone ?? 'UTC')
  }, [profile])

  const weight = parseFloat(weightKg)
  const ageNum = parseInt(age, 10)

  const recommended = useMemo(() => {
    if (weight > 0 && ageNum > 0) {
      return calculateRecommendedIntake(weight, ageNum, activityLevel, climate)
    }
    return null
  }, [weight, ageNum, activityLevel, climate])

  async function handleSave() {
    if (!user || saving) return
    setSaving(true)
    try {
      const parsedGoal = parseInt(dailyGoal, 10)
      const resolvedGoal = !Number.isNaN(parsedGoal) && parsedGoal > 0 ? parsedGoal : 2500

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: displayName || null,
          daily_goal_ml: resolvedGoal,
          preferred_unit: unit,
          timezone,
          weight_kg: weight > 0 ? weight : null,
          age: ageNum > 0 ? ageNum : null,
          activity_level: activityLevel,
          climate,
        })
        .eq('id', user.id)

      if (error) {
        Alert.alert('Error', 'Failed to save settings. Please try again.')
        return
      }

      await refreshProfile()
      Alert.alert('Saved', 'Settings updated successfully.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out', style: 'destructive',
        onPress: async () => { await supabase.auth.signOut() },
      },
    ])
  }

  async function handleDeleteAccount() {
    Alert.alert(
      'Delete account',
      'This will permanently delete your account and all your data — logs, presets, and settings. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account', style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Are you absolutely sure?',
              'Your data cannot be recovered after deletion.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Yes, delete everything', style: 'destructive',
                  onPress: async () => {
                    setDeleting(true)
                    const { error } = await deleteAccount()
                    setDeleting(false)
                    if (error) Alert.alert('Error', error)
                  },
                },
              ],
            )
          },
        },
      ],
    )
  }

  if (loading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface dark:bg-dark-surface">
        <ActivityIndicator color="#1A6FA0" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}>

        <View className="py-4">
          <Text className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">
            Settings
          </Text>
        </View>

        {/* Profile */}
        <Card className="mb-4">
          <SectionLabel label="Profile" />
          <View style={{ gap: 16 }}>
            <View>
              <FieldLabel label="Name" />
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor="#94A8BA"
                style={inputStyle}
              />
            </View>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <FieldLabel label="Weight (kg)" />
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
                <FieldLabel label="Age" />
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
            <View>
              <FieldLabel label="Activity level" />
              <OptionList
                options={ACTIVITY_LEVELS}
                value={activityLevel}
                onChange={(v) => setActivityLevel(v as ActivityLevel)}
              />
            </View>
            <View>
              <FieldLabel label="Climate" />
              <SegmentedControl
                options={CLIMATES}
                value={climate}
                onChange={(v) => setClimate(v as Climate)}
              />
            </View>
          </View>
        </Card>

        {/* Recommended intake */}
        {recommended !== null && (
          <View style={{
            marginBottom: 16, borderWidth: 2, borderColor: '#0D4F78',
            borderRadius: 16, padding: 16, backgroundColor: c.selectedBg,
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#1A6FA0', textTransform: 'uppercase', marginBottom: 6 }}>
              Recommended intake
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: c.selectedText }}>
                {recommended.toLocaleString()} ml / day
              </Text>
              <TouchableOpacity onPress={() => setDailyGoal(String(recommended))}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A6FA0' }}>Use this →</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Goal & units */}
        <Card className="mb-4">
          <SectionLabel label="Goal & units" />
          <View style={{ gap: 16 }}>
            <View>
              <FieldLabel label="Daily goal (ml)" />
              <TextInput
                value={dailyGoal}
                onChangeText={setDailyGoal}
                placeholder="2500"
                placeholderTextColor="#94A8BA"
                keyboardType="numeric"
                style={inputStyle}
              />
            </View>
            <View>
              <FieldLabel label="Unit" />
              <SegmentedControl
                options={UNITS}
                value={unit}
                onChange={(v) => setUnit(v as 'ml' | 'oz')}
              />
            </View>
          </View>
        </Card>

        {/* Timezone */}
        <Card className="mb-4">
          <SectionLabel label="Timezone" />
          <OptionList options={TIMEZONES} value={timezone} onChange={setTimezone} />
        </Card>

        {/* Quick add presets */}
        <Card className="mb-4">
          <PresetsManager
            presets={presets}
            onRefresh={() => setPresetsRefreshKey(k => k + 1)}
          />
        </Card>

        {/* Diuretic presets */}
        <Card className="mb-4">
          <DiureticPresetsManager
            presets={diureticPresets}
            onRefresh={() => setDiureticPresetsRefreshKey(k => k + 1)}
          />
        </Card>

        {/* Appearance */}
        <Card className="mb-4">
          <SectionLabel label="Appearance" />
          <SegmentedControl
            options={[
              { value: 'light',  label: 'Light' },
              { value: 'system', label: 'System' },
              { value: 'dark',   label: 'Dark' },
            ]}
            value={theme}
            onChange={(v) => setTheme(v as ThemePreference)}
          />
        </Card>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: '#0D4F78', borderRadius: 12, paddingVertical: 14,
            alignItems: 'center', marginBottom: 12, opacity: saving ? 0.5 : 1,
          }}
        >
          {saving
            ? <ActivityIndicator color="white" />
            : <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Save changes</Text>
          }
        </TouchableOpacity>

        {/* Account */}
        <Card className="mb-4">
          <SectionLabel label="Account" />
          <View style={{ gap: 12 }}>
            <TouchableOpacity
              onPress={handleLogout}
              style={{ borderWidth: 2, borderColor: c.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: c.textMuted }}>Log out</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleDeleteAccount}
              disabled={deleting}
              style={{ borderWidth: 2, borderColor: '#D95F5F', borderRadius: 12, paddingVertical: 12, alignItems: 'center', opacity: deleting ? 0.5 : 1 }}
            >
              {deleting
                ? <ActivityIndicator size="small" color="#D95F5F" />
                : <Text style={{ fontSize: 14, fontWeight: '600', color: '#D95F5F' }}>Delete account</Text>
              }
            </TouchableOpacity>
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  )
}
