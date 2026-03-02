'use client'

import { useState, useTransition } from 'react'
import type { WaterLog, DiureticLog } from '@guater/types'
import { deleteLog, clearAllLogs, editLog, clearAllDiureticLogs, deleteDiureticLog } from '@/app/actions'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'

interface LogListProps {
  logs: WaterLog[]
  diureticLogs: DiureticLog[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

type UnifiedEntry =
  | { type: 'water'; log: WaterLog }
  | { type: 'diuretic'; log: DiureticLog }

const inlineInputClass = `
  w-20 border-2 border-blue-deep rounded-lg px-2 py-1
  text-sm font-semibold text-text-primary dark:text-dark-text-primary outline-none
  bg-white dark:bg-dark-card
  shadow-[2px_2px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78]
  focus:translate-x-0.5 focus:translate-y-0.5 transition-all
  disabled:opacity-50
`

function WaterItem({ log }: { log: WaterLog }) {
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(log.amount_ml))
  const [isDeleting, startDeleteTransition] = useTransition()
  const [isSaving, startSaveTransition] = useTransition()

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteLog(log.id)
    })
  }

  function handleSave() {
    const amount = parseInt(editValue)
    if (!amount || amount <= 0 || amount === log.amount_ml) {
      setEditing(false)
      setEditValue(String(log.amount_ml))
      return
    }
    startSaveTransition(async () => {
      try {
        await editLog(log.id, amount)
        setEditing(false)
      } catch {
        setEditValue(String(log.amount_ml))
      }
    })
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditing(false)
      setEditValue(String(log.amount_ml))
    }
  }

  function handleCancelEdit() {
    setEditing(false)
    setEditValue(String(log.amount_ml))
  }

  return (
    <div className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 border-border dark:border-dark-border bg-surface dark:bg-dark-surface transition-opacity ${isDeleting ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="w-7 h-7 rounded-full bg-blue-pale dark:bg-dark-card border-2 border-blue-deep flex items-center justify-center text-xs flex-shrink-0">
          💧
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max="5000"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              disabled={isSaving}
              className={inlineInputClass}
            />
            <span className="text-sm text-text-muted font-medium">ml</span>
            <Button
              variant="ghost"
              onClick={handleSave}
              disabled={isSaving}
              className="text-xs text-teal-core hover:text-teal-deep px-1 py-0.5"
            >
              {isSaving ? '…' : 'Save'}
            </Button>
            <Button
              variant="ghost"
              onClick={handleCancelEdit}
              disabled={isSaving}
              className="text-xs px-1 py-0.5"
            >
              Cancel
            </Button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="font-semibold text-text-primary dark:text-dark-text-primary hover:text-blue-core transition-colors cursor-pointer"
          >
            {log.amount_ml} ml
          </button>
        )}
      </div>
      {!editing && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-muted dark:text-dark-text-muted">
            {formatTime(log.logged_at)}
          </span>
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            aria-label={`Delete ${log.amount_ml}ml entry`}
            className="w-6 h-6 rounded-md border-2 border-border dark:border-dark-border bg-white dark:bg-dark-card text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}

function DiureticItem({ log }: { log: DiureticLog }) {
  const [isDeleting, startDeleteTransition] = useTransition()

  function handleDelete() {
    startDeleteTransition(async () => {
      await deleteDiureticLog(log.id)
    })
  }

  return (
    <div className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 border-border dark:border-dark-border bg-surface dark:bg-dark-surface transition-opacity ${isDeleting ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="w-7 h-7 rounded-full bg-slate-soft dark:bg-dark-card border-2 border-slate-mid flex items-center justify-center text-xs flex-shrink-0">
          ☕
        </div>
        <span className="font-semibold text-text-primary dark:text-dark-text-primary">
          {log.label}
        </span>
        <span className="text-sm text-text-muted dark:text-dark-text-muted">
          {log.amount_ml} ml
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold text-status-error">
          -{Math.round(log.amount_ml * log.diuretic_factor)} ml
        </span>
        <span className="text-xs font-medium text-text-muted dark:text-dark-text-muted">
          {formatTime(log.logged_at)}
        </span>
        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          aria-label={`Delete ${log.amount_ml}ml entry`}
          className="w-6 h-6 rounded-md border-2 border-border dark:border-dark-border bg-white dark:bg-dark-card text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
        >
          ✕
        </button>
      </div>
    </div>
  )
}

export default function LogList({ logs, diureticLogs }: LogListProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const unified: UnifiedEntry[] = [
    ...logs.map(log => ({ type: 'water' as const, log })),
    ...diureticLogs.map(log => ({ type: 'diuretic' as const, log })),
  ].sort((a, b) =>
    new Date(b.log.logged_at).getTime() - new Date(a.log.logged_at).getTime()
  )

  const isEmpty = unified.length === 0
  const hasAnyLogs = logs.length > 0 || diureticLogs.length > 0

  return (
    <div>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Clear all logs?"
        message="This will delete all water and diuretic entries for today. This cannot be undone."
        onConfirm={async () => {
          await Promise.all([clearAllLogs(), clearAllDiureticLogs()])
          setShowConfirm(false)
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted dark:text-dark-text-muted">
          Today&apos;s log
        </div>
        {hasAnyLogs && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="text-xs font-semibold text-text-muted dark:text-dark-text-muted hover:text-status-error transition-colors cursor-pointer"
          >
            Clear all
          </button>
        )}
      </div>

      {isEmpty ? (
        <div className="text-sm text-text-muted dark:text-dark-text-muted text-center py-6">
          No logs yet today. Start drinking! 💧
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {unified.map((entry) =>
            entry.type === 'water'
              ? <WaterItem key={`water-${entry.log.id}`} log={entry.log} />
              : <DiureticItem key={`diuretic-${entry.log.id}`} log={entry.log} />
          )}
        </div>
      )}
    </div>
  )
}
