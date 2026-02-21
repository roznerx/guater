'use client'

import { useState, useTransition } from 'react'
import type { DiureticLog, DiureticPreset } from '@guater/types'
import { logDiuretic, deleteDiureticLog, clearAllDiureticLogs } from '@/app/actions'
import { ConfirmDialog } from '@/components/ui'
import MinBottle from './MinBottle'

const DEFAULT_PRESETS: Omit<DiureticPreset, 'id' | 'user_id' | 'sort_order'>[] = [
  { label: 'Coffee',    amount_ml: 250, diuretic_factor: 0.40, color: '#4A6070' },
  { label: 'Espresso',  amount_ml: 60,  diuretic_factor: 0.50, color: '#0D4F78' },
  { label: 'Black tea', amount_ml: 250, diuretic_factor: 0.25, color: '#E8A230' },
  { label: 'Green tea', amount_ml: 250, diuretic_factor: 0.15, color: '#2AABA2' },
  { label: 'Mate',      amount_ml: 300, diuretic_factor: 0.35, color: '#1A7A74' },
  { label: 'Energy',    amount_ml: 250, diuretic_factor: 0.45, color: '#3E8FC0' },
  { label: 'Soda',      amount_ml: 350, diuretic_factor: 0.20, color: '#7FB8D8' },
  { label: 'Beer',      amount_ml: 330, diuretic_factor: 0.50, color: '#E8A230' },
  { label: 'Wine',      amount_ml: 150, diuretic_factor: 0.60, color: '#94A8BA' },
  { label: 'Sparkling', amount_ml: 250, diuretic_factor: 0.10, color: '#8DCFCA' },
]

interface DiureticTrackerProps {
  logs: DiureticLog[]
  presets: DiureticPreset[]
}

export default function DiureticTracker({ logs, presets }: DiureticTrackerProps) {
  const [isPending, startTransition] = useTransition()
  const [showConfirm, setShowConfirm] = useState(false)

  const activePresets = presets.length > 0
    ? [...DEFAULT_PRESETS, ...presets]
    : DEFAULT_PRESETS

  const totalNetLoss = logs.reduce((sum, log) => {
    return sum + Math.round(log.amount_ml * log.diuretic_factor)
  }, 0)

  async function handleLog(preset: typeof DEFAULT_PRESETS[0] & { id?: string }) {
    const formData = new FormData()
    formData.set('label', preset.label)
    formData.set('amount_ml', String(preset.amount_ml))
    formData.set('diuretic_factor', String(preset.diuretic_factor))
    if ('id' in preset && preset.id) formData.set('preset_id', preset.id)

    startTransition(async () => {
      await logDiuretic(formData)
    })
  }

  async function handleDelete(id: string) {
    startTransition(async () => {
      await deleteDiureticLog(id)
    })
  }

  return (
    <div>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Clear all diuretic logs?"
        message="This will delete all diuretic drink entries for today. This cannot be undone."
        onConfirm={async () => {
          await clearAllDiureticLogs()
          await new Promise(resolve => setTimeout(resolve, 1500))
          setShowConfirm(false)
        }}
        onCancel={() => setShowConfirm(false)}
      />

      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted">
          Diuretic drinks
        </div>
        <div className="flex items-center gap-3">
          {totalNetLoss > 0 && (
            <div className="text-xs font-semibold text-status-error">
              -{totalNetLoss} ml net loss
            </div>
          )}
          {logs.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="text-xs font-semibold text-text-muted dark:text-dark-text-muted hover:text-status-error transition-colors cursor-pointer"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Preset grid — 5 per row, fills full width */}
      <div className="grid grid-cols-5 gap-3 mb-4">
        {activePresets.map((preset, i) => (
          <button
            key={'id' in preset ? (preset as DiureticPreset).id : i}
            onClick={() => handleLog(preset)}
            disabled={isPending}
            className="flex flex-col items-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-translate-y-1"
          >
            <div className="h-12 flex items-end justify-center">
              <MinBottle
                label={preset.label}
                color={preset.color}
              />
            </div>
            <span className="text-xs font-semibold text-text-primary dark:text-dark-text-primary text-center leading-tight">
              {preset.label}
            </span>
            <span className="text-xs text-status-error font-medium">
              -{Math.round(preset.amount_ml * preset.diuretic_factor)} ml
            </span>
          </button>
        ))}
      </div>

      {logs.length === 0 && (
        <p className="text-xs text-text-muted dark:text-dark-text-muted text-center py-2">
          No diuretic drinks logged today
        </p>
      )}
    </div>
  )
}