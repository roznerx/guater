interface StreakBadgeProps {
  streak: number
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  return (
    <div
      aria-label={`${streak} day streak`}
      className="inline-flex items-center gap-2 bg-teal-light dark:bg-dark-card border-2 border-teal-deep rounded-full px-3 py-1 shadow-[2px_2px_0_#1A7A74]"
    >
      <div aria-hidden="true" className="w-2 h-2 rounded-full bg-teal-deep" />
      <span aria-hidden="true" className="text-sm font-semibold text-teal-deep">
        {streak} day{streak > 1 ? 's' : ''} streak
      </span>
    </div>
  )
}