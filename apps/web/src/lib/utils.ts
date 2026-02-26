export function getTodayRangeForTimezone(timezone: string, dayOffset = 0): { start: string; end: string } {
  const now = new Date()
  const shifted = new Date(now.getTime() + dayOffset * 86400000)
  const todayStr = shifted.toLocaleDateString('en-CA', { timeZone: timezone })

  const start = toUTCISO(todayStr, '00:00:00.000', timezone)
  const end = toUTCISO(todayStr, '23:59:59.999', timezone)

  return { start, end }
}

function toUTCISO(dateStr: string, timeStr: string, timezone: string): string {
  const localDate = new Date(`${dateStr}T${timeStr}`)
  const offsetMs = getTimezoneOffset(localDate, timezone)
  return new Date(localDate.getTime() - offsetMs).toISOString()
}

export function getTimezoneOffset(date: Date, timezone: string): number {
  const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  return local.getTime() - utc.getTime()
}
