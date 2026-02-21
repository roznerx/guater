export function getTodayRangeForTimezone(timezone: string): { start: string; end: string } {
  const now = new Date()
  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })
  const offset = getTimezoneOffset(now, timezone)
  const startLocal = new Date(`${todayStr}T00:00:00`)
  const endLocal = new Date(`${todayStr}T23:59:59.999`)

  return {
    start: new Date(startLocal.getTime() + offset).toISOString(),
    end: new Date(endLocal.getTime() + offset).toISOString(),
  }
}

export function getTimezoneOffset(date: Date, timezone: string): number {
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const tzDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  return utcDate.getTime() - tzDate.getTime()
}