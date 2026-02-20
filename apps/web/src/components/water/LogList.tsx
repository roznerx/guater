'use client'

import { useState } from 'react'
import type { WaterLog } from '@guater/types'
import { deleteLog, clearAllLogs, editLog } from '@/app/actions'
import { ConfirmDialog } from '@/components/ui'

interface LogListProps {
  logs: WaterLog[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function LogItem({ log }: { log: WaterLog }) {
  const [deleting, setDeleting] = useState(false)
  const [editing, setEditing] = useState(false)
  const [editValue, setEditValue] = useState(String(log.amount_ml))
  const [saving, setSaving] = useState(false)

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    await deleteLog(log.id)
  }

  async function handleSave() {
    const amount = parseInt(editValue)
    if (!amount || amount <= 0 || amount === log.amount_ml) {
      setEditing(false)
      setEditValue(String(log.amount_ml))
      return
    }
    setSaving(true)
    await editLog(log.id, amount)
    setSaving(false)
    setEditing(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') handleSave()
    if (e.key === 'Escape') {
      setEditing(false)
      setEditValue(String(log.amount_ml))
    }
  }

  return (
    <div className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 border-border bg-surface transition-opacity ${deleting ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-blue-pale border-2 border-blue-deep flex items-center justify-center text-xs font-bold text-blue-deep flex-shrink-0">
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
              disabled={saving}
              className="w-20 border-2 border-blue-deep rounded-lg px-2 py-1 text-sm font-semibold text-text-primary outline-none bg-white shadow-[2px_2px_0_#0D4F78] focus:shadow-[1px_1px_0_#0D4F78] focus:translate-x-0.5 focus:translate-y-0.5 transition-all"
            />
            <span className="text-sm text-text-muted font-medium">ml</span>
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs font-semibold text-teal-core hover:text-teal-deep transition-colors cursor-pointer disabled:opacity-50"
            >
              {saving ? '…' : 'Save'}
            </button>
            <button
              onClick={() => { setEditing(false); setEditValue(String(log.amount_ml)) }}
              disabled={saving}
              className="text-xs font-semibold text-text-muted hover:text-text-primary transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="font-semibold text-text-primary hover:text-blue-core transition-colors cursor-pointer"
          >
            {log.amount_ml} ml
          </button>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-text-muted">
            {formatTime(log.logged_at)}
          </span>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="w-6 h-6 rounded-md border-2 border-border bg-white text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  )
}
export default function LogList({ logs }: LogListProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  if (logs.length === 0) {
    return (
      <div className="text-sm text-text-muted text-center py-6">
        No logs yet today. Start drinking! 💧
      </div>
    )
  }

  return (
    <div>
      <ConfirmDialog
        isOpen={showConfirm}
        title="Clear all logs?"
        message="This will delete all water entries for today. This cannot be undone."
        onConfirm={async () => {
          await clearAllLogs()
          await new Promise(resolve => setTimeout(resolve, 1500))
          setShowConfirm(false)
        }}
        onCancel={() => setShowConfirm(false)}
      />

      <div className="flex justify-between items-center mb-3">
        <div className="text-xs font-semibold uppercase tracking-widest text-text-muted">
          Today&apos;s log
        </div>
        <button
          type="button"
          onClick={() => setShowConfirm(true)}
          className="text-xs font-semibold text-text-muted hover:text-status-error transition-colors cursor-pointer"
        >
          Clear all
        </button>
      </div>

      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <LogItem key={log.id} log={log} />
        ))}
      </div>
    </div>
  )
}