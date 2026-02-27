import { useState } from 'react'
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useAuth } from '@/lib/AuthContext'
import { useProfile } from '@/lib/useProfile'
import { usePresets } from '@/lib/usePresets'
import { useTodayLogs } from '@/lib/useTodayLogs'
import { supabase } from '@/lib/supabase'
import type { DiureticLog } from '@guater/types'

const DEFAULT_AMOUNTS = [250, 500, 750]

export default function DashboardScreen() {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfile(user?.id)
  const timezone = profile?.timezone ?? 'UTC'
  const goal = profile?.daily_goal_ml ?? 2500

  const { waterLogs, diureticLogs, loading: logsLoading, refresh } = useTodayLogs(user?.id, timezone)
  const { presets } = usePresets(user?.id)

  const [adding, setAdding] = useState(false)

  const consumed = waterLogs.reduce((sum, log) => sum + log.amount_ml, 0)
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100)
  const remaining = Math.max(goal - consumed, 0)
  const netDiureticLoss = diureticLogs.reduce(
    (sum, log) => sum + Math.round(log.amount_ml * log.diuretic_factor), 0
  )

  async function handleQuickAdd(amount: number) {
    if (!user || adding) return
    setAdding(true)
    try {
      await supabase.from('water_logs').insert({
        user_id: user.id,
        amount_ml: amount,
        source: 'quick',
      })
      refresh()
    } finally {
      setAdding(false)
    }
  }

  if (profileLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface dark:bg-dark-surface">
        <ActivityIndicator color="#1A6FA0" />
      </SafeAreaView>
    )
  }

  const allPresets = [
    ...DEFAULT_AMOUNTS.map(amount => ({ id: `default-${amount}`, label: `${amount} ml`, amount_ml: amount })),
    ...presets.map(p => ({ id: p.id, label: `${p.label} (${p.amount_ml} ml)`, amount_ml: p.amount_ml })),
  ]

  const mergedLogs = [
    ...waterLogs.map(log => ({ type: 'water' as const, log })),
    ...diureticLogs.map(log => ({ type: 'diuretic' as const, log })),
  ].sort((a, b) => new Date(b.log.logged_at).getTime() - new Date(a.log.logged_at).getTime())

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingBottom: 32 }}>

        {/* Header */}
        <View className="flex-row justify-between items-center py-4">
          <Text className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">
            Today
          </Text>
          <Text className="text-sm font-semibold text-text-muted dark:text-dark-text-muted bg-blue-pale border-2 border-blue-deep rounded-full px-3 py-1">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone })}
          </Text>
        </View>

        {/* Progress */}
        <View className="bg-white dark:bg-dark-card rounded-2xl border-2 border-border dark:border-dark-border p-6 mb-4">
          <View className="items-center mb-4">
            <Text className="text-5xl font-bold text-blue-deep dark:text-blue-light">
              {consumed.toLocaleString()}
            </Text>
            <Text className="text-base text-text-muted dark:text-dark-text-muted mt-1">
              of {goal.toLocaleString()} ml
            </Text>
            <Text className="text-sm font-semibold text-blue-core dark:text-blue-light mt-1">
              {percentage}%
            </Text>
          </View>

          <View
            role="progressbar"
            className="h-4 bg-slate-soft dark:bg-dark-surface rounded-full border-2 border-blue-deep overflow-hidden"
          >
            <View
              className="h-full rounded-full bg-blue-core"
              style={{ width: `${percentage}%` }}
            />
          </View>

          {/* Remaining or goal reached */}
          <Text className="text-xs text-text-muted dark:text-dark-text-muted text-center mt-2">
            {remaining > 0
              ? `${remaining.toLocaleString()} ml to go`
              : 'Goal reached! 🌊'
            }
          </Text>

          {netDiureticLoss > 0 && (
            <Text className="text-xs font-semibold text-status-error text-center mt-1">
              -{netDiureticLoss} ml net loss from diuretics
            </Text>
          )}
        </View>

        {/* Quick Add */}
        <View className="bg-white dark:bg-dark-card rounded-2xl border-2 border-border dark:border-dark-border p-4 mb-4">
          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-3">
            Quick add
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {allPresets.map(preset => (
              <TouchableOpacity
                key={preset.id}
                onPress={() => handleQuickAdd(preset.amount_ml)}
                disabled={adding}
                className="border-2 border-blue-deep bg-blue-pale rounded-xl px-4 py-2 disabled:opacity-50"
              >
                <Text className="text-sm font-semibold text-blue-deep">
                  {preset.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Today's Log */}
        <View className="bg-white dark:bg-dark-card rounded-2xl border-2 border-border dark:border-dark-border p-4">
          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-3">
            Today's log
          </Text>

          {logsLoading ? (
            <ActivityIndicator color="#1A6FA0" className="py-4" />
          ) : mergedLogs.length === 0 ? (
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

                return (
                  <View
                    key={`${type}-${log.id}`}
                    className="flex-row justify-between items-center px-4 py-3 rounded-xl border-2 border-border dark:border-dark-border bg-surface dark:bg-dark-surface"
                  >
                    <View className="flex-row items-center gap-3">
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
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}
