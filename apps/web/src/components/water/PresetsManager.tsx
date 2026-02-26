'use client'

import { useState, useTransition } from 'react'
import { addPreset, deletePreset } from '@/app/actions'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface Preset {
  id: string
  label: string
  amount_ml: number
}

interface PresetsManagerProps {
  presets: Preset[]
}

export default function PresetsManager({ presets }: PresetsManagerProps) {
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleAdd(formData: FormData) {
    startTransition(async () => {
      await addPreset(formData)
      setAdding(false)
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deletePreset(id)
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        Quick add containers
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {presets.length === 0 && (
          <p className="text-sm text-text-muted">
            No containers yet. Add one below.
          </p>
        )}
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="flex justify-between items-center px-4 py-3 rounded-xl border-2 border-border dark:border-dark-border bg-surface dark:bg-dark-surface"
          >
            <div>
              <span className="font-semibold text-text-primary dark:text-dark-text-primary">
                {preset.label}
              </span>
              <span className="text-sm text-text-muted dark:text-dark-text-muted ml-2">
                {preset.amount_ml} ml
              </span>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(preset.id)}
              disabled={deletingId === preset.id}
              aria-label={`Delete ${preset.label}`}
              className="w-6 h-6 rounded-md border-2 border-border dark:border-dark-border bg-white dark:bg-dark-card text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Add form */}
      {adding ? (
        <form action={handleAdd} className="flex flex-col gap-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="label"
                type="text"
                required
                label="Name"
                placeholder="e.g. Contigo"
                disabled={isPending}
              />
            </div>
            <div className="w-28">
              <Input
                name="amount_ml"
                type="number"
                required
                min={1}
                max={5000}
                label="Amount"
                placeholder="591"
                disabled={isPending}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdding(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)}>
          + Add container
        </Button>
      )}
    </div>
  )
}
