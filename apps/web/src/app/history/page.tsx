import { getProfile, getMonthlyLogs } from '@/lib/water'
import Navbar from '@/components/layout/Navbar'
import { WaterLog } from '@guater/types'
import Card from '@/components/ui/Card'

function groupByDay(logs: Pick<WaterLog, 'logged_at' | 'amount_ml'>[], timezone: string): Record<string, number> {
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

export default async function HistoryPage() {
  const profile = await getProfile()
  const timezone = profile?.timezone ?? 'UTC'
  const logs = await getMonthlyLogs(timezone)
  const goal = profile?.daily_goal_ml ?? 2500
  const grouped = groupByDay(logs, timezone)
  const theme = (profile?.theme ?? 'light') as 'light' | 'dark'

  const days = Object.entries(grouped)
  const totalDays = days.length
  const daysHitGoal = days.filter(([, total]) => total >= goal).length
  const goalHitRate = totalDays > 0 ? Math.round((daysHitGoal / totalDays) * 100) : 0
  const weeklyDays = days.slice(-7)
  const weeklyAverage = weeklyDays.length > 0
    ? Math.round(weeklyDays.reduce((sum, [, total]) => sum + total, 0) / weeklyDays.length)
    : 0
  const bestDay = days.reduce(
    (best, [date, total]) => total > best.total ? { date, total } : best,
    { date: '', total: 0 }
  )

  const last7 = days.slice(-7).reverse()

  const today = new Date()
  const calendarDays = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(today)
    date.setDate(date.getDate() - (29 - i))
    const key = date.toLocaleDateString('en-CA')
    const total = grouped[key] ?? 0
    const pct = Math.min(total / goal, 1)
    return { key, date, total, pct }
  })

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <Navbar displayName={profile?.display_name ?? undefined} theme={theme} />

      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        <h2 className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">History</h2>

        {/* Summary stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-deep dark:text-blue-light">{weeklyAverage.toLocaleString('en-US')}</div>
            <div className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mt-1">ml / day avg</div>
            <div className="text-xs text-text-muted dark:text-dark-text-muted">last 7 days</div>
          </Card>
          <Card className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-deep dark:text-blue-light">{goalHitRate}%</div>
            <div className="text-xs font-semibold text-text-muted dark:text-dark-text-muted mt-1">goal hit rate</div>
            <div className="text-xs text-text-muted dark:text-dark-text-muted">last 30 days</div>
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

          {last7.length === 0 && (
            <p className="text-sm text-text-muted dark:text-dark-text-muted text-center py-4">
              No logs yet. Start drinking! 💧
            </p>
          )}

          <div className="flex flex-col gap-3">
            {last7.map(([date, total]) => {
              const percentage = Math.min(Math.round((total / goal) * 100), 100)
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
                  <div className="h-3 bg-slate-soft dark:bg-dark-surface rounded-full border-2 border-blue-deep overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${reached ? 'bg-teal-core' : 'bg-blue-core'}`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Monthly calendar heatmap */}
        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-4">
            Last 30 days
          </div>
          <div className="grid grid-cols-10 gap-1.5">
            {calendarDays.map(({ key, total, pct }) => {
              const isToday = key === today.toLocaleDateString('en-CA', { timeZone: timezone })
              const bgColor = total === 0
                ? 'bg-slate-soft dark:bg-dark-border'
                : pct >= 1
                  ? 'bg-teal-core'
                  : pct >= 0.5
                    ? 'bg-blue-core'
                    : 'bg-blue-light'

              return (
                <div
                  key={key}
                  title={`${formatDate(key)}: ${total.toLocaleString('en-US')}ml`}
                  className={`
                    aspect-square rounded-md border-2 transition-all
                    ${bgColor}
                    ${isToday ? 'border-blue-deep' : 'border-transparent'}
                  `}
                />
              )
            })}
          </div>

          <div className="flex items-center gap-3 mt-4 justify-end">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-slate-soft dark:bg-dark-border border border-border dark:border-dark-border"></div>
              <span className="text-xs text-text-muted dark:text-dark-text-muted">None</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-light"></div>
              <span className="text-xs text-text-muted dark:text-dark-text-muted">&lt;50%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-core"></div>
              <span className="text-xs text-text-muted dark:text-dark-text-muted">&lt;100%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-teal-core"></div>
              <span className="text-xs text-text-muted dark:text-dark-text-muted">Goal</span>
            </div>
          </div>
        </Card>

      </main>
    </div>
  )
}
