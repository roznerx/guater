interface MinBottleProps {
  label: string
  amount_ml: number
  diuretic_factor: number
  color: string
  filled?: boolean
}

function CoffeeIcon() {
  return (
    <svg width="36" height="42" viewBox="0 0 48 56" fill="none">
      <path d="M16 8 Q17 4 16 1" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M22 8 Q23 4 22 1" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M28 8 Q29 4 28 1" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8 12 L12 44 C12 46 14 48 16 48 L32 48 C34 48 36 46 36 44 L40 12 Z" fill="#C8895A" stroke="#0D4F78" strokeWidth="2"/>
      <path d="M10 18 L13 40 C13 41.5 14.5 43 16 43 L32 43 C33.5 43 35 41.5 35 40 L38 18 Z" fill="#5C3318"/>
      <rect x="7" y="10" width="34" height="5" rx="2.5" fill="#D4956A" stroke="#0D4F78" strokeWidth="2"/>
      <path d="M36 20 Q46 24 36 34" stroke="#0D4F78" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="24" cy="50" rx="20" ry="4" fill="#D4956A" stroke="#0D4F78" strokeWidth="2"/>
    </svg>
  )
}

function EspressoIcon() {
  return (
    <svg width="30" height="42" viewBox="0 0 40 56" fill="none">
      <path d="M16 10 Q17 7 16 5" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M22 10 Q23 7 22 5" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8 14 L11 36 C11 38 13 40 15 40 L25 40 C27 40 29 38 29 36 L32 14 Z" fill="#E8B88A" stroke="#0D4F78" strokeWidth="2"/>
      <path d="M10 20 L12 34 C12 35.5 13.5 37 15 37 L25 37 C26.5 37 28 35.5 28 34 L30 20 Z" fill="#2A1208"/>
      <ellipse cx="20" cy="21" rx="9" ry="2.5" fill="#8B5E1A" opacity="0.8"/>
      <rect x="7" y="12" width="26" height="4" rx="2" fill="#F0C8A0" stroke="#0D4F78" strokeWidth="2"/>
      <path d="M29 20 Q37 23 29 30" stroke="#0D4F78" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="20" cy="43" rx="16" ry="3.5" fill="#E8B88A" stroke="#0D4F78" strokeWidth="2"/>
    </svg>
  )
}

function BlackTeaIcon() {
  return (
    <svg width="36" height="42" viewBox="0 0 48 56" fill="none">
      <path d="M17 8 Q18 4 17 1" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M24 8 Q25 4 24 1" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8 14 C8 14 6 44 8 46 C10 48 14 50 24 50 C34 50 38 48 40 46 C42 44 40 14 40 14 Z" fill="#F5F0E8" stroke="#0D4F78" strokeWidth="2"/>
      <path d="M10 22 C10 22 9 43 10 44 C12 46 16 47 24 47 C32 47 36 46 38 44 C39 43 38 22 38 22 Z" fill="#2A1A0A"/>
      <path d="M8 14 C8 14 14 10 24 10 C34 10 40 14 40 14" stroke="#0D4F78" strokeWidth="2" fill="none"/>
      <path d="M9 17 C9 17 15 13.5 24 13.5 C33 13.5 39 17 39 17" stroke="#C8A84B" strokeWidth="1.5" fill="none"/>
      <line x1="24" y1="10" x2="24" y2="4" stroke="#94A8BA" strokeWidth="1.5"/>
      <rect x="21" y="2" width="6" height="4" rx="1" fill="#C8A87A" stroke="#0D4F78" strokeWidth="1.5"/>
      <path d="M40 22 Q50 28 40 38" stroke="#0D4F78" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="24" cy="52" rx="20" ry="4" fill="#F5F0E8" stroke="#0D4F78" strokeWidth="2"/>
      <ellipse cx="24" cy="52" rx="16" ry="2.5" fill="none" stroke="#C8A84B" strokeWidth="1"/>
    </svg>
  )
}

function GreenTeaIcon() {
  return (
    <svg width="36" height="42" viewBox="0 0 48 56" fill="none">
      <path d="M19 9 Q20 5 19 2" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M26 9 Q27 5 26 2" stroke="#94A8BA" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6"/>
      <path d="M8 14 C8 14 7 44 9 46 C11 48 15 50 24 50 C33 50 37 48 39 46 C41 44 40 14 40 14 Z" fill="#F0F7E8" stroke="#0D4F78" strokeWidth="2"/>
      <path d="M10 22 C10 22 9 43 10.5 44.5 C12.5 46.5 16 48 24 48 C32 48 35.5 46.5 37.5 44.5 C39 43 38 22 38 22 Z" fill="#7AB648" opacity="0.8"/>
      <path d="M8 14 C8 14 14 10 24 10 C34 10 40 14 40 14" stroke="#0D4F78" strokeWidth="2" fill="none"/>
      <path d="M9 17 C9 17 15 14 24 14 C33 14 39 17 39 17" stroke="#5A8A30" strokeWidth="1.5" fill="none"/>
      <path d="M16 32 Q20 26 24 32 Q20 38 16 32 Z" fill="#5A8A30" opacity="0.4"/>
      <ellipse cx="24" cy="52" rx="20" ry="4" fill="#F0F7E8" stroke="#0D4F78" strokeWidth="2"/>
    </svg>
  )
}

function MateIcon() {
  return (
    <svg width="32" height="46" viewBox="0 0 44 62" fill="none">
      {/* Bombilla straw */}
      <line x1="30" y1="2" x2="22" y2="50" stroke="#8B7355" strokeWidth="2.5" strokeLinecap="round"/>
      <ellipse cx="22" cy="50" rx="3" ry="4" fill="#8B7355" stroke="#0D4F78" strokeWidth="1.5"/>
      {/* Mate gourd — less round, more angular/tapered */}
      <path d="M14 20 C10 22 6 28 6 35 C6 44 10 54 22 56 C34 54 38 44 38 35 C38 28 34 22 30 20 C28 16 26 13 22 13 C18 13 16 16 14 20 Z" fill="#8B6B3D" stroke="#0D4F78" strokeWidth="2"/>
      {/* Mate liquid */}
      <path d="M14 26 C11 28 8 32 8 37 C8 45 12 53 22 54 C32 53 36 45 36 37 C36 32 33 28 30 26 Z" fill="#2D4A1E"/>
      {/* Texture lines */}
      <path d="M9 38 Q22 34 35 38" stroke="#6B5230" strokeWidth="1" fill="none" opacity="0.5"/>
      <path d="M9 44 Q22 40 35 44" stroke="#6B5230" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Rim */}
      <path d="M13 20 C14 17 18 14 22 14 C26 14 30 17 31 20 C32 22 32 24 22 25 C12 24 12 22 13 20 Z" fill="#A07840" stroke="#0D4F78" strokeWidth="2"/>
    </svg>
  )
}

function EnergyDrinkIcon() {
  return (
    <svg width="28" height="46" viewBox="0 0 36 60" fill="none">
      <path d="M6 14 L6 46 C6 49 11 52 18 52 C25 52 30 49 30 46 L30 14 Z" fill="#1A6FA0" stroke="#0D4F78" strokeWidth="2"/>
      <path d="M9 14 L9 46 C9 48 11 50 13 50 L13 14 Z" fill="white" opacity="0.15"/>
      <path d="M6 26 L30 26 L30 38 L6 38 Z" fill="#E8A020"/>
      <path d="M21 28 L16 34 L19 34 L14 40 L22 33 L19 33 Z" fill="white" stroke="white" strokeWidth="0.5"/>
      <path d="M6 26 L30 26" stroke="#0D4F78" strokeWidth="1.5"/>
      <path d="M6 38 L30 38" stroke="#0D4F78" strokeWidth="1.5"/>
      <ellipse cx="18" cy="14" rx="12" ry="3.5" fill="#2A8AC0" stroke="#0D4F78" strokeWidth="2"/>
      <ellipse cx="18" cy="10.5" rx="5" ry="2" fill="#1A6FA0" stroke="#0D4F78" strokeWidth="1.5"/>
      <rect x="16" y="9" width="4" height="3" rx="1" fill="#2A8AC0" stroke="#0D4F78" strokeWidth="1"/>
      <ellipse cx="18" cy="46" rx="12" ry="3.5" fill="#1A5A88" stroke="#0D4F78" strokeWidth="2"/>
    </svg>
  )
}

function CustomIcon({ color }: { color: string }) {
  return (
    <svg width="28" height="42" viewBox="0 0 36 52" fill="none">
      <path d="M6 10 L8 42 C8 44 10 46 12 46 L24 46 C26 46 28 44 28 42 L30 10 Z" fill={color} stroke="#0D4F78" strokeWidth="2" opacity="0.8"/>
      <rect x="5" y="8" width="26" height="5" rx="2.5" fill={color} stroke="#0D4F78" strokeWidth="2"/>
      <path d="M28 18 Q36 22 28 30" stroke="#0D4F78" strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  )
}

const ICON_MAP: Record<string, () => React.ReactElement> = {
  'Coffee': CoffeeIcon,
  'Espresso': EspressoIcon,
  'Black tea': BlackTeaIcon,
  'Green tea': GreenTeaIcon,
  'Mate': MateIcon,
  'Energy drink': EnergyDrinkIcon,
}

export default function MinBottle({
  label,
  amount_ml,
  diuretic_factor,
  color,
}: MinBottleProps) {
  const netLoss = Math.round(amount_ml * diuretic_factor)
  const IconComponent = ICON_MAP[label]

  return (
    <div className="flex flex-col items-center gap-1.5">
      {IconComponent ? <IconComponent /> : <CustomIcon color={color} />}
      <span className="text-xs font-semibold text-text-primary dark:text-dark-text-primary text-center leading-tight">
        {label}
      </span>
      <span className="text-xs text-status-error font-medium">
        -{netLoss} ml
      </span>
    </div>
  )
}