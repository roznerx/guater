import { useState } from 'react'
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity, useWindowDimensions } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getHydrationProgress, getMonthBounds } from '@guater/utils'
import Card from '@/components/ui/Card'
import type { WaterLog } from '@guater/types'
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs'
import { useAuth } from '@/lib/context/AuthContext'
import { useProfileContext } from '@/lib/context/ProfileContext'
import { useMonthlyLogs } from '@/lib/hooks/useMonthlyLogs'
import { useThemeColors } from '@/lib/hooks/useThemeColors'

function groupByDay(
  logs: Pick<WaterLog, 'logged_at' | 'amount_ml'>[],
  timezone: string,
): Record<string, number> {
  return logs.reduce((acc, log) => {
    const day = new Date(log.logged_at).toLocaleDateString('en-CA', { timeZone: timezone })
    acc[day] = (acc[day] ?? 0) + log.amount_ml
    return acc
  }, {} as Record<string, number>)
}

function formatDate(isoDate: string, timezone: string) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month:    'short',
    day:      'numeric',
    timeZone: timezone,
  })
}

function NavButton({
  onPress,
  label,
  disabled,
  cardBg,
}: {
  onPress: () => void
  label: string
  disabled: boolean
  cardBg: string
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={{
        width: 32, height: 32,
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 10, borderWidth: 2, borderColor: '#0D4F78',
        backgroundColor: cardBg,
        shadowColor: '#0D4F78', shadowOffset: { width: 3, height: 3 }, shadowOpacity: 1, shadowRadius: 0,
        opacity: disabled ? 0.3 : 1,
      }}
    >
      <Text style={{ color: '#0D4F78', fontWeight: '700', fontSize: 16, lineHeight: 18 }}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}

export default function HistoryScreen() {
  const { user } = useAuth()
  const { profile, loading: profileLoading } = useProfileContext()
  const tabBarHeight = useBottomTabBarHeight()
  const c = useThemeColors()
  const { width: screenWidth } = useWindowDimensions()

  const timezone = profile?.timezone      ?? 'UTC'
  const goal = profile?.daily_goal_ml ?? 2500

  const [monthOffset, setMonthOffset] = useState(0)
  const isCurrentMonth = monthOffset === 0

  const { logs, loading: logsLoading } = useMonthlyLogs(user?.id, timezone, monthOffset)
  const { label, daysInMonth, monthStr } = getMonthBounds(monthOffset, timezone)

  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: timezone })

  if (profileLoading) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-surface dark:bg-dark-surface">
        <ActivityIndicator color="#1A6FA0" />
      </SafeAreaView>
    )
  }

  const grouped = groupByDay(logs, timezone)
  const days = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))

  const last7: [string, number][] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key   = d.toLocaleDateString('en-CA', { timeZone: timezone })
    const total = grouped[key] ?? 0
    return [key, total]
  })

  const totalDays    = days.length
  const daysHitGoal  = days.filter(([, total]) => total >= goal).length
  const goalHitRate  = totalDays > 0 ? Math.round((daysHitGoal / totalDays) * 100) : 0
  const weeklyAverage = last7.length > 0
    ? Math.round(last7.reduce((sum, [, total]) => sum + total, 0) / last7.length)
    : 0

  const bestDay = days.reduce(
    (best, [date, total]) => total > best.total ? { date, total } : best,
    { date: '', total: 0 },
  )

  const CALENDAR_PADDING = 32  
  const cellSize = Math.floor((screenWidth - CALENDAR_PADDING * 2 - 6 * 5) / 7)

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const key   = `${monthStr}-${String(i + 1).padStart(2, '0')}`
    const total = grouped[key] ?? 0
    const pct   = Math.min(total / goal, 1)
    return { key, total, pct }
  })

  return (
    <SafeAreaView className="flex-1 bg-surface dark:bg-dark-surface">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: tabBarHeight + 16 }}>

        <View className="py-4">
          <Text className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">
            History
          </Text>
        </View>

        {/* Summary stats */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <Card className="flex-1 items-center">
            <Text className="text-2xl font-bold text-blue-deep dark:text-blue-light">
              {weeklyAverage.toLocaleString()}
            </Text>
            <Text className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mt-1 text-center">
              ml / day avg
            </Text>
            <Text className="text-xs text-text-muted dark:text-dark-text-muted text-center">
              last 7 days
            </Text>
          </Card>
          <Card className="flex-1 items-center">
            <Text className="text-2xl font-bold text-blue-deep dark:text-blue-light">
              {goalHitRate}%
            </Text>
            <Text className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mt-1 text-center">
              goal hit rate
            </Text>
            <Text className="text-xs text-text-muted dark:text-dark-text-muted text-center">
              this month
            </Text>
          </Card>
          <Card className="flex-1 items-center">
            <Text className="text-2xl font-bold text-blue-deep dark:text-blue-light">
              {bestDay.total > 0 ? bestDay.total.toLocaleString() : '—'}
            </Text>
            <Text className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mt-1 text-center">
              best day
            </Text>
            <Text className="text-xs text-text-muted dark:text-dark-text-muted text-center">
              {bestDay.date ? formatDate(bestDay.date, timezone) : 'no data'}
            </Text>
          </Card>
        </View>

        {/* Last 7 days bars */}
        <Card className="mb-4">
          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-4">
            Last 7 days
          </Text>
          {logsLoading ? (
            <View style={{ paddingVertical: 16, alignItems: 'center' }}>
              <ActivityIndicator color="#1A6FA0" />
            </View>
          ) : last7.every(([, t]) => t === 0) ? (
            <Text className="text-sm text-text-muted dark:text-dark-text-muted text-center py-4">
              No logs yet. Start drinking! 💧
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {last7.map(([date, total]) => {
                const { percentage } = getHydrationProgress(total, goal)
                const reached = total >= goal
                return (
                  <View key={date}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <Text className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                        {formatDate(date, timezone)}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text className="text-sm font-bold text-blue-core dark:text-blue-light">
                          {total > 0 ? `${total.toLocaleString()} ml` : '—'}
                        </Text>
                        {reached && (
                          <View className="bg-teal-light dark:bg-dark-card border-2 border-teal-deep rounded-full px-2 py-0.5">
                            <Text className="text-xs font-semibold text-teal-deep">Goal</Text>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={{ height: 12, borderRadius: 999, borderWidth: 2, borderColor: '#0D4F78', overflow: 'hidden', backgroundColor: c.progressTrack }}>
                      <View style={{ height: '100%', borderRadius: 999, backgroundColor: reached ? '#2AABA2' : '#1A6FA0', width: `${percentage}%` }} />
                    </View>
                  </View>
                )
              })}
            </View>
          )}
        </Card>

        {/* Monthly heatmap with navigation */}
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <NavButton
              onPress={() => setMonthOffset(o => o - 1)}
              label="‹"
              disabled={false}
              cardBg={c.card}
            />
            <View style={{
              borderRadius: 999, borderWidth: 2, borderColor: '#0D4F78',
              backgroundColor: c.selectedBg, paddingHorizontal: 12, paddingVertical: 4,
              shadowColor: '#0D4F78', shadowOffset: { width: 2, height: 2 }, shadowOpacity: 1, shadowRadius: 0,
            }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: c.textSecondary }}>
                {label}
              </Text>
            </View>
            <NavButton
              onPress={() => setMonthOffset(o => o + 1)}
              label="›"
              disabled={isCurrentMonth}
              cardBg={c.card}
            />
          </View>

          <Text className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-4">
            {label}
          </Text>

          {logsLoading ? (
            <View style={{ paddingVertical: 24, alignItems: 'center' }}>
              <ActivityIndicator color="#1A6FA0" />
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5 }}>
              {calendarDays.map(({ key, total, pct }, i) => {
                const isToday  = key === todayKey
                const isFuture = key > todayKey
                const bgColor  = isFuture
                  ? 'transparent'
                  : total === 0
                    ? c.progressTrack
                    : pct >= 1
                      ? '#2AABA2'
                      : pct >= 0.5
                        ? '#1A6FA0'
                        : '#7FB8D8'

                return (
                  <View
                    key={key}
                    style={{
                      width: cellSize,
                      height: cellSize,
                      paddingTop:  4,
                      paddingLeft: 4,
                      borderRadius: 4,
                      borderWidth: 2,
                      borderStyle: isFuture ? 'dashed' : 'solid',
                      borderColor: isToday ? '#0D4F78' : isFuture ? c.border : 'transparent',
                      backgroundColor: bgColor,
                    }}
                  >
                    <Text style={{
                      fontSize:   cellSize * 0.32,
                      fontWeight: '600',
                      lineHeight: cellSize * 0.38,
                      color: isFuture
                        ? '#DDE8F0'
                        : total === 0
                          ? '#94A8BA'
                          : '#ffffff',
                    }}>
                      {String(i + 1)}
                    </Text>
                  </View>
                )
              })}
            </View>
          )}

          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            {[
              { color: c.progressTrack, label: 'None' },
              { color: '#7FB8D8', label: '<50%' },
              { color: '#1A6FA0', label: '<100%' },
              { color: '#2AABA2', label: 'Goal' },
            ].map(({ color, label: l }) => (
              <View key={l} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: color, borderWidth: 1, borderColor: c.border }} />
                <Text className="text-xs text-text-muted dark:text-dark-text-muted">{l}</Text>
              </View>
            ))}
          </View>
        </Card>

      </ScrollView>
    </SafeAreaView>
  )
}
