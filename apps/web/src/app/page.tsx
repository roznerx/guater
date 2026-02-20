import { getProfile, getTodayLogs } from '@/lib/water'
import { ProgressRing, ProgressBar, QuickAdd, LogList } from '@/components/water'
import { Card } from '@/components/ui'
import Navbar from '@/components/layout/Navbar'

export default async function DashboardPage() {
  const [profile, logs] = await Promise.all([getProfile(), getTodayLogs()])

  const goal = profile?.daily_goal_ml ?? 2500
  const consumed = logs.reduce((sum, log) => sum + log.amount_ml, 0)

  return (
    <div className="min-h-screen bg-surface">
      <Navbar displayName={profile?.display_name ?? undefined} />

      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        {/* Date chip */}
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-secondary">Today</h2>
          <div className="text-sm font-semibold text-text-muted bg-blue-pale border-2 border-blue-deep rounded-full px-3 py-1 shadow-[2px_2px_0_#0D4F78]">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {/* Progress card */}
        <Card>
          <ProgressRing consumed={consumed} goal={goal} />
          <div className="mt-4">
            <ProgressBar consumed={consumed} goal={goal} />
          </div>
        </Card>

        {/* Quick add */}
        <Card>
          <QuickAdd />
        </Card>

        {/* Log list */}
        <Card>
          <LogList logs={logs} />
        </Card>

      </main>
    </div>
  )
}