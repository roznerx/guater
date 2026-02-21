'use client'

import { useState } from 'react'
import { addPreset, deletePreset } from '@/app/actions'
import { Button } from '@/components/ui'

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
  const [pending, setPending] = useState(false)

  async function handleAdd(formData: FormData) {
    setPending(true)
    await addPreset(formData)
    setPending(false)
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await deletePreset(id)
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        Quick add containers
      </div>

      {/* Existing presets */}
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
              onClick={() => handleDelete(preset.id)}
              className="w-6 h-6 rounded-md border-2 border-border dark:border-dark-border bg-white dark:bg-dark-card text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer"
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
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                Name
              </label>
              <input
                name="label"
                type="text"
                required
                placeholder="e.g. Contigo"
                className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-28">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                Amount
              </label>
              <input
                name="amount_ml"
                type="number"
                required
                min={1}
                max={5000}
                placeholder="591"
                className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary placeholder:text-text-muted outline-none bg-white shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              variant="primary"
              disabled={pending}
              className="disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {pending ? 'Saving…' : 'Save'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setAdding(false)}
              disabled={pending}
            >
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button
          variant="secondary"
          onClick={() => setAdding(true)}
        >
          + Add container
        </Button>
      )}
    </div>
  )
}