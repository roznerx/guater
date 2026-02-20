interface ProgressBarProps {
  consumed: number
  goal: number
}

export default function ProgressBar({ consumed, goal }: ProgressBarProps) {
  const percentage = Math.min((consumed / goal) * 100, 100)

  return (
    <div className="h-3 bg-slate-soft dark:bg-dark-surface rounded-full border-2 border-blue-deep overflow-hidden">
      <div
        className="h-full bg-blue-core rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  )
}