'use client'
import React, { useState } from 'react'
import Button from '@/components/ui/Button'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  onConfirm: () => Promise<void> | void
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
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-blue-deep/40 z-40"
        onClick={() => { if (!loading) onCancel() }}
      />
      {/* Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        aria-describedby="confirm-message"
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm px-6"
      >
        <div className="bg-white dark:bg-dark-card border-2 border-blue-deep dark:border-dark-border rounded-2xl shadow-[6px_6px_0_#0D4F78] overflow-hidden">
          <div className="p-6">
            <h3 id="confirm-title" className="text-lg font-bold text-blue-deep dark:text-blue-light mb-2">
              {title}
            </h3>
            <p id="confirm-message" className="text-sm font-medium text-text-secondary dark:text-dark-text-secondary mb-6">
              {message}
            </p>
            <div className="flex gap-3">
              <Button
                variant="ghost"
                fullWidth
                onClick={() => { if (!loading) onCancel() }}
                disabled={loading}
              >
                No
              </Button>
              <Button
                variant={confirmVariant === 'danger' ? 'danger' : 'primary'}
                fullWidth
                onClick={handleConfirm}
                disabled={loading}
              >
                {loading ? 'Loading…' : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
