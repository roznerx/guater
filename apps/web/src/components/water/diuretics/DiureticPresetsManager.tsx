'use client'

import { useState } from 'react'
import { addDiureticPreset, deleteDiureticPreset } from '@/app/actions'
import { Button } from '@/components/ui'
import type { DiureticPreset } from '@guater/types'

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
  { label: 'Coffee',       factor: 0.40, color: '#4A6070' },
  { label: 'Espresso',     factor: 0.50, color: '#0D4F78' },
  { label: 'Black tea',    factor: 0.25, color: '#E8A230' },
  { label: 'Green tea',    factor: 0.15, color: '#2AABA2' },
  { label: 'Mate',         factor: 0.35, color: '#1A7A74' },
  { label: 'Energy drink', factor: 0.45, color: '#3E8FC0' },
  { label: 'Soda',         factor: 0.20, color: '#7FB8D8' },
  { label: 'Beer',         factor: 0.50, color: '#E8A230' },
  { label: 'Wine',         factor: 0.60, color: '#94A8BA' },
  { label: 'Sparkling',    factor: 0.10, color: '#8DCFCA' },
  { label: 'Custom',       factor: 0.30, color: '#94A8BA' },
]

interface DiureticPresetsManagerProps {
  presets: DiureticPreset[]
}

export default function DiureticPresetsManager({ presets }: DiureticPresetsManagerProps) {
  const [adding, setAdding] = useState(false)
  const [pending, setPending] = useState(false)
  const [selectedType, setSelectedType] = useState(DRINK_TYPES[0])
  const [customColor, setCustomColor] = useState(DRINK_TYPES[0].color)

  function handleTypeChange(label: string) {
    const found = DRINK_TYPES.find(d => d.label === label)
    if (found) {
      setSelectedType(found)
      setCustomColor(found.color)
    }
  }

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    setPending(true)
    const formData = new FormData(e.currentTarget)
    // Use custom color if set
    formData.set('color', customColor)
    await addDiureticPreset(formData)
    setPending(false)
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await deleteDiureticPreset(id)
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
              onClick={() => handleDelete(preset.id)}
              className="w-6 h-6 rounded-md border-2 border-border dark:border-dark-border bg-white dark:bg-dark-card text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <form onSubmit={handleAdd} className="flex flex-col gap-3">

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Drink type
            </label>
            <select
              onChange={(e) => handleTypeChange(e.target.value)}
              className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary dark:text-dark-text-primary outline-none bg-white dark:bg-dark-card shadow-[3px_3px_0_#0D4F78] transition-all cursor-pointer"
            >
              {DRINK_TYPES.map((d) => (
                <option key={d.label} value={d.label}>{d.label}</option>
              ))}
            </select>
          </div>

          <div className="flex gap-2">
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                Name
              </label>
              <input
                name="label"
                type="text"
                required
                defaultValue={selectedType.label === 'Custom' ? '' : selectedType.label}
                placeholder="e.g. My morning coffee"
                className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary dark:text-dark-text-primary placeholder:text-text-muted outline-none bg-white dark:bg-dark-card shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
              />
            </div>
            <div className="flex flex-col gap-1.5 w-24">
              <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
                Amount
              </label>
              <input
                name="amount_ml"
                type="number"
                required
                min={1}
                max={2000}
                defaultValue={selectedType.label === 'Custom' ? '' : String(
                  selectedType.label === 'Espresso' ? 60 :
                  selectedType.label === 'Mate' ? 300 : 250
                )}
                placeholder="250"
                className="border-2 border-blue-deep rounded-xl px-3 py-2.5 text-sm text-text-primary dark:text-dark-text-primary placeholder:text-text-muted outline-none bg-white dark:bg-dark-card shadow-[3px_3px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase tracking-widest">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {PALETTE.map((swatch) => (
                <button
                  key={swatch.value}
                  type="button"
                  title={swatch.label}
                  onClick={() => setCustomColor(swatch.value)}
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
            <Button type="submit" variant="primary" disabled={pending} className="disabled:opacity-50">
              {pending ? 'Saving…' : 'Save'}
            </Button>
            <Button type="button" variant="ghost" onClick={() => setAdding(false)} disabled={pending}>
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