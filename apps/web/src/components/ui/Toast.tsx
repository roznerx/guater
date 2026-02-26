'use client'
import { useEffect, useRef, useState } from 'react'

interface ToastProps {
  message: string
  type?: 'success' | 'error'
  duration?: number
  onDismiss: () => void
}

const styles = {
  success: 'border-teal-core bg-white text-teal-deep shadow-[3px_3px_0_#1A7A74]',
  error:   'border-status-error bg-white text-status-error shadow-[3px_3px_0_#D95F5F]',
}

export default function Toast({
  message,
  type = 'success',
  duration = 3000,
  onDismiss,
}: ToastProps) {
  const [visible, setVisible] = useState(false)

  const onDismissRef = useRef(onDismiss)
  useEffect(() => { onDismissRef.current = onDismiss }, [onDismiss])

  useEffect(() => {
    const enterTimer = setTimeout(() => setVisible(true), 10)
    const exitTimer = setTimeout(() => {
      setVisible(false)
      setTimeout(() => onDismissRef.current(), 300)
    }, duration)
    return () => {
      clearTimeout(enterTimer)
      clearTimeout(exitTimer)
    }
  }, [duration])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        fixed bottom-6 left-1/2 -translate-x-1/2 z-50
        border-2 rounded-xl px-5 py-3
        text-sm font-semibold whitespace-nowrap
        transition-all duration-300
        ${styles[type]}
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
      `}
    >
      {type === 'success' ? '✓ ' : '✕ '}{message}
    </div>
  )
}
