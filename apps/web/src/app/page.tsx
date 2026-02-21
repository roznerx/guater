import { getProfile, getTodayLogs, getStreak, getPresets, getTodayDiureticLogs, getDiureticPresets } from '@/lib/water'
import { WaterBottle, ProgressBar, QuickAdd, LogList, StreakBadge, DailyWarningBanner } from '@/components/water'
import { DiureticTracker, DiureticWarningBanner } from '@/components/water/diuretics'
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

      <main className="max-w-5xl mx-auto px-6 py-8">

        {/* Page header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">Today</h2>
          <div className="text-sm font-semibold text-text-muted bg-blue-pale border-2 border-blue-deep rounded-full px-3 py-1 shadow-[2px_2px_0_#0D4F78]">
            {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </div>
        </div>

        {streak > 0 && <div className="mb-6"><StreakBadge streak={streak} /></div>}

        <DailyWarningBanner consumed={consumed} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 lg:items-stretch">

        {/* Left column */}
        <div className="flex flex-col gap-6">
          <Card className="flex-1 flex flex-col items-center justify-center">
            <WaterBottle consumed={consumed} goal={goal} />
            <div className="mt-4 w-full">
              <ProgressBar consumed={consumed} goal={goal} />
            </div>
          </Card>

          <Card>
            <QuickAdd presets={presets} />
          </Card>
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-6">
          <Card>
            <DiureticWarningBanner logs={diureticLogs} />
            <DiureticTracker logs={diureticLogs} presets={diureticPresets} />
          </Card>

          <Card>
            <LogList logs={logs} />
          </Card>
        </div>

      </div>
      </main>
    </div>
  )
}