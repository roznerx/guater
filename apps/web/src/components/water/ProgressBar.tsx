import { getHydrationProgress } from '@/lib/hydration'

interface ProgressBarProps {
  consumed: number
  goal: number
}

export default function ProgressBar({ consumed, goal }: ProgressBarProps) {
  const { percentage } = getHydrationProgress(consumed, goal)

  return (
    <div
      role="progressbar"
      aria-valuenow={percentage}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Hydration progress: ${percentage}%`}
      className="h-3 bg-slate-soft dark:bg-dark-surface rounded-full border-2 border-blue-deep overflow-hidden"
    >
      <div
        className="h-full bg-blue-core rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}
