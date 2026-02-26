'use client'

import { useState, useTransition, useId } from 'react'
import { addDiureticPreset, deleteDiureticPreset } from '@/app/actions'
import type { DiureticPreset } from '@guater/types'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const PALETTE = [
  { label: 'Blue Pale',  value: '#C8DCEE' },
  { label: 'Blue Light', value: '#7FB8D8' },
  { label: 'Blue Mid',   value: '#3E8FC0' },
  { label: 'Blue Core',  value: '#1A6FA0' },
  { label: 'Blue Deep',  value: '#0D4F78' },
  { label: 'Teal Light', value: '#8DCFCA' },
  { label: 'Teal Core',  value: '#2AABA2' },
  { label: 'Teal Deep',  value: '#1A7A74' },
  { label: 'Slate Mid',  value: '#94A8BA' },
  { label: 'Slate Deep', value: '#4A6070' },
  { label: 'Warning',    value: '#E8A230' },
  { label: 'Error',      value: '#D95F5F' },
]

const DRINK_TYPES = [
  { label: 'Coffee',       amount_ml: 250, factor: 0.40, color: '#4A6070' },
  { label: 'Espresso',     amount_ml: 60,  factor: 0.50, color: '#0D4F78' },
  { label: 'Black tea',    amount_ml: 250, factor: 0.25, color: '#E8A230' },
  { label: 'Green tea',    amount_ml: 250, factor: 0.15, color: '#2AABA2' },
  { label: 'Mate',         amount_ml: 300, factor: 0.35, color: '#1A7A74' },
  { label: 'Energy drink', amount_ml: 250, factor: 0.45, color: '#3E8FC0' },
  { label: 'Soda',         amount_ml: 350, factor: 0.20, color: '#7FB8D8' },
  { label: 'Beer',         amount_ml: 330, factor: 0.50, color: '#E8A230' },
  { label: 'Wine',         amount_ml: 150, factor: 0.60, color: '#94A8BA' },
  { label: 'Sparkling',    amount_ml: 250, factor: 0.10, color: '#8DCFCA' },
  { label: 'Custom',       amount_ml: 250, factor: 0.30, color: '#94A8BA' },
]

interface DiureticPresetsManagerProps {
  presets: DiureticPreset[]
}

export default function DiureticPresetsManager({ presets }: DiureticPresetsManagerProps) {
  const selectId = useId()
  const [adding, setAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const [selectedType, setSelectedType] = useState(DRINK_TYPES[0])
  const [customColor, setCustomColor] = useState(DRINK_TYPES[0].color)

  const [nameValue, setNameValue] = useState(DRINK_TYPES[0].label)
  const [amountValue, setAmountValue] = useState(String(DRINK_TYPES[0].amount_ml))

  function handleTypeChange(label: string) {
    const found = DRINK_TYPES.find(d => d.label === label)
    if (!found) return
    setSelectedType(found)
    setCustomColor(found.color)
    setNameValue(found.label === 'Custom' ? '' : found.label)
    setAmountValue(found.label === 'Custom' ? '' : String(found.amount_ml))
  }

  function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      await addDiureticPreset(formData)
      setAdding(false)
      setSelectedType(DRINK_TYPES[0])
      setCustomColor(DRINK_TYPES[0].color)
      setNameValue(DRINK_TYPES[0].label)
      setAmountValue(String(DRINK_TYPES[0].amount_ml))
    })
  }

  function handleDelete(id: string) {
    setDeletingId(id)
    startTransition(async () => {
      try {
        await deleteDiureticPreset(id)
      } finally {
        setDeletingId(null)
      }
    })
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-3">
        Diuretic drink presets
      </div>

      <div className="flex flex-col gap-2 mb-4">
        {presets.length === 0 && (
          <p className="text-sm text-text-muted dark:text-dark-text-muted">
            No custom presets. Default drinks are used.
          </p>
        )}
        {presets.map((preset) => (
          <div
            key={preset.id}
            className="flex justify-between items-center px-4 py-3 rounded-xl border-2 border-border dark:border-dark-border bg-surface dark:bg-dark-surface"
          >
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="w-3 h-3 rounded-full border border-border flex-shrink-0"
                style={{ backgroundColor: preset.color }}
              />
              <span className="font-semibold text-sm text-text-primary dark:text-dark-text-primary">
                {preset.label}
              </span>
              <span className="text-xs text-text-muted dark:text-dark-text-muted">
                {preset.amount_ml} ml · {Math.round(preset.diuretic_factor * 100)}% diuretic
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

      {adding ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-3">

          <div className="flex flex-col gap-1.5">
            <label htmlFor={selectId} className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Drink type
            </label>
            <select
              id={selectId}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary dark:text-dark-text-primary outline-none bg-white dark:bg-dark-card shadow-[3px_3px_0_#0D4F78] transition-all cursor-pointer"
            >
              {DRINK_TYPES.map((d) => (
                <option key={d.label} value={d.label}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                name="label"
                type="text"
                required
                label="Name"
                placeholder="e.g. My morning coffee"
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                disabled={isPending}
              />
            </div>
            <div className="w-24">
              <Input
                name="amount_ml"
                type="number"
                required
                min={1}
                max={2000}
                label="Amount"
                placeholder="250"
                value={amountValue}
                onChange={(e) => setAmountValue(e.target.value)}
                disabled={isPending}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Color
            </span>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  title={swatch.label}
                  onClick={() => setCustomColor(swatch.value)}
                  aria-label={swatch.label}
                  aria-pressed={customColor === swatch.value}
                  className={`
                    w-8 h-8 rounded-lg border-2 transition-all cursor-pointer
                    ${customColor === swatch.value
                      ? 'border-blue-deep scale-110 shadow-[2px_2px_0_#0D4F78]'
                      : 'border-border hover:border-blue-deep hover:scale-105'
                    }
                  `}
                  style={{ backgroundColor: swatch.value }}
                />
              ))}
            </div>
            <span className="text-xs font-mono text-text-muted dark:text-dark-text-muted">
              {customColor}
            </span>
          </div>

          <input type="hidden" name="diuretic_factor" value={selectedType.factor} />
          <input type="hidden" name="color" value={customColor} />

          <div className="flex gap-2">
            <Button type="submit" variant="primary" disabled={isPending}>
              {isPending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)} disabled={isPending}>
              Cancel
            </Button>
          </div>
        </form>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)}>
          + Add drink
        </Button>
      )}
    </div>
  )
}
