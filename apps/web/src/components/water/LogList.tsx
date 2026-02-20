import type { WaterLog } from '@guater/types'
import { deleteLog } from '@/app/actions'

interface LogListProps {
  logs: WaterLog[]
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function LogList({ logs }: LogListProps) {
  if (logs.length === 0) {
    return (
      <div className="text-sm text-text-muted text-center py-6">
        No logs yet today. Start drinking! 💧
      </div>
    )
  }

  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-widest text-text-muted mb-3">
        Today&apos;s log
      </div>
      <div className="flex flex-col gap-2">
        {logs.map((log) => (
          <div
            key={log.id}
            className="flex justify-between items-center px-4 py-3 rounded-xl border-2 border-border bg-surface"
          >
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
              <form action={deleteLog.bind(null, log.id)}>
                <button
                  type="submit"
                  className="w-6 h-6 rounded-md border-2 border-border bg-white text-text-muted text-xs hover:border-status-error hover:text-status-error transition-colors flex items-center justify-center cursor-pointer"
                >
                  ✕
                </button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}