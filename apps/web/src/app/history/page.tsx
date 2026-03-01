import Navbar from '@/components/layout/Navbar'
import Card from '@/components/ui/Card'
import { getMonthlyLogs } from '@/lib/supabase/queries/water'
import { getProfile } from '@/lib/supabase/queries/profile'
import { getHydrationProgress } from '@/lib/hydration'
import { getMonthBounds } from '@guater/utils'
import type { WaterLog } from '@guater/types'

function groupByDay(
  logs: Pick<WaterLog, 'logged_at' | 'amount_ml'>[],
  timezone: string
): Record<string, number> {
  return logs.reduce((acc, log) => {
    const day = new Date(log.logged_at).toLocaleDateString('en-CA', { timeZone: timezone })
    acc[day] = (acc[day] ?? 0) + log.amount_ml
    return acc
  }, {} as Record<string, number>)
}

function formatDate(isoDate: string) {
  return new Date(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams

  const profile = await getProfile()
  const timezone = profile?.timezone ?? 'UTC'
  const goal = profile?.daily_goal_ml ?? 2500

  const now = new Date()
  const currentMonthStr = now.toLocaleDateString('en-CA', { timeZone: timezone }).slice(0, 7)

  const safeMonth = month && /^\d{4}-\d{2}$/.test(month) && month <= currentMonthStr
    ? month
    : currentMonthStr

  const isCurrentMonth = safeMonth === currentMonthStr

  const [mYear, mMonth] = safeMonth.split('-').map(Number)
  const [cYear, cMonth] = currentMonthStr.split('-').map(Number)
  const monthOffset = (mYear - cYear) * 12 + (mMonth - cMonth)

  const { start, end, label, daysInMonth, monthStr: activeMonthStr } = getMonthBounds(monthOffset, timezone)
  const { monthStr: prevMonthStr } = getMonthBounds(monthOffset - 1, timezone)
  const { monthStr: nextMonthStr } = getMonthBounds(monthOffset + 1, timezone)

  const logs = await getMonthlyLogs(timezone, start, end)
  const grouped = groupByDay(logs, timezone)

  const days = Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b))
  const totalDays = days.length
  const daysHitGoal = days.filter(([, total]) => total >= goal).length
  const goalHitRate = totalDays > 0 ? Math.round((daysHitGoal / totalDays) * 100) : 0

  const last7 = days.slice(-7).reverse()
  const weeklyAverage = last7.length > 0
    ? Math.round(last7.reduce((sum, [, total]) => sum + total, 0) / last7.length)
    : 0

  const bestDay = days.reduce(
    (best, [date, total]) => total > best.total ? { date, total } : best,
    { date: '', total: 0 }
  )

  const todayKey = now.toLocaleDateString('en-CA', { timeZone: timezone })

  const calendarDays = Array.from({ length: daysInMonth }, (_, i) => {
    const key = `${activeMonthStr}-${String(i + 1).padStart(2, '0')}`
    const total = grouped[key] ?? 0
    const pct = Math.min(total / goal, 1)
    return { key, total, pct }
  })

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <Navbar displayName={profile?.display_name ?? undefined} />
      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">
        <h2 className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">
          History
        </h2>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-deep dark:text-blue-light">
              {weeklyAverage.toLocaleString('en-US')}
            </div>
            <div className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mt-1">ml / day avg</div>
            <div className="text-xs text-text-muted dark:text-dark-text-muted">last 7 days</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-deep dark:text-blue-light">
              {goalHitRate}%
            </div>
            <div className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mt-1">goal hit rate</div>
            <div className="text-xs text-text-muted dark:text-dark-text-muted">this month</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-deep dark:text-blue-light">
              {bestDay.total > 0 ? bestDay.total.toLocaleString('en-US') : '—'}
            </div>
            <div className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mt-1">best day</div>
            <div className="text-xs text-text-muted dark:text-dark-text-muted">
              {bestDay.date ? formatDate(bestDay.date) : 'no data'}
            </div>
          </Card>
        </div>

        {/* Last 7 days bars */}
        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-4">
            Last 7 days
          </div>
          {last7.length === 0 ? (
            <p className="text-sm text-text-muted dark:text-dark-text-muted text-center py-4">
              No logs yet. Start drinking! 💧
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {last7.map(([date, total]) => {
                const { percentage } = getHydrationProgress(total, goal)
                const reached = total >= goal
                return (
                  <div key={date}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">
                        {formatDate(date)}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-core dark:text-blue-light">
                          {total.toLocaleString('en-US')} ml
                        </span>
                        {reached && (
                          <span className="text-xs font-semibold bg-teal-light dark:bg-dark-card border-2 border-teal-deep text-teal-deep px-2 py-0.5 rounded-full">
                            Goal
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      role="progressbar"
                      aria-valuenow={percentage}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${formatDate(date)}: ${percentage}%`}
                      className="h-3 bg-slate-soft dark:bg-dark-surface rounded-full border-2 border-blue-deep overflow-hidden"
                    >
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${reached ? 'bg-teal-core' : 'bg-blue-core'}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Card>

        {/* Monthly heatmap with navigation */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <a
              href={`/history?month=${prevMonthStr}`}
              aria-label="Previous month"
              className="w-8 h-8 flex items-center justify-center rounded-xl border-2 border-blue-deep bg-white dark:bg-dark-card text-blue-deep shadow-[3px_3px_0_#0D4F78] hover:opacity-70 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 2 4 7 9 12" />
              </svg>
            </a>
            <div className="text-sm font-semibold text-text-muted dark:text-dark-text-muted bg-blue-pale dark:bg-dark-card border-2 border-blue-deep dark:border-dark-border rounded-full px-3 py-1 shadow-[2px_2px_0_#0D4F78]">
              {label}
            </div>
            <a
              href={isCurrentMonth ? '#' : `/history?month=${nextMonthStr}`}
              aria-disabled={isCurrentMonth}
              aria-label="Next month"
              className={`w-8 h-8 flex items-center justify-center rounded-xl border-2 border-blue-deep bg-white dark:bg-dark-card text-blue-deep shadow-[3px_3px_0_#0D4F78] transition-opacity ${isCurrentMonth ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="5 2 10 7 5 12" />
              </svg>
            </a>
          </div>

          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-4">
            {label}
          </div>

          <div className="grid grid-cols-7 gap-1.5">
            {calendarDays.map(({ key, total, pct }, i) => {
              const isToday = key === todayKey
              const isFuture = key > todayKey
              const bgColor = isFuture
                ? 'bg-transparent'
                : total === 0
                  ? 'bg-slate-soft dark:bg-dark-border'
                  : pct >= 1
                    ? 'bg-teal-core'
                    : pct >= 0.5
                      ? 'bg-blue-core'
                      : 'bg-blue-light'

              return (
                <div
                  key={key}
                  title={isFuture ? '' : `${formatDate(key)}: ${total.toLocaleString('en-US')}ml`}
                  className={`
                    aspect-square rounded-md border-2 transition-all
                    ${bgColor}
                    ${isToday
                      ? 'border-blue-deep'
                      : isFuture
                        ? 'border-dashed border-slate-soft dark:border-dark-border'
                        : 'border-transparent'
                    }
                  `}
                >
                  <span className={`text-xs font-semibold leading-none pl-2
                  ${isFuture
                    ? 'text-slate-soft dark:text-dark-border'
                    : total === 0
                      ? 'text-text-muted dark:text-dark-text-muted'
                      : 'text-white'
                  }
                `}>
                  {String(i + 1)}
                </span>
                </div>
              )
            })}
            
          </div>

          <div className="flex items-center gap-3 mt-4 justify-end">
            {[
              { cls: 'bg-slate-soft dark:bg-dark-border border border-border', label: 'None' },
              { cls: 'bg-blue-light', label: '<50%' },
              { cls: 'bg-blue-core', label: '<100%' },
              { cls: 'bg-teal-core', label: 'Goal' },
            ].map(({ cls, label: l }) => (
              <div key={l} className="flex items-center gap-1.5">
                <div className={`w-3 h-3 rounded-sm ${cls}`} />
                <span className="text-xs text-text-muted dark:text-dark-text-muted">{l}</span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
