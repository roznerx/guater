'use client'

import { useState, useTransition } from 'react'
import { logWater } from '@/app/actions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const SINGLE_ENTRY_WARNING_THRESHOLD = 1000

interface Preset {
  id: string
  label: string
  amount_ml: number
}

interface QuickAddProps {
  presets: Preset[]
}

const DEFAULT_PRESETS: Preset[] = [
  { id: 'default-1', label: '250 ml', amount_ml: 250 },
  { id: 'default-2', label: '500 ml', amount_ml: 500 },
]

export default function QuickAdd({ presets }: QuickAddProps) {
  const [showCustom, setShowCustom] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [isPending, startTransition] = useTransition()
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null)
  const [warningAmount, setWarningAmount] = useState<number | null>(null)

  const activePresets = [...presets, ...DEFAULT_PRESETS]

  function submitLog(formData: FormData) {
    startTransition(async () => {
      await logWater(formData)
      setCustomAmount('')
      setShowCustom(false)
    })
  }

  function handleLogWater(formData: FormData) {
    const amount = parseInt(formData.get('amount') as string)

    if (amount >= SINGLE_ENTRY_WARNING_THRESHOLD) {
      setPendingFormData(formData)
      setWarningAmount(amount)
      return
    }

    submitLog(formData)
  }

  function handleConfirmWarning() {
    if (!pendingFormData) return
    const formData = pendingFormData
    setPendingFormData(null)
    setWarningAmount(null)
    submitLog(formData)
  }

  function handleCancelWarning() {
    setPendingFormData(null)
    setWarningAmount(null)
  }

  return (
    <div>
      <ConfirmDialog
        isOpen={warningAmount !== null}
        title="Large amount detected"
        message={`Logging ${warningAmount?.toLocaleString('en-US')}ml at once may be unsafe. Drinking more than 1,000ml in a short period can cause hyponatremia. Are you sure?`}
        onConfirm={handleConfirmWarning}
        onCancel={handleCancelWarning}
        confirmLabel="Yes, log it"
        confirmVariant="primary"
      />

      <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-3">
        Quick add
      </div>

      <div className="flex gap-2 flex-wrap">
        {activePresets.map((preset) => (
          <form key={preset.id} action={handleLogWater}>
            <input type="hidden" name="amount" value={preset.amount_ml} />
            <Button type="submit" variant="secondary" disabled={isPending}>
              {preset.label}
            </Button>
          </form>
        ))}
        <Button
          variant="teal"
          onClick={() => setShowCustom(!showCustom)}
          disabled={isPending}
        >
          + Custom
        </Button>
      </div>

      {showCustom && (
        <form action={handleLogWater} className="mt-4 flex gap-2 items-end">
          <div className="flex-1">
            <Input
              id="custom-amount"
              name="amount"
              type="number"
              min="1"
              max="5000"
              required
              label="Amount (ml)"
              placeholder="e.g. 350"
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              disabled={isPending}
            />
          </div>
          <Button type="submit" variant="primary" disabled={isPending} className="mb-0.5">
            Add
          </Button>
        </form>
      )}
    </div>
  )
}
