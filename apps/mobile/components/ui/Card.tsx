import { View } from 'react-native'

interface CardProps {
  children: React.ReactNode
  className?: string
}

export default function Card({ children, className = '' }: CardProps) {
  return (
    <View className={`bg-white dark:bg-dark-card rounded-2xl border-2 border-border dark:border-dark-border p-4 ${className}`}>
      {children}
    </View>
  )
}
