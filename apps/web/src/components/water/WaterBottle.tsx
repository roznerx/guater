import { getHydrationProgress } from '@/lib/hydration'
import { useId } from 'react'
import ProgressBar from '@/components/water/ProgressBar'

interface WaterBottleProps {
  consumed: number
  goal: number
}

export default function WaterBottle({ consumed, goal }: WaterBottleProps) {
  const uid = useId()
  const clipId = `bottleClip-${uid}`
  const gradId = `waterGrad-${uid}`
  const { percentage, remaining, overGoal } = getHydrationProgress(consumed, goal)

  const bottleTop = 34
  const bottleBottom = 137
  const bottleHeight = bottleBottom - bottleTop
  const fillHeight = bottleHeight * (percentage / 100)
  const fillY = bottleBottom - fillHeight
  const isFull = percentage >= 100
  const wavePath = `M12 ${fillY} Q26 ${fillY - 5} 40 ${fillY} Q54 ${fillY + 5} 68 ${fillY} L12 ${fillY} Z`

  return (
    <div className="flex flex-row items-center gap-6">
      {/* Bottle SVG */}
      <svg
        width="100"
        height="184"
        viewBox="0 0 80 148"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <clipPath id={clipId}>
            <path d="M26 34 C20 34 12 42 12 50 L12 128 C12 133 16 137 21 137 L59 137 C64 137 68 133 68 128 L68 50 C68 42 60 34 54 34 Z" />
          </clipPath>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7FB8D8" />
            <stop offset="100%" stopColor="#1A6FA0" />
          </linearGradient>
        </defs>
        <g clipPath={`url(#${clipId})`}>
          <rect
            x="12"
            y={fillY}
            width="56"
            height={bottleBottom - fillY + 10}
            fill={`url(#${gradId})`}
            style={{ transition: 'y 0.6s ease, height 0.6s ease' }}
          />
          {!isFull && (
            <path d={wavePath} fill="#7FB8D8" opacity="0.7" />
          )}
        </g>
        <rect x="30" y="10" width="20" height="10" rx="4" fill="white" stroke="#0D4F78" strokeWidth="2.5" />
        <path d="M28 19 L24 34" stroke="#0D4F78" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M52 19 L56 34" stroke="#0D4F78" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="19" x2="52" y2="19" stroke="#0D4F78" strokeWidth="2.5" />
        <path
          d="M24 34 C18 34 12 42 12 50 L12 128 C12 133 16 137 21 137 L59 137 C64 137 68 133 68 128 L68 50 C68 42 62 34 56 34 Z"
          stroke="#0D4F78"
          strokeWidth="2.5"
          fill="none"
        />
        <line x1="60" y1="65" x2="68" y2="65" stroke="#DDE8F0" strokeWidth="1.5" />
        <line x1="60" y1="84" x2="68" y2="84" stroke="#DDE8F0" strokeWidth="1.5" />
        <line x1="60" y1="103" x2="68" y2="103" stroke="#DDE8F0" strokeWidth="1.5" />
        <line x1="60" y1="122" x2="68" y2="122" stroke="#DDE8F0" strokeWidth="1.5" />
      </svg>

      {/* Stats */}
      <div className="flex flex-col justify-center gap-1 flex-1">
        <div className="text-5xl font-bold text-blue-deep dark:text-blue-light leading-none">
          {percentage}%
        </div>
        <div className="text-lg font-semibold text-blue-core dark:text-blue-light mt-1">
          {consumed.toLocaleString('en-US')} ml
        </div>
        <div className="text-sm font-medium text-text-muted dark:text-dark-text-muted mt-1">
          {isFull
            ? 'Goal reached! 🌊'
            : `${remaining.toLocaleString('en-US')} ml to go · goal ${goal.toLocaleString('en-US')}`
          }
        </div>
        {overGoal > 0 && (
          <div className="text-xs font-medium text-teal-core mt-1">
            +{overGoal.toLocaleString('en-US')} ml over goal
          </div>
        )}
        <div className="mt-3">
          <ProgressBar consumed={consumed} goal={goal} />
        </div>
      </div>
    </div>
  )
}
