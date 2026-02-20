interface WaterBottleProps {
  consumed: number
  goal: number
}

export default function WaterBottle({ consumed, goal }: WaterBottleProps) {
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100)
  const remaining = Math.max(goal - consumed, 0)

  // Bottle body goes from y=50 to y=137 = 87px total
  const bottleTop = 34
  const bottleBottom = 137
  const bottleHeight = bottleBottom - bottleTop
  const fillHeight = bottleHeight * (percentage / 100)
  const fillY = bottleBottom - fillHeight
  const waveY = fillY
  const wavePath = percentage >= 100
  ? ''
  : `M12 ${waveY} Q26 ${waveY - 5} 40 ${waveY} Q54 ${waveY + 5} 68 ${waveY} L68 ${waveY} L12 ${waveY} Z`

  return (
    <div className="flex flex-col items-center gap-4">

      <svg
        width="100"
        height="184"
        viewBox="0 0 80 148"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <clipPath id="bottleClip">
            <path d="M26 34 C20 34 12 42 12 50 L12 128 C12 133 16 137 21 137 L59 137 C64 137 68 133 68 128 L68 50 C68 42 60 34 54 34 Z" />
          </clipPath>
          <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7FB8D8" />
            <stop offset="100%" stopColor="#1A6FA0" />
          </linearGradient>
        </defs>

        {/* Water fill */}
        <g clipPath="url(#bottleClip)">
          <rect
            x="12"
            y={fillY}
            width="56"
            height={bottleBottom - fillY + 10}
            fill="url(#waterGrad)"
            style={{ transition: 'y 0.6s ease, height 0.6s ease' }}
          />
          {percentage < 100 && (
            <path
              d={wavePath}
              fill="#7FB8D8"
              opacity="0.7"
            />
          )}
        </g>

        {/* Cap */}
        <rect x="30" y="10" width="20" height="10" rx="4" fill="white" stroke="#0D4F78" strokeWidth="2.5" />
        {/* Neck */}
        <path d="M28 19 L24 34" stroke="#0D4F78" strokeWidth="2.5" strokeLinecap="round" />
        <path d="M52 19 L56 34" stroke="#0D4F78" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="28" y1="19" x2="52" y2="19" stroke="#0D4F78" strokeWidth="2.5" />
        {/* Body outline */}
        <path
          d="M24 34 C18 34 12 42 12 50 L12 128 C12 133 16 137 21 137 L59 137 C64 137 68 133 68 128 L68 50 C68 42 62 34 56 34 Z"
          stroke="#0D4F78"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Tick marks */}
        <line x1="60" y1="65" x2="68" y2="65" stroke="#DDE8F0" strokeWidth="1.5" />
        <line x1="60" y1="84" x2="68" y2="84" stroke="#DDE8F0" strokeWidth="1.5" />
        <line x1="60" y1="103" x2="68" y2="103" stroke="#DDE8F0" strokeWidth="1.5" />
        <line x1="60" y1="122" x2="68" y2="122" stroke="#DDE8F0" strokeWidth="1.5" />
      </svg>

      {/* Stats */}
      <div className="text-center">
        <div className="text-4xl font-bold text-blue-deep leading-none">
          {percentage >= 100 ? '100%' : `${percentage}%`}
        </div>
        <div className="text-lg font-semibold text-blue-core mt-1">
          {consumed.toLocaleString()} ml
        </div>
        <div className="text-sm font-medium text-text-muted mt-1">
          {consumed >= goal
            ? 'Goal reached! 🌊'
            : `${remaining.toLocaleString()} ml to go · goal ${goal.toLocaleString()}`
          }
        </div>
        {consumed > goal && (
          <div className="text-xs font-medium text-teal-core mt-1">
            +{(consumed - goal).toLocaleString()} ml over goal
          </div>
        )}
      </div>

    </div>
  )
}