import type { DiureticLog } from '@guater/types'

const THRESHOLDS: Record<string, { limit: number; message: string }> = {
  'Coffee':    { limit: 1000, message: 'More than 4 coffees today. Excess caffeine can cause anxiety, disrupted sleep and increased blood pressure.' },
  'Espresso':  { limit: 360,  message: 'More than 6 espresso shots today. High caffeine intake can cause heart palpitations.' },
  'Black tea': { limit: 1500, message: 'More than 6 cups of black tea today. High tannin intake may affect iron absorption.' },
  'Green tea': { limit: 2000, message: 'More than 8 cups of green tea today. Excessive intake may cause liver stress.' },
  'Mate':      { limit: 1200, message: 'More than 4 servings of mate today. High mate consumption is linked to increased cancer risk with regular excess.' },
  'Energy':    { limit: 500,  message: 'More than 2 energy drinks today. Excess consumption is linked to heart issues and high blood pressure.' },
  'Soda':      { limit: 1000, message: 'More than 3 sodas today. High sugar and phosphoric acid intake can affect bone density and blood sugar.' },
  'Beer':      { limit: 660,  message: 'More than 2 beers today. Alcohol is a strong diuretic and impairs hydration significantly.' },
  'Wine':      { limit: 300,  message: 'More than 2 glasses of wine today. Alcohol dehydrates and affects sleep quality.' },
  'Sparkling': { limit: 1500, message: 'More than 6 glasses of sparkling water today. Excess carbonation may cause bloating and discomfort.' },
}

interface DiureticWarningBannerProps {
  logs: DiureticLog[]
}

export default function DiureticWarningBanner({ logs }: DiureticWarningBannerProps) {
  const totals: Record<string, number> = {}
  for (const log of logs) {
    totals[log.label] = (totals[log.label] ?? 0) + log.amount_ml
  }

  const warnings = Object.entries(totals)
    .filter(([label, total]) => THRESHOLDS[label] && total >= THRESHOLDS[label].limit)
    .map(([label]) => ({ label, message: THRESHOLDS[label].message }))

  if (warnings.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      {warnings.map(({ label, message }) => (
        <div
          key={label}
          role="alert"
          className="border-2 border-status-warning bg-white dark:bg-dark-card rounded-xl px-4 py-3 shadow-[3px_3px_0_#E8A230] flex items-start gap-3"
        >
          <span aria-hidden="true" className="text-lg flex-shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-bold text-status-warning">
              High {label} intake
            </p>
            <p className="text-xs font-medium text-text-secondary dark:text-dark-text-secondary mt-0.5">
              {message}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
