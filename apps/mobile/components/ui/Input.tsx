import { View, Text, TextInput, TextInputProps } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  hint?: string
  error?: string
  suffix?: React.ReactNode
}

export default function Input({ label, hint, error, suffix, ...props }: InputProps) {
  const inputId = label?.toLowerCase().replace(/\s+/g, '-')
  const hasError = Boolean(error)
  return (
    <View className="flex flex-col gap-1.5">
      {label && (
        <Text
          nativeID={inputId}
          className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary"
        >
          {label}
        </Text>
      )}
      <View className={`flex-row items-center border-2 rounded-xl bg-white dark:bg-dark-card ${hasError ? 'border-status-error' : 'border-blue-deep'}`}>
        <TextInput
          accessibilityLabelledBy={inputId}
          accessibilityState={{ disabled: props.editable === false }}
          placeholderTextColor="#94A8BA"
          className="flex-1 px-3 py-3 text-sm text-text-primary dark:text-dark-text-primary"
          {...props}
        />
        {suffix && (
          <View className="px-3">
            {suffix}
          </View>
        )}
      </View>
      {error && (
        <Text className="text-xs text-status-error font-medium">{error}</Text>
      )}
      {hint && !error && (
        <Text className="text-xs text-text-muted dark:text-dark-text-muted">{hint}</Text>
      )}
    </View>
  )
}
