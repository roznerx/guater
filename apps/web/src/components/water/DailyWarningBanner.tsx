const DAILY_WARNING_THRESHOLD = 6000

interface DailyWarningBannerProps {
  consumed: number
}

export default function DailyWarningBanner({ consumed }: DailyWarningBannerProps) {
  if (consumed < DAILY_WARNING_THRESHOLD) return null

  return (
    <div
      role="alert"
      className="border-2 border-warning bg-white dark:bg-dark-card rounded-xl px-4 py-3 shadow-[3px_3px_0_#E8A230] flex items-start gap-3"
    >
      <span aria-hidden="true" className="text-lg flex-shrink-0">⚠️</span>
      <div>
        <p className="text-sm font-bold text-warning">
          High daily intake
        </p>
        <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary mt-0.5">
          You&apos;ve logged {consumed.toLocaleString('en-US')}ml today. Drinking more than 6,000ml daily
          can be harmful. Consider consulting a doctor if this is a regular pattern.
        </p>
      </div>
    </div>
  )
}
