'use client'

import { useState, useTransition } from 'react'
import type { DiureticLog, DiureticPreset } from '@guater/types'
import { logDiuretic, deleteDiureticLog, clearAllDiureticLogs } from '@/app/actions'
import { Button, ConfirmDialog } from '@/components/ui'
import MinBottle from './MinBottle'

const DEFAULT_PRESETS: Omit<DiureticPreset, 'id' | 'user_id' | 'sort_order'>[] = [
  { label: 'Coffee',       amount_ml: 250, diuretic_factor: 0.40, color: '#4A6070' },
  { label: 'Espresso',     amount_ml: 60,  diuretic_factor: 0.50, color: '#0D4F78' },
  { label: 'Black tea',    amount_ml: 250, diuretic_factor: 0.25, color: '#E8A230' },
  { label: 'Green tea',    amount_ml: 250, diuretic_factor: 0.15, color: '#2AABA2' },
  { label: 'Mate',         amount_ml: 300, diuretic_factor: 0.35, color: '#1A7A74' },
  { label: 'Energy drink', amount_ml: 250, diuretic_factor: 0.45, color: '#3E8FC0' },
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

      <div className="flex justify-between items-center mb-3">
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
            <Button
              type="button"
              onClick={() => setShowConfirm(true)}
              className="text-xs font-semibold text-text-muted dark:text-dark-text-muted hover:text-status-error transition-colors cursor-pointer"
            >
              Clear all
            </Button>
          )}
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex gap-4 flex-wrap mb-4">
        {activePresets.map((preset, i) => (
          <button
            key={'id' in preset ? (preset as DiureticPreset).id : i}
            onClick={() => handleLog(preset)}
            disabled={isPending}
            className="flex flex-col items-center gap-1 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-transform hover:-translate-y-1"
          >
            <MinBottle
              label={preset.label}
              amount_ml={preset.amount_ml}
              diuretic_factor={preset.diuretic_factor}
              color={preset.color}
            />
          </button>
        ))}
      </div>

      {/* Today's logs */}
      {logs.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted mb-1">
            Logged today
          </div>
          {logs.map((log) => (
            <div
              key={log.id}
              className="flex justify-between items-center px-4 py-2.5 rounded-xl border-2 border-border dark:border-dark-border bg-surface dark:bg-dark-surface"
            >
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-text-primary dark:text-dark-text-primary">
                  {log.label}
                </span>
                <span className="text-xs text-text-muted dark:text-dark-text-muted">
                  {log.amount_ml} ml
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-status-error">
                  -{Math.round(log.amount_ml * log.diuretic_factor)} ml
                </span>
                <button
                  onClick={() => handleDelete(log.id)}
                  disabled={isPending}
                  className="w-6 h-6 rounded-md border-2 border-border dark:border-dark-border bg-white dark:bg-dark-card text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {logs.length === 0 && (
        <p className="text-xs text-text-muted dark:text-dark-text-muted text-center py-2">
          No diuretic drinks logged today
        </p>
      )}
    </div>
  )
}