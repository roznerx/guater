import { TouchableOpacity, Text, ActivityIndicator } from 'react-native'

interface ButtonProps {
  onPress: () => void | Promise<void>
  label: string
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  loading?: boolean
  disabled?: boolean
  className?: string
}

const LOADING_COLORS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'white',
  secondary: '#1A6FA0',
  ghost:     '#94A8BA',
  danger:    '#D95F5F',
}

export default function Button({
  onPress,
  label,
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
}: ButtonProps) {
  const base = 'rounded-xl py-3 px-4 items-center justify-center flex-row'
  const variants = {
    primary:   'bg-blue-deep',
    secondary: 'bg-white dark:bg-dark-card border-2 border-blue-deep',
    ghost:     'border-2 border-border dark:border-dark-border',
    danger:    'border-2 border-status-error',
  }

  const textVariants = {
    primary:   'text-white font-semibold',
    secondary: 'text-blue-deep font-semibold',
    ghost:     'text-text-muted dark:text-dark-text-muted font-semibold',
    danger:    'text-status-error font-semibold',
  }
  
  const isDisabled = disabled || loading
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      className={`${base} ${variants[variant]} ${isDisabled ? 'opacity-50' : ''} ${className}`}
    >
      {loading
        ? <ActivityIndicator color={LOADING_COLORS[variant]} />
        : <Text className={`text-base ${textVariants[variant]}`}>{label}</Text>
      }
    </TouchableOpacity>
  )
}
