import Svg, { Defs, ClipPath, Rect, Path, LinearGradient, Stop, G, Text as SvgText } from 'react-native-svg'
import { View, Text } from 'react-native'
import { useId } from 'react'

interface WaterBottleProps {
  consumed: number
  goal: number
  compact?: boolean
}

export default function WaterBottle({ consumed, goal, compact = false }: WaterBottleProps) {
  const percentage = Math.min(Math.round((consumed / goal) * 100), 100)
  const remaining = Math.max(goal - consumed, 0)

  const W = compact ? 72 : 120
  const H = compact ? 140 : 220
  const bottleTop = compact ? 24 : 40
  const bottleBottom = H - 10
  const bottleHeight = bottleBottom - bottleTop
  const fillHeight = (percentage / 100) * bottleHeight
  const fillY = bottleBottom - fillHeight

  const bottlePath = `
    M ${W * 0.35} ${compact ? 6 : 10}
    L ${W * 0.35} ${bottleTop}
    Q ${W * 0.1} ${bottleTop + 20} ${W * 0.1} ${bottleTop + 40}
    L ${W * 0.1} ${bottleBottom - 10}
    Q ${W * 0.1} ${bottleBottom} ${W * 0.2} ${bottleBottom}
    L ${W * 0.8} ${bottleBottom}
    Q ${W * 0.9} ${bottleBottom} ${W * 0.9} ${bottleBottom - 10}
    L ${W * 0.9} ${bottleTop + 40}
    Q ${W * 0.9} ${bottleTop + 20} ${W * 0.65} ${bottleTop}
    L ${W * 0.65} ${compact ? 6 : 10}
    Z
  `

 if (compact) {
  return (
    <View style={{ height: H, flexDirection: 'row' }}>
      <View style={{ width: W, height: H }}>
        <Svg width={W} height={H}>
          <Defs>
            <ClipPath id="bottle-clip-compact">
              <Path d={bottlePath} />
            </ClipPath>
            <LinearGradient id="water-grad-compact" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#1A6FA0" />
              <Stop offset="1" stopColor="#3E8FC0" />
            </LinearGradient>
          </Defs>
          <Path d={bottlePath} fill="#F4F8FB" stroke="#0D4F78" strokeWidth={2.5} />
          <G clipPath="url(#bottle-clip-compact)">
            <Rect x={0} y={fillY} width={W} height={fillHeight} fill="url(#water-grad-compact)" />
          </G>
          <Path d={bottlePath} fill="none" stroke="#0D4F78" strokeWidth={2.5} />
        </Svg>
      </View>

      <View style={{ flex: 1, marginLeft: 16, justifyContent: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: 'bold', color: '#0D4F78' }}>
          {consumed.toLocaleString()}
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#94A8BA' }}> ml</Text>
        </Text>
        <Text style={{ fontSize: 14, color: '#94A8BA', marginTop: 4 }}>
          {percentage}% of {goal.toLocaleString()} ml
        </Text>
        <Text style={{ fontSize: 14, color: '#94A8BA', marginTop: 2 }}>
          {remaining > 0
            ? `${remaining.toLocaleString()} ml to go`
            : 'Goal reached! 🌊'
          }
        </Text>
        <View style={{
          height: 12,
          marginTop: 12,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: '#0D4F78',
          overflow: 'hidden',
          backgroundColor: '#E8EEF4',
        }}>
          <View style={{
            height: '100%',
            borderRadius: 999,
            backgroundColor: '#1A6FA0',
            width: `${percentage}%`,
          }} />
        </View>
      </View>
    </View>
  )
}

  // Full size — original layout
  return (
    <View className="items-center">
      <Svg width={W} height={H}>
        <Defs>
          <ClipPath id="bottle-clip">
            <Path d={bottlePath} />
          </ClipPath>
          <LinearGradient id="water-grad" x1="0" y1="0" x2="1" y2="0">
            <Stop offset="0" stopColor="#1A6FA0" />
            <Stop offset="1" stopColor="#3E8FC0" />
          </LinearGradient>
        </Defs>
        <Path d={bottlePath} fill="#F4F8FB" stroke="#0D4F78" strokeWidth={2.5} />
        <G clipPath="url(#bottle-clip)">
          <Rect x={0} y={fillY} width={W} height={fillHeight} fill="url(#water-grad)" />
        </G>
        <Path d={bottlePath} fill="none" stroke="#0D4F78" strokeWidth={2.5} />
      </Svg>
      <View className="items-center mt-2">
        <Text className="text-3xl font-bold text-blue-deep dark:text-blue-light">
          {consumed.toLocaleString()}
          <Text className="text-base font-semibold text-text-muted dark:text-dark-text-muted"> ml</Text>
        </Text>
        <Text className="text-sm text-text-muted dark:text-dark-text-muted mt-1">
          {remaining > 0
            ? `${remaining.toLocaleString()} ml to go · goal ${goal.toLocaleString()}`
            : 'Goal reached! 🌊'
          }
        </Text>
      </View>
    </View>
  )
}
