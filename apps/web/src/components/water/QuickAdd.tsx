'use client'

import { Button } from '@/components/ui'
import { logWater } from '@/app/actions'

const PRESETS = [250, 500, 750]

export default function QuickAdd() {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        Quick add
      </div>
      <div className="flex gap-2 flex-wrap">
        {PRESETS.map((amount) => (
          <form key={amount} action={logWater}>
            <input type="hidden" name="amount" value={amount} />
            <Button type="submit" variant="secondary">
              + {amount} ml
            </Button>
          </form>
        ))}
        <Button variant="teal">
          + Custom
        </Button>
      </div>
    </div>
  )
}