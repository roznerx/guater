import { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hint?: string
}

export default function Input({
  label,
  hint,
  id,
  className = '',
  ...props
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-text-secondary">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`
          border-2 border-blue-deep rounded-xl px-3 py-2.5
          text-sm text-text-primary dark:text-dark-text-primary
          placeholder:text-text-muted dark:placeholder:text-dark-text-muted
          outline-none bg-white dark:bg-dark-card
          shadow-[3px_3px_0_#0D4F78]
          focus:shadow-[1px_1px_0_#0D4F78]
          focus:translate-x-0.5 focus:translate-y-0.5
          transition-all
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      />
      {hint && (
        <span className="text-xs text-text-muted">{hint}</span>
      )}
    </div>
  )
}