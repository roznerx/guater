import { View, Text } from 'react-native'

interface AuthBannerProps {
  message: string
  type: 'error' | 'success'
}

export default function AuthBanner({ message, type }: AuthBannerProps) {
  const borderColor = type === 'error' ? 'border-status-error' : 'border-teal-core'
  const textColor   = type === 'error' ? 'text-status-error'   : 'text-teal-deep'
  return (
    <View
      accessibilityRole={type === 'error' ? 'alert' : 'text'}
      className={`bg-white dark:bg-dark-card border-2 ${borderColor} rounded-xl px-4 py-3 mb-4`}
    >
      <Text className={`text-sm ${textColor}`}>{message}</Text>
    </View>
  )
}
