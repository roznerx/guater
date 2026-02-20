'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui'
import { logWater } from '@/app/actions'

const PRESETS = [250, 500, 750]

export default function QuickAdd() {
  const [showCustom, setShowCustom] = useState(false)
  const [customAmount, setCustomAmount] = useState('')
  const [isPending, startTransition] = useTransition()

  async function handleLogWater(formData: FormData) {
    startTransition(async () => {
      await logWater(formData)
      setCustomAmount('')
      setShowCustom(false)
    })
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        Quick add
      </div>
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((amount) => (
          <form key={amount} action={handleLogWater}>
            <input type="hidden" name="amount" value={amount} />
            <Button
              type="submit"
              variant="secondary"
              disabled={isPending}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + {amount} ml
            </Button>
          </form>
        ))}
        <Button
          variant="teal"
          onClick={() => setShowCustom(!showCustom)}
          disabled={isPending}
          className="disabled:opacity-50 disabled:cursor-not-allowed"
        >
          + Custom
        </Button>
      </div>

      {showCustom && (
        <form action={handleLogWater} className="mt-4 flex gap-2 items-end">
          <div className="flex flex-col gap-1.5 flex-1">
            <label htmlFor="custom-amount" className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Amount (ml)
            </label>
            <input
              id="custom-amount"
              name="amount"
              type="number"
              min="1"
              max="5000"
              required
              value={customAmount}
              onChange={(e) => setCustomAmount(e.target.value)}
              placeholder="e.g. 350"
              disabled={isPending}
              className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all disabled:opacity-50"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={isPending}
            className="mb-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Add
          </Button>
        </form>
      )}
    </div>
  )
}