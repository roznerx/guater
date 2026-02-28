import Navbar from "@/components/layout/Navbar"
import Card from "@/components/ui/Card"
import DailyWarningBanner from "@/components/water/DailyWarningBanner"
import DiureticTracker from "@/components/water/diuretics/DiureticTracker"
import DiureticWarningBanner from "@/components/water/diuretics/DiureticWarningBanner"
import LogList from "@/components/water/LogList"
import QuickAdd from "@/components/water/QuickAdd"
import StreakBadge from "@/components/water/StreakBadge"
import WaterBottle from "@/components/water/WaterBottle"
import { getTodayDiureticLogs, getDiureticPresets } from "@/lib/supabase/queries/diuretics"
import { getPresets } from "@/lib/supabase/queries/presets"
import { getProfile } from "@/lib/supabase/queries/profile"
import { getTodayLogs, getStreak } from "@/lib/supabase/queries/water"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>
}) {
  const { day } = await searchParams
  const offset = parseInt(day ?? '0')
  const safeOffset = Math.min(Math.max(isNaN(offset) ? 0 : offset, -30), 0)

  const profile = await getProfile()
  const timezone = profile?.timezone ?? 'UTC'
  const goal = profile?.daily_goal_ml ?? 2500

  const shiftedDate = new Date()
  shiftedDate.setDate(shiftedDate.getDate() + safeOffset)

  const [logs, presets, diureticLogs, diureticPresets, streak] = await Promise.all([
    getTodayLogs(timezone, safeOffset),
    getPresets(),
    getTodayDiureticLogs(timezone, safeOffset),
    getDiureticPresets(),
    getStreak(goal, timezone),
  ])
  
  const consumed = logs.reduce((sum, log) => sum + log.amount_ml, 0)
  const isToday = safeOffset === 0

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <Navbar displayName={profile?.display_name ?? undefined} />
      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text-secondary dark:text-dark-text-secondary">
            {isToday ? 'Today' : shiftedDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: timezone })}
          </h2>
          <div className="flex items-center gap-2">
            <a     
              href={`/?day=${safeOffset - 1}`}
              aria-label="Previous day"
              className="w-8 h-8 flex items-center justify-center rounded-xl border-2 border-blue-deep bg-white dark:bg-dark-card text-blue-deep shadow-[3px_3px_0_#0D4F78] hover:opacity-70 transition-opacity"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 2 4 7 9 12" />
              </svg>
            </a>
            <div className="text-sm font-semibold text-text-muted dark:text-dark-text-muted bg-blue-pale dark:bg-dark-card border-2 border-blue-deep dark:border-dark-border rounded-full px-3 py-1 shadow-[2px_2px_0_#0D4F78]">
              {shiftedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: timezone })}
            </div>
            <a
               href={isToday ? '#' : `/?day=${safeOffset + 1}`}
                aria-disabled={isToday}
                aria-label="Next day"
                 className={`w-8 h-8 flex items-center justify-center rounded-xl border-2 border-blue-deep bg-white dark:bg-dark-card text-blue-deep shadow-[3px_3px_0_#0D4F78] transition-opacity ${isToday ? 'opacity-30 cursor-not-allowed' : 'hover:opacity-70'}`}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="5 2 10 7 5 12" />
              </svg>
            </a>
          </div>
        </div>

        {isToday && streak > 0 && (
          <div className="mb-6">
            <StreakBadge streak={streak} />
          </div>
        )}

        <DailyWarningBanner consumed={consumed} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 lg:items-stretch">
          <div className="flex flex-col gap-6">
            <Card className="flex-1 flex flex-col justify-center">
              <WaterBottle consumed={consumed} goal={goal} />
            </Card>
            {isToday && (
              <Card>
                <QuickAdd presets={presets} />
              </Card>
            )}
          </div>
          <div className="flex flex-col gap-6">
            {isToday && (
              <Card>
                <DiureticWarningBanner logs={diureticLogs} />
                <DiureticTracker logs={diureticLogs} presets={diureticPresets} />
              </Card>
            )}
            <Card>
              <LogList logs={logs} diureticLogs={diureticLogs} />
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
