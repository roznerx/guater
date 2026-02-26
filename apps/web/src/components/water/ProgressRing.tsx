import { getHydrationProgress } from '@/lib/hydration'

interface ProgressRingProps {
  consumed: number
  goal: number
}

export default function ProgressRing({ consumed, goal }: ProgressRingProps) {
  const { percentage, remaining } = getHydrationProgress(consumed, goal)

  return (
    <div
      className="flex items-center gap-5"
      role="img"
      aria-label={`Hydration progress: ${percentage}% of daily goal reached`}
    >
      <div
        aria-hidden="true"
        className="w-24 h-24 rounded-full flex items-center justify-center relative border-2 border-blue-deep flex-shrink-0"
        style={{
          background: `conic-gradient(#1A6FA0 0% ${percentage}%, #E8EEF4 ${percentage}% 100%)`,
          boxShadow: '3px 3px 0 #0D4F78',
        }}
      >
        <div className="absolute w-16 h-16 bg-white dark:bg-dark-card rounded-full border-2 border-border" />
        <span className="relative z-10 text-sm font-bold text-blue-core dark:text-blue-light">
          {percentage}%
        </span>
      </div>

      {/* Stats */}
      <div>
        <div className="text-3xl font-bold text-blue-deep dark:text-blue-light leading-none">
          {consumed.toLocaleString('en-US')}
          <span className="text-base font-semibold text-text-muted dark:text-dark-text-muted ml-1">ml</span>
        </div>
        <div className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mt-1">
          {remaining > 0
            ? `${remaining.toLocaleString('en-US')} ml to go · goal ${goal.toLocaleString('en-US')}`
            : 'Goal reached! 🌊'
          }
        </div>
      </div>
    </div>
  )
}
