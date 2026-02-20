import { getProfile, getTodayLogs } from '@/lib/water'
import { ProgressRing, ProgressBar, QuickAdd, LogList } from '@/components/water'
import { Card } from '@/components/ui'

export default async function DashboardPage() {
  const [profile, logs] = await Promise.all([getProfile(), getTodayLogs()])

  const goal = profile?.daily_goal_ml ?? 2500
  const consumed = logs.reduce((sum, log) => sum + log.amount_ml, 0)

  return (
    <main className="min-h-screen bg-surface p-6">
      <div className="max-w-lg mx-auto flex flex-col gap-6">

        {/* App bar */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-blue-deep">Güater</h1>
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

      </div>
    </main>
  )
}