export function getTodayRangeForTimezone(timezone: string): { start: string; end: string } {
  const now = new Date()

  const todayStr = now.toLocaleDateString('en-CA', { timeZone: timezone })

  const getOffset = (date: Date, tz: string) => {
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone: tz }))
    return utcDate.getTime() - tzDate.getTime()
  }

  const offset = getOffset(now, timezone)
  const startLocal = new Date(`${todayStr}T00:00:00`)
  const endLocal = new Date(`${todayStr}T23:59:59.999`)

  return {
    start: new Date(startLocal.getTime() + offset).toISOString(),
    end: new Date(endLocal.getTime() + offset).toISOString(),
  }
}