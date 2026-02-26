'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions'
import { calculateRecommendedIntake } from '@/lib/hydration'
import { Button, Input, Toast } from '@/components/ui'

interface Profile {
  display_name?: string
  daily_goal_ml?: number
  preferred_unit?: string
  timezone?: string
  weight_kg?: number | null
  age?: number | null
  activity_level?: string | null
  climate?: string | null
}

interface SettingsClientProps {
  profile: Profile | null
}

const selectClass = `
  border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm
  text-text-primary dark:text-dark-text-primary
  outline-none bg-white dark:bg-dark-card
  shadow-[3px_3px_0_#0D4F78]
  focus:shadow-[1px_1px_0_#0D4F78]
  focus:translate-x-0.5 focus:translate-y-0.5
  transition-all cursor-pointer
  disabled:opacity-50 disabled:cursor-not-allowed
`

export default function SettingsClient({ profile }: SettingsClientProps) {
  const [showToast, setShowToast] = useState(false)
  const [pending, setPending] = useState(false)
  const [weightKg, setWeightKg] = useState(profile?.weight_kg?.toString() ?? '')
  const [age, setAge] = useState(profile?.age?.toString() ?? '')
  const [activityLevel, setActivityLevel] = useState(profile?.activity_level ?? 'moderate')
  const [climate, setClimate] = useState(profile?.climate ?? 'temperate')
  const [dailyGoal, setDailyGoal] = useState(profile?.daily_goal_ml?.toString() ?? '2500')

  const recommended = weightKg && age
    ? calculateRecommendedIntake(
        parseFloat(weightKg),
        parseInt(age),
        activityLevel as 'sedentary' | 'moderate' | 'active' | 'very_active',
        climate as 'cold' | 'temperate' | 'hot'
      )
    : null

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    setPending(true)
    const formData = new FormData(e.currentTarget)
    await updateProfile(formData)
    setPending(false)
    setShowToast(true)
  }

  return (
    <>
      {showToast && (
        <Toast
          message="Settings saved"
          type="success"
          onDismiss={() => setShowToast(false)}
        />
      )}

      <form onSubmit={handleUpdate} className="flex flex-col gap-4">
        <Input
          id="display_name"
          name="display_name"
          type="text"
          label="Name"
          defaultValue={profile?.display_name ?? ''}
          placeholder="Your name"
          disabled={pending}
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            id="weight_kg"
            name="weight_kg"
            type="number"
            label="Weight (kg)"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            placeholder="70"
            min={20}
            max={300}
            disabled={pending}
          />
          <Input
            id="age"
            name="age"
            type="number"
            label="Age"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            placeholder="30"
            min={10}
            max={120}
            disabled={pending}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="activity_level" className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
            Activity level
          </label>
          <select
            id="activity_level"
            name="activity_level"
            value={activityLevel}
            onChange={(e) => setActivityLevel(e.target.value)}
            disabled={pending}
            className={selectClass}
          >
            <option value="sedentary">Sedentary — mostly sitting</option>
            <option value="moderate">Moderate — light exercise</option>
            <option value="active">Active — daily exercise</option>
            <option value="very_active">Very active — intense training</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="climate" className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
            Climate
          </label>
          <select
            id="climate"
            name="climate"
            value={climate}
            onChange={(e) => setClimate(e.target.value)}
            disabled={pending}
            className={selectClass}
          >
            <option value="cold">Cold</option>
            <option value="temperate">Temperate</option>
            <option value="hot">Hot</option>
          </select>
        </div>

        {recommended && (
          <div className="border-2 border-blue-deep rounded-xl px-4 py-3 bg-blue-pale dark:bg-dark-card shadow-[3px_3px_0_#0D4F78]">
            <div className="text-xs font-semibold uppercase tracking-widest text-blue-core mb-1">
              Recommended intake
            </div>
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-blue-deep dark:text-blue-light">
                {recommended.toLocaleString('en-US')} ml / day
              </span>
              <button
                type="button"
                onClick={() => setDailyGoal(String(recommended))}
                disabled={pending}
                className="text-xs font-semibold text-blue-core hover:text-blue-deep transition-colors cursor-pointer disabled:opacity-50"
              >
                Use this →
              </button>
            </div>
          </div>
        )}

        <Input
          id="daily_goal_ml"
          name="daily_goal_ml"
          type="number"
          label="Daily goal (ml)"
          value={dailyGoal}
          onChange={(e) => setDailyGoal(e.target.value)}
          placeholder="2500"
          min={100}
          max={10000}
          disabled={pending}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferred_unit" className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
            Unit
          </label>
          <select
            id="preferred_unit"
            name="preferred_unit"
            defaultValue={profile?.preferred_unit ?? 'ml'}
            disabled={pending}
            className={selectClass}
          >
            <option value="ml">ml</option>
            <option value="oz">oz</option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="timezone" className="text-sm font-semibold text-text-secondary dark:text-dark-text-secondary">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={profile?.timezone ?? 'UTC'}
            disabled={pending}
            className={selectClass}
          >
            <option value="UTC">UTC</option>
            <option value="America/Argentina/Buenos_Aires">Buenos Aires (ART)</option>
            <option value="America/New_York">New York (EST)</option>
            <option value="America/Chicago">Chicago (CST)</option>
            <option value="America/Denver">Denver (MST)</option>
            <option value="America/Los_Angeles">Los Angeles (PST)</option>
            <option value="Europe/London">London (GMT)</option>
            <option value="Europe/Paris">Paris (CET)</option>
          </select>
        </div>

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={pending}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {pending ? 'Saving…' : 'Save changes'}
        </Button>
      </form>
    </>
  )
}
