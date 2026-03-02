import { useRef } from 'react'
import Svg, { Defs, ClipPath, Rect, Path, LinearGradient, Stop, G } from 'react-native-svg'
import { View, Text } from 'react-native'
import { getHydrationProgress } from '@guater/utils'
import { useThemeColors } from '@/lib/hooks/useThemeColors'

interface WaterBottleProps {
  consumed: number
  goal: number
}

let instanceCounter = 0

export default function WaterBottle({ consumed, goal }: WaterBottleProps) {
  const clipId = useRef(`bottle-clip-${++instanceCounter}`).current

  const c = useThemeColors()

  if (goal <= 0) return null

  const { percentage, remaining, overGoal } = getHydrationProgress(consumed, goal)

  const W = 72
  const H = 140
  const bottleTop    = 24
  const bottleBottom = H - 10
  const bottleHeight = bottleBottom - bottleTop
  const fillHeight   = (percentage / 100) * bottleHeight
  const fillY        = bottleBottom - fillHeight
  const isFull       = percentage >= 100

  const bottlePath = `
    M ${W * 0.35} 6
    L ${W * 0.35} ${bottleTop}
    Q ${W * 0.1} ${bottleTop + 20} ${W * 0.1} ${bottleTop + 40}
    L ${W * 0.1} ${bottleBottom - 10}
    Q ${W * 0.1} ${bottleBottom} ${W * 0.2} ${bottleBottom}
    L ${W * 0.8} ${bottleBottom}
    Q ${W * 0.9} ${bottleBottom} ${W * 0.9} ${bottleBottom - 10}
    L ${W * 0.9} ${bottleTop + 40}
    Q ${W * 0.9} ${bottleTop + 20} ${W * 0.65} ${bottleTop}
    L ${W * 0.65} 6
    Z
  `

  return (
    <View style={{ height: H, position: 'relative' }}>
      <View style={{ position: 'absolute', left: 0, top: 0, width: W, height: H }}>
        <Svg width={W} height={H}>
          <Defs>
            <ClipPath id={clipId}>
              <Path d={bottlePath} />
            </ClipPath>
            <LinearGradient id="water-grad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#1A6FA0" />
              <Stop offset="1" stopColor="#3E8FC0" />
            </LinearGradient>
          </Defs>
          <Path d={bottlePath} fill={c.cardAlt} stroke="#0D4F78" strokeWidth={2.5} />
          <G clipPath={`url(#${clipId})`}>
            <Rect x={0} y={fillY} width={W} height={fillHeight} fill="url(#water-grad)" />
          </G>
          <Path d={bottlePath} fill="none" stroke="#0D4F78" strokeWidth={2.5} />
        </Svg>
      </View>

      <View style={{ paddingLeft: W + 16, height: H, justifyContent: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: 'bold', color: c.selectedText }}>
          {percentage}%
        </Text>
        <Text style={{ fontSize: 14, fontWeight: '600', color: c.textSecondary, marginTop: 2 }}>
          {consumed.toLocaleString()} ml
        </Text>
        <Text style={{ fontSize: 13, color: c.textMuted, marginTop: 2 }}>
          {isFull ? 'Goal reached! 🌊' : `${remaining.toLocaleString()} ml to go`}
        </Text>
        {overGoal > 0 && (
          <Text style={{ fontSize: 12, color: '#2AABA2', marginTop: 2 }}>
            +{overGoal.toLocaleString()} ml over goal
          </Text>
        )}
        <View style={{
          height: 12,
          marginTop: 10,
          borderRadius: 999,
          borderWidth: 2,
          borderColor: '#0D4F78',
          overflow: 'hidden',
          backgroundColor: c.progressTrack,
        }}>
          <View style={{
            height: '100%',
            borderRadius: 999,
            backgroundColor: isFull ? '#2AABA2' : '#1A6FA0',
            width: `${percentage}%`,
          }} />
        </View>
      </View>
    </View>
  )
}
