import { useState, useCallback, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/lib/AuthContext'
import { useProfile } from '@/lib/useProfile'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'

const ACTIVITY_LEVELS = [
  { value: 'sedentary',   label: 'Sedentary',   description: 'Mostly sitting' },
  { value: 'moderate',    label: 'Moderate',    description: 'Light exercise' },
  { value: 'active',      label: 'Active',      description: 'Daily exercise' },
  { value: 'very_active', label: 'Very active', description: 'Intense training' },
]

const CLIMATES = [
  { value: 'cold',      label: 'Cold' },
  { value: 'temperate', label: 'Temperate' },
  { value: 'hot',       label: 'Hot' },
]

const UNITS = [
  { value: 'ml', label: 'ml' },
  { value: 'oz', label: 'oz' },
]

const TIMEZONES = [
  { value: 'UTC',                              label: 'UTC' },
  { value: 'America/Argentina/Buenos_Aires',   label: 'Buenos Aires (ART)' },
  { value: 'America/New_York',                 label: 'New York (EST)' },
  { value: 'America/Chicago',                  label: 'Chicago (CST)' },
  { value: 'America/Denver',                   label: 'Denver (MST)' },
  { value: 'America/Los_Angeles',              label: 'Los Angeles (PST)' },
  { value: 'Europe/London',                    label: 'London (GMT)' },
  { value: 'Europe/Paris',                     label: 'Paris (CET)' },
]

function calculateRecommendedIntake(
  weightKg: number,
  age: number,
  activityLevel: string,
  climate: string
): number {
  const base = weightKg * 35
  const ageFactor = age > 55 ? 1.1 : 1
  const activityBonus: Record<string, number> = {
    sedentary: 0,
    moderate: 350,
    active: 600,
    very_active: 900,
  }
  const climateBonus: Record<string, number> = {
    cold: 0,
    temperate: 150,
    hot: 400,
  }
  return Math.round(
    base * ageFactor +
    (activityBonus[activityLevel] ?? 0) +
    (climateBonus[climate] ?? 0)
  )
}

function SegmentedControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <View style={{ flexDirection: 'row', borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12, overflow: 'hidden' }}>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            flex: 1,
            paddingVertical: 10,
            alignItems: 'center',
            backgroundColor: value === opt.value ? '#0D4F78' : '#ffffff',
            borderLeftWidth: i > 0 ? 2 : 0,
            borderLeftColor: '#0D4F78',
          }}
        >
          <Text style={{
            fontSize: 13,
            fontWeight: '600',
            color: value === opt.value ? '#ffffff' : '#0D4F78',
          }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

function OptionList({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string; description?: string }[]
  value: string
  onChange: (v: string) => void
}) {
  return (
    <View style={{ borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12, overflow: 'hidden' }}>
      {options.map((opt, i) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 16,
            paddingVertical: 12,
            backgroundColor: value === opt.value ? '#C8DCEE' : '#ffffff',
            borderTopWidth: i > 0 ? 2 : 0,
            borderTopColor: '#DDE8F0',
          }}
        >
          <View>
            <Text style={{ fontSize: 13, fontWeight: '600', color: '#0D4F78' }}>
              {opt.label}
            </Text>
            {opt.description && (
              <Text style={{ fontSize: 12, color: '#94A8BA', marginTop: 1 }}>
                {opt.description}
              </Text>
            )}
          </View>
          {value === opt.value && (
            <Text style={{ color: '#0D4F78', fontWeight: '700' }}>✓</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  )
}

function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#94A8BA', textTransform: 'uppercase', marginBottom: 8 }}>
      {label}
    </Text>
  )
}

function FieldLabel({ label }: { label: string }) {
  return (
    <Text style={{ fontSize: 13, fontWeight: '600', color: '#4A6070', marginBottom: 6 }}>
      {label}
    </Text>
  )
}

const inputStyle = {
  borderWidth: 2,
  borderColor: '#0D4F78',
  borderRadius: 12,
  paddingHorizontal: 12,
  paddingVertical: 10,
  fontSize: 14,
  color: '#0F2A3A',
  backgroundColor: '#ffffff',
}

export default function SettingsScreen() {
  const { user } = useAuth()
  const { profile, loading, refresh } = useProfile(user?.id)

  const [saving, setSaving] = useState(false)

  const [displayName, setDisplayName]     = useState(profile?.display_name ?? '')
  const [weightKg, setWeightKg]           = useState(profile?.weight_kg?.toString() ?? '')
  const [age, setAge]                     = useState(profile?.age?.toString() ?? '')
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level ?? 'moderate')
  const [climate, setClimate]             = useState(profile?.climate ?? 'temperate')
  const [dailyGoal, setDailyGoal]         = useState(profile?.daily_goal_ml?.toString() ?? '2500')
  const [unit, setUnit]                   = useState(profile?.preferred_unit ?? 'ml')
  const [timezone, setTimezone]           = useState(profile?.timezone ?? 'UTC')

  const weight = parseFloat(weightKg)
  const ageNum = parseInt(age)
  const recommended = weight > 0 && ageNum > 0
    ? calculateRecommendedIntake(weight, ageNum, activityLevel, climate)
    : null

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name ?? '')
    setWeightKg(profile.weight_kg?.toString() ?? '')
    setAge(profile.age?.toString() ?? '')
    setActivityLevel(profile.activity_level ?? 'moderate')
    setClimate(profile.climate ?? 'temperate')
    setDailyGoal(profile.daily_goal_ml?.toString() ?? '2500')
    setUnit((profile.preferred_unit as 'ml' | 'oz') ?? 'ml')
    setTimezone(profile.timezone ?? 'UTC')
  }, [profile])

  async function handleSave() {
    if (!user || saving) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          display_name:   displayName || null,
          daily_goal_ml:  parseInt(dailyGoal) || 2500,
          preferred_unit: unit,
          timezone,
          weight_kg:      weight > 0 ? weight : null,
          age:            ageNum > 0 ? ageNum : null,
          activity_level: activityLevel,
          climate,
        })
        .eq('id', user.id)

      if (error) {
        Alert.alert('Error', 'Failed to save settings. Please try again.')
        return
      }

      refresh()
      Alert.alert('Saved', 'Settings updated successfully.')
    } finally {
      setSaving(false)
    }
  }

  async function handleLogout() {
    Alert.alert('Log out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log out',
        style: 'destructive',
        onPress: async () => {
          await supabase.auth.signOut()
        },
      },
    ])
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
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header */}
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
                onChange={setActivityLevel}
              />
            </View>

            <View>
              <FieldLabel label="Climate" />
              <SegmentedControl
                options={CLIMATES}
                value={climate}
                onChange={setClimate}
              />
            </View>
          </View>
        </Card>

        {/* Recommended intake — shown when weight and age are filled */}
        {recommended && (
          <View style={{
            marginBottom: 16,
            borderWidth: 2,
            borderColor: '#0D4F78',
            borderRadius: 16,
            padding: 16,
            backgroundColor: '#C8DCEE',
          }}>
            <Text style={{ fontSize: 11, fontWeight: '700', letterSpacing: 1.5, color: '#1A6FA0', textTransform: 'uppercase', marginBottom: 6 }}>
              Recommended intake
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#0D4F78' }}>
                {recommended.toLocaleString()} ml / day
              </Text>
              <TouchableOpacity onPress={() => setDailyGoal(String(recommended))}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A6FA0' }}>
                  Use this →
                </Text>
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
          <OptionList
            options={TIMEZONES}
            value={timezone}
            onChange={setTimezone}
          />
        </Card>

        {/* Save */}
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          style={{
            backgroundColor: '#0D4F78',
            borderRadius: 12,
            paddingVertical: 14,
            alignItems: 'center',
            marginBottom: 12,
            opacity: saving ? 0.5 : 1,
          }}
        >
          {saving
            ? <ActivityIndicator color="white" />
            : <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>Save changes</Text>
          }
        </TouchableOpacity>

        {/* Account */}
        <Card>
          <SectionLabel label="Account" />
          <TouchableOpacity
            onPress={handleLogout}
            style={{
              borderWidth: 2,
              borderColor: '#DDE8F0',
              borderRadius: 12,
              paddingVertical: 12,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: '600', color: '#94A8BA' }}>
              Log out
            </Text>
          </TouchableOpacity>
        </Card>

      </ScrollView>
    </SafeAreaView>
  )
}
