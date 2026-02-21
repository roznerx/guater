import { getProfile, getTodayLogs, getStreak, getPresets, getTodayDiureticLogs, getDiureticPresets } from '@/lib/water'
import { WaterBottle, ProgressBar, QuickAdd, LogList, StreakBadge, DailyWarningBanner, DiureticTracker } from '@/components/water'
import { Card } from '@/components/ui'
import Navbar from '@/components/layout/Navbar'

export default async function DashboardPage() {
  const [profile, logs, presets, diureticLogs, diureticPresets] = await Promise.all([
    getProfile(),
    getTodayLogs(),
    getPresets(),
    getTodayDiureticLogs(),
    getDiureticPresets(),
  ])

  const goal = profile?.daily_goal_ml ?? 2500
  const consumed = logs.reduce((sum, log) => sum + log.amount_ml, 0)
  const streak = await getStreak(goal)
  const theme = (profile?.theme ?? 'light') as 'light' | 'dark'

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <Navbar displayName={profile?.display_name ?? undefined} theme={theme} />
      <main className="max-w-lg mx-auto px-6 py-8 flex flex-col gap-6">

        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">Today</h2>
          <div className="text-sm font-semibold text-text-muted bg-blue-pale border-2 border-blue-deep rounded-full px-3 py-1 shadow-[2px_2px_0_#0D4F78]">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {streak > 0 && <StreakBadge streak={streak} />}

        <DailyWarningBanner consumed={consumed} />

        <Card>
          <WaterBottle consumed={consumed} goal={goal} />
          <div className="mt-4">
            <ProgressBar consumed={consumed} goal={goal} />
          </div>
        </Card>

        <Card>
          <QuickAdd presets={presets} />
        </Card>

        <Card>
          <DiureticTracker logs={diureticLogs} presets={diureticPresets} />
        </Card>

        <Card>
          <LogList logs={logs} />
        </Card>

      </main>
    </div>
  )
}