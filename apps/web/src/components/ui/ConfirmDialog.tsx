'use client'

import React, { useState } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => Promise<void>
  onCancel: () => void
  confirmLabel?: string
  confirmVariant?: 'danger' | 'primary'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel = 'Yes, delete',
  confirmVariant = 'danger',
}: ConfirmDialogProps): React.ReactNode {
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }

  if (!isOpen) return null

  return (
    <div>
      <div
        className="fixed inset-0 bg-blue-deep/40 z-40"
        onClick={() => { if (!loading) onCancel() }}
      ></div>

      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-6">
        <div className="bg-white dark:bg-dark-card border-2 border-blue-deep dark:border-dark-border rounded-2xl shadow-[6px_6px_0_#0D4F78] overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-bold text-blue-deep dark:text-blue-light mb-2">
              {title}
            </h3>
            <p className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-6">
              {message}
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => { if (!loading) onCancel() }}
                disabled={loading}
                className="flex-1 font-semibold rounded-xl px-4 py-2.5 text-sm border-2 border-border bg-white dark:bg-dark-card text-slate-deep dark:text-dark-text-secondary shadow-[3px_3px_0_#DDE8F0] hover:enabled:shadow-[1px_1px_0_#DDE8F0] hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                No
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className={`
                  flex-1 font-semibold rounded-xl px-4 py-2.5 text-sm border-2 text-white
                  shadow-[3px_3px_0_#0D4F78] hover:enabled:shadow-[1px_1px_0_#0D4F78]
                  hover:enabled:translate-x-0.5 hover:enabled:translate-y-0.5
                  transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
                  ${confirmVariant === 'primary'
                    ? 'bg-blue-core border-blue-deep'
                    : 'bg-status-error border-blue-deep'
                  }
                `}
              >
                {loading ? 'Loading…' : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}