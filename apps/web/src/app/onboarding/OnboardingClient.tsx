'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile, type ActionResult } from '@/app/actions'
import { calculateRecommendedIntake } from '@/lib/hydration'
import { ACTIVITY_LEVELS, CLIMATES, type ActivityLevel, type Climate } from '@guater/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

type Step = 'welcome' | 'goal'

const selectClass = `
  w-full border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm
  text-text-primary dark:text-dark-text-primary
  outline-none bg-white dark:bg-dark-card
  shadow-[3px_3px_0_#0D4F78]
  focus:shadow-[1px_1px_0_#0D4F78]
  focus:translate-x-0.5 focus:translate-y-0.5
  transition-all cursor-pointer
`

function ProgressDots({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-1.5 justify-center mb-8">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all ${
            i === current ? 'w-5 bg-blue-deep' : 'w-2 bg-border dark:bg-dark-border'
          }`}
        />
      ))}
    </div>
  )
}

export default function OnboardingClient() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [step, setStep] = useState<Step>('welcome')
  const [stepError, setStepError] = useState<string | null>(null)

  const [displayName, setDisplayName] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [age, setAge] = useState('')
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate')
  const [climate, setClimate] = useState<Climate>('temperate')
  const [dailyGoal, setDailyGoal] = useState('')

  const weight = parseFloat(weightKg)
  const ageNum = parseInt(age, 10)

  const recommended = useMemo(() => {
    if (weight > 0 && ageNum > 0) {
      return calculateRecommendedIntake(weight, ageNum, activityLevel, climate)
    }
    return null
  }, [weight, ageNum, activityLevel, climate])

  function handleNextStep() {
    setStepError(null)
    setStep('goal')
  }

  function handleFinish(skip = false) {
    if (!skip) {
      const parsed = parseInt(dailyGoal, 10)
      const goalValue = !Number.isNaN(parsed) && parsed > 0 ? parsed : (recommended ?? 0)

      if (goalValue <= 0) {
        setStepError('Please enter a daily goal or fill in your stats to get a recommendation.')
        return
      }

      if (goalValue < 500) {
        setStepError('A daily goal below 500 ml is unsafe. Please enter a higher value.')
        return
      }
      
      if (goalValue > 6000) {
        setStepError('A daily goal above 6,000 ml may be harmful. Please enter a lower value.')
        return
      }
    }

    setStepError(null)
    startTransition(async () => {
      const parsed = parseInt(dailyGoal, 10)
      const resolvedGoal = !Number.isNaN(parsed) && parsed > 0
        ? parsed
        : (recommended ?? 2500)

      const formData = new FormData()
      if (displayName.trim()) formData.set('display_name', displayName.trim())
      formData.set('daily_goal_ml', skip ? '2500' : String(resolvedGoal))
      if (weight > 0) formData.set('weight_kg', String(weight))
      if (ageNum > 0) formData.set('age', String(ageNum))
      formData.set('activity_level', activityLevel)
      formData.set('climate', climate)
      formData.set('onboarding_completed', 'true')

      const result: ActionResult = await updateProfile(formData)
      if (!result.success) {
        setStepError(result.error)
        return
      }
      router.push('/')
    })
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface flex items-center justify-center px-6">
      <div className="w-full max-w-md">

        {/* Step 1 — Welcome */}
        {step === 'welcome' && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <div className="text-5xl mb-4">💧</div>
              <h1 className="text-2xl font-extrabold text-blue-deep dark:text-blue-light mb-2">
                Welcome to Güater
              </h1>
              <p className="text-sm text-text-muted dark:text-dark-text-muted leading-relaxed">
                Track your hydration and build healthy habits — let&apos;s set you up in 2 quick steps.
              </p>
            </div>

            <ProgressDots current={0} total={2} />

            <Input
              id="display_name"
              label="What should we call you? (optional)"
              type="text"
              placeholder="Your name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />

            <Button variant="primary" fullWidth onClick={handleNextStep}>
              Let&apos;s go →
            </Button>
          </div>
        )}

        {/* Step 2 — Goal */}
        {step === 'goal' && (
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-blue-deep dark:text-blue-light mb-1">
                Set your daily goal
              </h2>
              <p className="text-sm text-text-muted dark:text-dark-text-muted">
                We&apos;ll calculate a recommendation based on your body and lifestyle.
              </p>
            </div>

            <ProgressDots current={1} total={2} />

            <div className="grid grid-cols-2 gap-3">
              <Input
                id="weight_kg"
                label="Weight (kg)"
                type="number"
                placeholder="70"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                min={20} max={300}
              />
              <Input
                id="age"
                label="Age"
                type="number"
                placeholder="30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={10} max={120}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="activity_level"
                className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary"
              >
                Activity level
              </label>
              <select
                id="activity_level"
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
                className={selectClass}
              >
                {ACTIVITY_LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label} — {l.description}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="climate"
                className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary"
              >
                Climate
              </label>
              <select
                id="climate"
                value={climate}
                onChange={(e) => setClimate(e.target.value as Climate)}
                className={selectClass}
              >
                {CLIMATES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {recommended !== null && (
              <div className="border-2 border-blue-deep rounded-xl px-4 py-3 bg-blue-pale dark:bg-dark-card shadow-[3px_3px_0_#0D4F78]">
                <div className="text-xs font-semibold uppercase tracking-widest text-blue-core mb-1">
                  Recommended
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-blue-deep dark:text-blue-light">
                    {recommended.toLocaleString('en-US')} ml / day
                  </span>
                  <button
                    type="button"
                    onClick={() => setDailyGoal(String(recommended))}
                    className="text-xs font-semibold text-blue-core hover:text-blue-deep transition-colors cursor-pointer"
                  >
                    Use this →
                  </button>
                </div>
              </div>
            )}

            <Input
              id="daily_goal_ml"
              label="Daily goal (ml)"
              type="number"
              placeholder={recommended !== null ? String(recommended) : '2500'}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(e.target.value)}
              min={100} max={10000}
            />

            {/* Error message */}
            {stepError && (
              <p className="text-xs text-status-error font-semibold">{stepError}</p>
            )}

            <Button
              variant="primary"
              fullWidth
              disabled={isPending}
              onClick={() => handleFinish()}
            >
              {isPending ? 'Setting up…' : 'Start tracking →'}
            </Button>

            <button
              type="button"
              onClick={() => handleFinish(true)}
              disabled={isPending}
              className="text-sm text-center text-text-muted dark:text-dark-text-muted hover:text-text-secondary transition-colors disabled:opacity-50 cursor-pointer"
            >
              Skip for now — use 2,500 ml default
            </button>
          </div>
        )}

      </div>
    </div>
  )
}
