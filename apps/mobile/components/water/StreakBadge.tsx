import { View, Text } from 'react-native'

interface StreakBadgeProps {
  streak: number
}

export default function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null

  return (
    <View
      accessibilityLabel={`${streak} day streak`}
      style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#DFFAF4',
        borderWidth: 2,
        borderColor: '#1A7A74',
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 4,
        shadowColor: '#1A7A74',
        shadowOffset: { width: 2, height: 2 },
        shadowOpacity: 1,
        shadowRadius: 0,
      }}
    >
      <View
        aria-hidden
        style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: '#1A7A74' }}
      />
      <Text style={{ fontSize: 13, fontWeight: '600', color: '#1A7A74' }}>
        {streak} day{streak > 1 ? 's' : ''} streak
      </Text>
    </View>
  )
}
