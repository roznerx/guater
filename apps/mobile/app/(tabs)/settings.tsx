import { useState, useEffect } from 'react'
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/lib/AuthContext'
import { useProfile } from '@/lib/useProfile'
import { usePresets } from '@/lib/usePresets'
import { useDiureticPresets } from '@/lib/useDiureticPresets'
import { supabase } from '@/lib/supabase'
import { calculateRecommendedIntake } from '@guater/utils'
import Card from '@/components/ui/Card'
import PresetsManager from '@/components/water/PresetsManager'
import DiureticPresetsManager from '@/components/water/DiureticPresetsManager'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'

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
  { value: 'UTC',                            label: 'UTC' },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (ART)' },
  { value: 'America/New_York',               label: 'New York (EST)' },
  { value: 'America/Chicago',                label: 'Chicago (CST)' },
  { value: 'America/Denver',                 label: 'Denver (MST)' },
  { value: 'America/Los_Angeles',            label: 'Los Angeles (PST)' },
  { value: 'Europe/London',                  label: 'London (GMT)' },
  { value: 'Europe/Paris',                   label: 'Paris (CET)' },
]

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
          <Text style={{ fontSize: 13, fontWeight: '600', color: value === opt.value ? '#ffffff' : '#0D4F78' }}>
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
  const { profile, loading, refresh: refreshProfile } = useProfile(user?.id)

  const tabBarHeight = useBottomTabBarHeight()
  
  const [presetsRefreshKey, setPresetsRefreshKey] = useState(0)
  const [diureticPresetsRefreshKey, setDiureticPresetsRefreshKey] = useState(0)

  const { presets } = usePresets(user?.id, presetsRefreshKey)
  const { presets: diureticPresets } = useDiureticPresets(user?.id, diureticPresetsRefreshKey)

  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [age, setAge] = useState('')
  const [activityLevel, setActivityLevel] = useState<'sedentary' | 'moderate' | 'active' | 'very_active'>('moderate')
  const [climate, setClimate] = useState<'cold' | 'temperate' | 'hot'>('temperate')
  const [dailyGoal, setDailyGoal] = useState('2500')
  const [unit, setUnit] = useState<'ml' | 'oz'>('ml')
  const [timezone, setTimezone] = useState('UTC')

  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.display_name ?? '')
    setWeightKg(profile.weight_kg?.toString() ?? '')
    setAge(profile.age?.toString() ?? '')
    setActivityLevel((profile.activity_level as 'sedentary' | 'moderate' | 'active' | 'very_active') ?? 'moderate')
    setClimate((profile.climate as 'cold' | 'temperate' | 'hot') ?? 'temperate')
    setDailyGoal(profile.daily_goal_ml?.toString() ?? '2500')
    setUnit((profile.preferred_unit as 'ml' | 'oz') ?? 'ml')
    setTimezone(profile.timezone ?? 'UTC')
  }, [profile])

  const weight = parseFloat(weightKg)
  const ageNum = parseInt(age)
  const recommended = weight > 0 && ageNum > 0
    ? calculateRecommendedIntake(weight, ageNum, activityLevel, climate)
    : null

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

      refreshProfile()
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
        onPress: async () => { await supabase.auth.signOut() },
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
                onChange={(v) => setActivityLevel(v as 'sedentary' | 'moderate' | 'active' | 'very_active')}
              />
            </View>
            <View>
              <FieldLabel label="Climate" />
              <SegmentedControl
                options={CLIMATES}
                value={climate}
                onChange={(v) => setClimate(v as 'cold' | 'temperate' | 'hot')}
              />
            </View>
          </View>
        </Card>

        {/* Recommended intake */}
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
          <OptionList
            options={TIMEZONES}
            value={timezone}
            onChange={setTimezone}
          />
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
