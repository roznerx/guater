import { View, Text } from 'react-native'

interface AuthHeaderProps {
  subtitle: string
}

export default function AuthHeader({ subtitle }: AuthHeaderProps) {
  return (
    <View className="mb-10">
      <Text className="text-4xl font-bold text-blue-deep dark:text-blue-light mb-2">
        Güater
      </Text>
      <Text className="text-base text-text-muted dark:text-dark-text-muted">
        {subtitle}
      </Text>
    </View>
  )
}
