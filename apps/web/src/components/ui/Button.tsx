import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'teal' | 'ghost'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:   'bg-blue-core text-white border-blue-deep shadow-[3px_3px_0_#0D4F78] hover:shadow-[1px_1px_0_#0D4F78] hover:translate-x-0.5 hover:translate-y-0.5',
  secondary: 'bg-blue-pale text-blue-deep border-blue-deep shadow-[3px_3px_0_#0D4F78] hover:shadow-[1px_1px_0_#0D4F78] hover:translate-x-0.5 hover:translate-y-0.5',
  teal:      'bg-teal-core text-white border-teal-deep shadow-[3px_3px_0_#1A7A74] hover:shadow-[1px_1px_0_#1A7A74] hover:translate-x-0.5 hover:translate-y-0.5',
  ghost:     'bg-white text-slate-deep border-border shadow-[3px_3px_0_#DDE8F0] hover:shadow-[1px_1px_0_#DDE8F0] hover:translate-x-0.5 hover:translate-y-0.5',
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`
        font-semibold rounded-xl px-4 py-2.5 text-sm
        border-2 transition-all cursor-pointer
        ${variants[variant]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}