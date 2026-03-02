import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'teal' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  fullWidth?: boolean
}

const variants: Record<Variant, string> = {
  primary:   'bg-blue-core text-white border-blue-deep shadow-[3px_3px_0_#0D4F78] dark:shadow-[3px_3px_0_#7FB8D8] hover:enabled:shadow-[1px_1px_0_#0D4F78] dark:hover:enabled:shadow-[1px_1px_0_#7FB8D8] hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
  secondary: 'bg-blue-pale dark:bg-dark-card text-blue-deep dark:text-blue-light border-blue-deep dark:border-dark-border shadow-[3px_3px_0_#0D4F78] hover:enabled:shadow-[1px_1px_0_#0D4F78] hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
  teal:      'bg-teal-core text-white border-teal-deep shadow-[3px_3px_0_#1A7A74] hover:enabled:shadow-[1px_1px_0_#1A7A74] hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
  ghost:     'bg-white dark:bg-dark-card text-slate-deep dark:text-dark-text-secondary border-border dark:border-dark-border shadow-[3px_3px_0_#DDE8F0] dark:shadow-[3px_3px_0_#2A3F52] hover:enabled:shadow-[1px_1px_0_#DDE8F0] dark:hover:enabled:shadow-[1px_1px_0_#2A3F52] hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
  danger:    'bg-status-error text-white border-status-error shadow-[3px_3px_0_#B34444] hover:enabled:shadow-[1px_1px_0_#B34444] hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5',
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  className = '',
  children,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`
        font-semibold rounded-xl px-4 py-2.5 text-sm
        border-2 transition-all cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
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
