'use client'

import { useState } from 'react'
import type { WaterLog } from '@guater/types'
import { deleteLog, clearAllLogs } from '@/app/actions'
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

  async function handleDelete() {
    if (deleting) return
    setDeleting(true)
    await deleteLog(log.id)
  }

  return (
    <div className={`flex justify-between items-center px-4 py-3 rounded-xl border-2 border-border bg-surface transition-opacity ${deleting ? 'opacity-40' : ''}`}>
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded-full bg-blue-pale border-2 border-blue-deep flex items-center justify-center text-xs font-bold text-blue-deep flex-shrink-0">
          💧
        </div>
        <span className="font-semibold text-text-primary">
          {log.amount_ml} ml
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium text-text-muted">
          {formatTime(log.logged_at)}
        </span>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="w-6 h-6 rounded-md border-2 border-border bg-white text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer disabled:cursor-not-allowed"
        >
          {deleting ? '…' : '✕'}
        </button>
      </div>
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