import { useCallback, useState } from 'react'
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
import { getHydrationProgress } from '@guater/utils'
import type { DiureticLog, DiureticPreset } from '@guater/types'
import StreakBadge from '@/components/water/StreakBadge'
import { useStreak } from '@/lib/useStreak'
import { useFocusEffect } from 'expo-router'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useThemeColors } from '@/lib/useThemeColors'

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
  
  const tabBarHeight = useBottomTabBarHeight()
  const c = useThemeColors()
  
  const timezone = profile?.timezone ?? 'UTC'
  const goal = profile?.daily_goal_ml ?? 2500

  const [dayOffset, setDayOffset] = useState(0)
  const isToday = dayOffset === 0

  const shiftedDate = new Date()
  shiftedDate.setDate(shiftedDate.getDate() + dayOffset)

  const [refreshKey, setRefreshKey] = useState(0)
  function refresh() { setRefreshKey(k => k + 1) }

  const { waterLogs, diureticLogs, loading: logsLoading } = useTodayLogs(user?.id, timezone, refreshKey, dayOffset)
  const { presets, refresh: refreshPresets } = usePresets(user?.id)
  const { presets: diureticUserPresets, refresh: refreshDiureticPresets } = useDiureticPresets(user?.id)

  const [addingWater, setAddingWater] = useState(false)
  const [addingDiuretic, setAddingDiuretic] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [showClearConfirm, setShowClearConfirm] = useState(false)
  const [clearing, setClearing] = useState(false)

  const consumed = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0)
  const { overGoal } = getHydrationProgress(consumed, goal)
  const netDiureticLoss = diureticLogs.reduce(
    (sum, log) => sum + Math.round(log.amount_ml * log.diuretic_factor), 0
  )
  const isOverGoal = overGoal > 0
  const streak = useStreak(user?.id, goal, timezone)
  
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

  useFocusEffect(
    useCallback(() => {
      refreshPresets()
      refreshDiureticPresets()
    }, [refreshPresets, refreshDiureticPresets])
  )

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
      const { start, end } = getTodayRange(timezone, dayOffset)
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
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}>

        {/* Header with day navigation */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16 }}>
          <Text className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">
            {isToday
              ? 'Today'
              : shiftedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone })
            }
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setDayOffset(o => o - 1)}
              style={{
                width: 32, height: 32,
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, borderWidth: 2, borderColor: '#0D4F78',
                backgroundColor: c.card,
                shadowColor: '#0D4F78', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
              }}
            >
              <Text style={{ color: '#0D4F78', fontWeight: '700', fontSize: 16, lineHeight: 18 }}>‹</Text>
            </TouchableOpacity>
            <View style={{
              borderRadius: 999, borderWidth: 2, borderColor: '#0D4F78',
              backgroundColor: c.selectedBg, paddingHorizontal: 12, paddingVertical: 4,
              shadowColor: '#0D4F78', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: '#4A6070' }}>
                {shiftedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone })}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setDayOffset(o => o + 1)}
              disabled={isToday}
              style={{
                width: 32, height: 32,
                alignItems: 'center', justifyContent: 'center',
                borderRadius: 10, borderWidth: 2, borderColor: '#0D4F78',
                backgroundColor: c.card,
                shadowColor: '#0D4F78', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
              }}
            >
              <Text style={{ color: '#0D4F78', fontWeight: '700', fontSize: 16, lineHeight: 18 }}>›</Text>
            </TouchableOpacity>
            {isToday && streak > 0 && (
              <View>
                <StreakBadge streak={streak} />
              </View>
            )}
          </View>
        </View>

        {/* Over goal warning */}
        {isOverGoal && (
          <View className="bg-white dark:bg-dark-card border-2 border-status-warning rounded-2xl px-4 py-3 mb-4">
            <Text className="text-status-warning text-sm font-semibold">
              ⚠️ You've exceeded your daily goal!
            </Text>
          </View>
        )}

        {/* Progress — dims during loading to signal data is refreshing */}
        <Card className="mb-4">
          <View style={{ opacity: logsLoading ? 0.4 : 1 }}>
            <WaterBottle consumed={consumed} goal={goal} />
          </View>
          {logsLoading && (
            <ActivityIndicator
              color="#1A6FA0"
              style={{ position: 'absolute', alignSelf: 'center', top: '40%' }}
            />
          )}
          {netDiureticLoss > 0 && !logsLoading && (
            <Text className="text-xs font-semibold text-status-error text-center mt-3">
              -{netDiureticLoss} ml net loss from diuretics
            </Text>
          )}
        </Card>

        {/* Quick Add — today only */}
        {isToday && (
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
                  className={`border-2 border-blue-deep bg-blue-pale dark:bg-dark-card rounded-xl px-4 py-2 ${addingWater ? 'opacity-50' : ''}`}
                >
                  <Text className="text-sm font-semibold text-blue-deep dark:text-blue-light">
                    {preset.label}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowCustomInput(v => !v)}
                className="border-2 border-blue-deep bg-white dark:bg-dark-card rounded-xl px-4 py-2"
              >
                <Text className="text-sm font-semibold text-blue-deep">+ Custom</Text>
              </TouchableOpacity>
            </View>
            {showCustomInput && (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <TextInput
                  style={{ flex: 1, borderWidth: 2, borderColor: '#0D4F78', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: c.textPrimary, backgroundColor: c.inputBg }}
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
                  style={{ backgroundColor: '#0D4F78', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10, opacity: addingWater ? 0.5 : 1 }}
                >
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>Add</Text>
                </TouchableOpacity>
              </View>
            )}
          </Card>
        )}

        {/* Diuretic Tracker — today only */}
        {isToday && (
          <Card className="mb-4">
            <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-3">
              Diuretic drinks
            </Text>
            {netDiureticLoss > 0 && (
              <View className="bg-surface dark:bg-dark-surface border-2 border-border dark:border-dark-border rounded-xl px-3 py-2 mb-3">
                <Text className="text-xs font-semibold text-text-muted dark:text-dark-text-muted">
                  Net loss today: <Text className="text-status-error">-{netDiureticLoss} ml</Text>
                </Text>
              </View>
            )}
            <View className="flex-row flex-wrap gap-2">
              {allDiureticPresets.map(preset => (
                <TouchableOpacity
                  key={preset.id}
                  onPress={() => handleAddDiuretic(preset)}
                  disabled={addingDiuretic}
                  style={{
                    borderWidth: 2,
                    borderColor: preset.color,
                    borderRadius: 12,
                    paddingHorizontal: 16,
                    paddingVertical: 8,
                    opacity: addingDiuretic ? 0.5 : 1,
                  }}
                >
                  <Text style={{ fontSize: 13, fontWeight: '600', color: preset.color }}>
                    {preset.label} 
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </Card>
        )}

        {/* Log */}
        <Card>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted">
              {isToday ? "Today's log" : 'Log'}
            </Text>
            {isToday && mergedLogs.length > 0 && (
              <TouchableOpacity onPress={() => setShowClearConfirm(true)}>
                <Text className="text-xs font-semibold text-text-muted dark:text-dark-text-muted">
                  Clear all
                </Text>
              </TouchableOpacity>
            )}
          </View>

          {mergedLogs.length === 0 ? (
            <Text className="text-sm text-text-muted dark:text-dark-text-muted text-center py-4">
              {isToday ? 'No logs yet today. Start drinking! 💧' : 'No logs for this day.'}
            </Text>
          ) : (
            <View style={{ gap: 8 }}>
              {mergedLogs.map(({ type, log }) => {
                const diureticLog = type === 'diuretic' ? log as DiureticLog : null
                const netLoss = diureticLog
                  ? Math.round(diureticLog.amount_ml * diureticLog.diuretic_factor)
                  : 0
                const isDeleting = deletingId === log.id

                return (
                  <View
                    key={`${type}-${log.id}`}
                    style={{
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderWidth: 2,
                      borderColor: '#0D4F78',
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                      backgroundColor: c.inputBg, 
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
                      <Text>{type === 'water' ? '💧' : '☕'}</Text>
                      <Text style={{ fontWeight: '600', color: c.selectedText, fontSize: 14 }}>
                        {type === 'water' ? `${log.amount_ml} ml` : diureticLog!.label}
                      </Text>
                      {diureticLog && (
                        <Text style={{ fontSize: 12, color: c.textMuted }}>
                          {diureticLog.amount_ml} ml
                        </Text>
                      )}
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                      {diureticLog && (
                        <Text style={{ fontSize: 12, fontWeight: '600', color: '#D95F5F' }}>
                          -{netLoss} ml
                        </Text>
                      )}
                      <Text style={{ fontSize: 12, color: '#94A8BA' }}>
                        {new Date(log.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                      {isToday && (
                        <TouchableOpacity
                          onPress={() => handleDeleteLog(log.id, type)}
                          disabled={isDeleting}
                          accessibilityLabel="Delete entry"
                          style={{
                            width: 24, height: 24,
                            alignItems: 'center', justifyContent: 'center',
                            borderRadius: 6, borderWidth: 2, borderColor: c.border,
                            backgroundColor: c.card,
                            opacity: isDeleting ? 0.5 : 1,
                          }}
                        >
                          {isDeleting
                            ? <ActivityIndicator size="small" color="#94A8BA" />
                            : <Text style={{ fontSize: 11, color: '#94A8BA' }}>✕</Text>
                          }
                        </TouchableOpacity>
                      )}
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
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 24 }}>
          <View style={{ width: '100%', backgroundColor: c.card, borderRadius: 16, borderWidth: 2, borderColor: c.border, padding: 24 }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: c.textPrimary, marginBottom: 8 }}>
              Clear all logs?
            </Text>
            <Text style={{ fontSize: 14, color: c.textMuted, marginBottom: 24 }}>
              This will delete all water and diuretic logs for this day.
            </Text>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity
                onPress={() => setShowClearConfirm(false)}
                disabled={clearing}
                style={{ flex: 1, borderWidth: 2, borderColor: c.border, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 14, fontWeight: '600', color: c.textMuted }}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleClearAll}
                disabled={clearing}
                style={{ flex: 1, borderWidth: 2, borderColor: '#D95F5F', borderRadius: 12, paddingVertical: 12, alignItems: 'center', opacity: clearing ? 0.5 : 1 }}
              >
                {clearing
                  ? <ActivityIndicator size="small" color="#D95F5F" />
                  : <Text style={{ fontSize: 14, fontWeight: '600', color: '#D95F5F' }}>Clear all</Text>
                }
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  )
}
