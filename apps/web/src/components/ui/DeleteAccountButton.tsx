'use client'

import { useState } from 'react'
import { deleteAccount } from '@/app/actions/deleteAccount'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'

export default function DeleteAccountButton() {
  const [step, setStep] = useState<'idle' | 'confirm1' | 'confirm2'>('idle')
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConfirmedDelete() {
    setPending(true)
    setError(null)
    try {
      await deleteAccount()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setPending(false)
      setStep('idle')
    }
  }

  return (
    <>
      <ConfirmDialog
        isOpen={step === 'confirm1'}
        title="Delete account"
        message="This will permanently delete your account and all your data — logs, presets, and settings. This cannot be undone."
        confirmLabel="Continue"
        confirmVariant="danger"
        onConfirm={() => setStep('confirm2')}
        onCancel={() => setStep('idle')}
      />

      <ConfirmDialog
        isOpen={step === 'confirm2'}
        title="Are you absolutely sure?"
        message="Your data cannot be recovered after deletion. This is your last chance to cancel."
        confirmLabel={pending ? 'Deleting…' : 'Yes, delete everything'}
        confirmVariant="danger"
        onConfirm={handleConfirmedDelete}
        onCancel={() => setStep('idle')}
      />

      {error && (
        <p className="text-xs text-status-error font-semibold mb-2">{error}</p>
      )}

      <Button
        variant="ghost"
        fullWidth
        onClick={() => setStep('confirm1')}
        disabled={pending}
        className="border-status-error text-status-error hover:bg-status-error/5"
      >
        {pending ? 'Deleting…' : 'Delete account'}
      </Button>
    </>
  )
}
