import { View, Text, TextInput, TextInputProps } from 'react-native'

interface InputProps extends TextInputProps {
  label?: string
  hint?: string
  suffix?: React.ReactNode
}

export default function Input({ label, hint, suffix, ...props }: InputProps) {
  return (
    <View className="flex flex-col gap-1.5">
      {label && (
        <Text className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
          {label}
        </Text>
      )}
      <View className="flex-row items-center border-2 border-blue-deep rounded-xl bg-white dark:bg-dark-card">
        <TextInput
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
      {hint && (
        <Text className="text-xs text-text-muted dark:text-dark-text-muted">
          {hint}
        </Text>
      )}
    </View>
  )
}
