'use client'

import { useState } from 'react'
import { updateProfile } from '@/app/actions'
import { Button, Input, Toast } from '@/components/ui'

interface Profile {
  display_name?: string
  daily_goal_ml?: number
  preferred_unit?: string
  timezone?: string
}

interface SettingsClientProps {
  profile: Profile | null
}

export default function SettingsClient({ profile }: SettingsClientProps) {
  const [showToast, setShowToast] = useState(false)
  const [pending, setPending] = useState(false)

  async function handleUpdate(formData: FormData) {
    setPending(true)
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

      <form
        onSubmit={async (e) => {
            e.preventDefault()
            if (pending) return
            const formData = new FormData(e.currentTarget)
            await handleUpdate(formData)
        }}
        className="flex flex-col gap-4"
        >
        <Input
          id="display_name"
          name="display_name"
          type="text"
          label="Name"
          defaultValue={profile?.display_name ?? ''}
          placeholder="Your name"
          disabled={pending}
        />
        <Input
          id="daily_goal_ml"
          name="daily_goal_ml"
          type="number"
          label="Daily goal (ml)"
          defaultValue={profile?.daily_goal_ml ?? 2500}
          placeholder="2500"
          min={100}
          max={10000}
          disabled={pending}
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="preferred_unit" className="text-sm font-semibold text-text-secondary">
            Unit
          </label>
          <select
            id="preferred_unit"
            name="preferred_unit"
            defaultValue={profile?.preferred_unit ?? 'ml'}
            disabled={pending}
            className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="ml">ml</option>
            <option value="oz">oz</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="timezone" className="text-sm font-semibold text-text-secondary">
            Timezone
          </label>
          <select
            id="timezone"
            name="timezone"
            defaultValue={profile?.timezone ?? 'UTC'}
            disabled={pending}
            className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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