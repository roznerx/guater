import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, TextInput, Modal } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/lib/AuthContext'
import { useProfile } from '@/lib/useProfile'
import { usePresets } from '@/lib/usePresets'
import { useTodayLogs, getTodayRange } from '@/lib/useTodayLogs'
import { useDiureticPresets } from '@/lib/useDiureticPresets'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import WaterBottle from '@/components/water/WaterBottle'
import type { DiureticLog, DiureticPreset } from '@guater/types'

const DEFAULT_WATER_AMOUNTS = [250, 500, 750]

const DEFAULT_DIURETIC_PRESETS: Omit<DiureticPreset, 'id' | 'user_id' | 'sort_order'>[] = [
  { label: 'Coffee',    amount_ml: 250, diuretic_factor: 0.40, color: '#4A6070' },
  { label: 'Espresso',  amount_ml: 60,  diuretic_factor: 0.50, color: '#0D4F78' },
  { label: 'Black tea', amount_ml: 250, diuretic_factor: 0.25, color: '#E8A230' },
  { label: 'Beer',      amount_ml: 330, diuretic_factor: 0.50, color: '#E8A230' },
  { label: 'Wine',      amount_ml: 150, diuretic_factor: 0.60, color: '#94A8BA' },
]

export default function DashboardScreen() {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfile(user?.id)
  const timezone = profile?.timezone ?? 'UTC'
  const goal = profile?.daily_goal_ml ?? 2500

  const [refreshKey, setRefreshKey] = useState(0)
  function refresh() { setRefreshKey(k => k + 1) }

  const { waterLogs, diureticLogs } = useTodayLogs(user?.id, timezone, refreshKey)
  const { presets } = usePresets(user?.id)
  const { presets: diureticUserPresets } = useDiureticPresets(user?.id)

  const [addingWater, setAddingWater] = useState(false)
  const [addingDiuretic, setAddingDiuretic] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  const consumed = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0)
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100)
  const netDiureticLoss = diureticLogs.reduce(
    (sum, log) => sum + Math.round(log.amount_ml * log.diuretic_factor), 0
  )
  const isOverGoal = consumed > goal

  const allWaterPresets = [
    ...DEFAULT_WATER_AMOUNTS.map(amount => ({
      id: `default-${amount}`,
      label: `${amount} ml`,
      amount_ml: amount,
    })),
    ...presets.map(p => ({
      id: p.id,
      label: `${p.label} (${p.amount_ml} ml)`,
      amount_ml: p.amount_ml,
    })),
  ]

  const allDiureticPresets = [
    ...DEFAULT_DIURETIC_PRESETS.map((p, i) => ({
      ...p,
      id: `default-${i}`,
      user_id: '',
      sort_order: i,
    })),
    ...diureticUserPresets,
  ]

  const mergedLogs = [
    ...waterLogs.map(log => ({ type: 'water' as const, log })),
    ...diureticLogs.map(log => ({ type: 'diuretic' as const, log })),
  ].sort((a, b) => new Date(b.log.logged_at).getTime() - new Date(a.log.logged_at).getTime())

  async function handleQuickAdd(amount: number) {
    if (!user || addingWater) return
    setAddingWater(true)
    try {
      await supabase.from('water_logs').insert({
        user_id: user.id,
        amount_ml: amount,
        source: 'quick',
      })
      refresh()
    } finally {
      setAddingWater(false)
    }
  }

  async function handleAddDiuretic(preset: DiureticPreset) {
    if (!user || addingDiuretic) return
    setAddingDiuretic(true)
    try {
      await supabase.from('diuretic_logs').insert({
        user_id: user.id,
        preset_id: preset.id.startsWith('default-') ? null : preset.id,
        label: preset.label,
        amount_ml: preset.amount_ml,
        diuretic_factor: preset.diuretic_factor,
      })
      refresh()
    } finally {
      setAddingDiuretic(false)
    }
  }

  async function handleDeleteLog(id: string, type: 'water' | 'diuretic') {
    if (deletingId) return
    setDeletingId(id)
    try {
      await supabase
        .from(type === 'water' ? 'water_logs' : 'diuretic_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id)
      refresh()
    } finally {
      setDeletingId(null)
    }
  }

  async function handleClearAll() {
    if (!user) return
    setClearing(true)
    try {
      const { start, end } = getTodayRange(timezone)
      await Promise.all([
        supabase
          .from('water_logs')
          .delete()
          .eq('user_id', user.id)
          .gte('logged_at', start)
          .lt('logged_at', end),
        supabase
          .from('diuretic_logs')
          .delete()
          .eq('user_id', user.id)
          .gte('logged_at', start)
          .lt('logged_at', end),
      ])
      refresh()
    } finally {
      setClearing(false)
      setShowClearConfirm(false)
    }
  }

  if (profileLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface dark:bg-dark-surface">
        <ActivityIndicator color="#1A6FA0" />
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <Text className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">
            Today
          </Text>
          <Text className="text-sm font-semibold text-text-muted dark:text-dark-text-muted bg-blue-pale border-2 border-blue-deep rounded-full px-3 py-1">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone })}
          </Text>
        </View>

        {/* Over goal warning */}
        {isOverGoal && (
          <View className="bg-white dark:bg-dark-card border-2 border-status-warning rounded-2xl px-4 py-3 mb-4">
            <Text className="text-status-warning text-sm font-semibold">
              ⚠️ You've exceeded your daily goal!
            </Text>
          </View>
        )}

        {/* Diuretic warning */}
        {netDiureticLoss >= 200 && (
          <View className="bg-white dark:bg-dark-card border-2 border-status-error rounded-2xl px-4 py-3 mb-4">
            <Text className="text-status-error text-sm font-semibold">
              ☕ High diuretic intake — consider drinking more water.
            </Text>
          </View>
        )}

        {/* Progress */}
        <Card className="mb-4">
          <WaterBottle consumed={consumed} goal={goal} compact />
          {netDiureticLoss > 0 && (
            <Text className="text-xs font-semibold text-status-error text-center mt-3">
              -{netDiureticLoss} ml net loss from diuretics
            </Text>
          )}
        </Card>

        {/* Quick Add */}
        <Card className="mb-4">
          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-3">
            Quick add
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {allWaterPresets.map(preset => (
              <TouchableOpacity
                key={preset.id}
                onPress={() => handleQuickAdd(preset.amount_ml)}
                disabled={addingWater}
                className={`border-2 border-blue-deep bg-blue-pale rounded-xl px-4 py-2 ${addingWater ? 'opacity-50' : ''}`}
              >
                <Text className="text-sm font-semibold text-blue-deep">
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setShowCustomInput(v => !v)}
              className="border-2 border-blue-deep bg-white dark:bg-dark-card rounded-xl px-4 py-2"
            >
              <Text className="text-sm font-semibold text-blue-deep">
                + Custom
              </Text>
            </TouchableOpacity>
          </View>

          {showCustomInput && (
            <View className="flex-row items-center gap-2 mt-3">
              <TextInput
                className="flex-1 border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary dark:text-dark-text-primary bg-white dark:bg-dark-card"
                placeholder="Amount in ml"
                placeholderTextColor="#94A8BA"
                keyboardType="numeric"
                value={customAmount}
                onChangeText={setCustomAmount}
                returnKeyType="done"
                onSubmitEditing={() => {
                  const amount = parseInt(customAmount)
                  if (amount > 0) {
                    handleQuickAdd(amount)
                    setCustomAmount('')
                    setShowCustomInput(false)
                  }
                }}
              />
              <TouchableOpacity
                onPress={() => {
                  const amount = parseInt(customAmount)
                  if (!amount || amount <= 0) return
                  handleQuickAdd(amount)
                  setCustomAmount('')
                  setShowCustomInput(false)
                }}
                disabled={addingWater}
                className={`bg-blue-deep rounded-xl px-4 py-2.5 ${addingWater ? 'opacity-50' : ''}`}
              >
                <Text className="text-white font-semibold text-sm">Add</Text>
              </TouchableOpacity>
            </View>
          )}
        </Card>

        {/* Diuretic Tracker */}
        <Card className="mb-4">
          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-3">
            Diuretic drinks
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {allDiureticPresets.map(preset => (
              <TouchableOpacity
                key={preset.id}
                onPress={() => handleAddDiuretic(preset)}
                disabled={addingDiuretic}
                className={`border-2 rounded-xl px-4 py-2 ${addingDiuretic ? 'opacity-50' : ''}`}
                style={{ borderColor: preset.color }}
              >
                <Text className="text-sm font-semibold" style={{ color: preset.color }}>
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Today's Log */}
        <Card>
          <View className="flex-row justify-between items-center mb-3">
            <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted">
              Today's log
            </Text>
            {mergedLogs.length > 0 && (
              <TouchableOpacity onPress={() => setShowClearConfirm(true)}>
                <Text className="text-xs font-semibold text-text-muted dark:text-dark-text-muted">
                  Clear all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {mergedLogs.length === 0 ? (
            <Text className="text-sm text-text-muted dark:text-dark-text-muted text-center py-4">
              No logs yet today. Start drinking! 💧
            </Text>
          ) : (
            <View className="gap-2">
              {mergedLogs.map(({ type, log }) => {
                const diureticLog = type === 'diuretic' ? log as DiureticLog : null
                const netLoss = diureticLog
                  ? Math.round(diureticLog.amount_ml * diureticLog.diuretic_factor)
                  : 0
                const isDeleting = deletingId === log.id

                return (
                  <View
                    key={`${type}-${log.id}`}
                    className="flex-row justify-between items-center px-4 py-3 rounded-xl border-2 border-border dark:border-dark-border bg-surface dark:bg-dark-surface"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <Text>{type === 'water' ? '💧' : '☕'}</Text>
                      <Text className="font-semibold text-text-primary dark:text-dark-text-primary">
                        {type === 'water' ? `${log.amount_ml} ml` : diureticLog!.label}
                      </Text>
                      {diureticLog && (
                        <Text className="text-xs text-text-muted dark:text-dark-text-muted">
                          {diureticLog.amount_ml} ml
                        </Text>
                      )}
                    </View>
                    <View className="flex-row items-center gap-2">
                      {diureticLog && (
                        <Text className="text-xs font-semibold text-status-error">
                          -{netLoss} ml
                        </Text>
                      )}
                      <Text className="text-xs text-text-muted dark:text-dark-text-muted">
                        {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleDeleteLog(log.id, type)}
                        disabled={isDeleting}
                        accessibilityLabel={`Delete ${type === 'water' ? log.amount_ml + 'ml' : diureticLog?.label} entry`}
                        className={`w-6 h-6 items-center justify-center rounded-md border-2 border-border dark:border-dark-border bg-white dark:bg-dark-card ${isDeleting ? 'opacity-50' : ''}`}
                      >
                        {isDeleting
                          ? <ActivityIndicator size="small" color="#94A8BA" />
                          : <Text className="text-text-muted text-xs">✕</Text>
                        }
                      </TouchableOpacity>
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </Card>

      </ScrollView>

      {/* Clear all confirmation modal */}
      <Modal
        visible={showClearConfirm}
        transparent
        animationType="fade"
        onRequestClose={() => setShowClearConfirm(false)}
      >
        <View className="flex-1 bg-black/50 items-center justify-center px-6">
          <View className="w-full bg-white dark:bg-dark-card rounded-2xl border-2 border-border dark:border-dark-border p-6">
            <Text className="text-base font-bold text-text-primary dark:text-dark-text-primary mb-2">
              Clear all logs?
            </Text>
            <Text className="text-sm text-text-muted dark:text-dark-text-muted mb-6">
              This will delete all water and diuretic logs for today.
            </Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => setShowClearConfirm(false)}
                disabled={clearing}
                className="flex-1 border-2 border-border dark:border-dark-border rounded-xl py-3 items-center"
              >
                <Text className="text-sm font-semibold text-text-muted dark:text-dark-text-muted">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearAll}
                disabled={clearing}
                className={`flex-1 border-2 border-status-error rounded-xl py-3 items-center ${clearing ? 'opacity-50' : ''}`}
              >
                {clearing
                  ? <ActivityIndicator size="small" color="#D95F5F" />
                  : <Text className="text-sm font-semibold text-status-error">Clear all</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}
