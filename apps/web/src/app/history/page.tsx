import { getProfile, getWeeklyLogs } from '@/lib/water'
import { Card } from '@/components/ui'
import Navbar from '@/components/layout/Navbar'
import type { WaterLog } from '@guater/types'

function groupByDay(logs: WaterLog[]): Record<string, number> {
  return logs.reduce((acc, log) => {
    const day = new Date(log.logged_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    })
    acc[day] = (acc[day] ?? 0) + log.amount_ml
    return acc
  }, {} as Record<string, number>)
}

export default async function HistoryPage() {
  const [profile, logs] = await Promise.all([getProfile(), getWeeklyLogs()])
  const goal = profile?.daily_goal_ml ?? 2500
  const grouped = groupByDay(logs)
  const days = Object.entries(grouped).reverse()

  return (
    <div className="min-h-screen bg-surface">
      <Navbar displayName={profile?.display_name ?? undefined} />

      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        <h2 className="text-xl font-bold text-text-secondary">History</h2>

        <Card>
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-4">
            Last 7 days
          </div>

          {days.length === 0 && (
            <p className="text-sm text-text-muted text-center py-4">
              No logs yet. Start drinking! 💧
            </p>
          )}

          <div className="flex flex-col gap-3">
            {days.map(([date, total]) => {
              const percentage = Math.min(Math.round((total / goal) * 100), 100)
              const reached = total >= goal

              return (
                <div key={date}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-sm font-semibold text-text-primary">
                      {date}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-blue-core">
                        {total.toLocaleString()} ml
                      </span>
                      {reached && (
                        <span className="text-xs font-semibold bg-teal-light border-2 border-teal-deep text-teal-deep px-2 py-0.5 rounded-full">
                          Goal
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="h-3 bg-slate-soft rounded-full border-2 border-blue-deep overflow-hidden">
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

      </main>
    </div>
  )
}