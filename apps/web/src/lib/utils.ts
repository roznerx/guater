export function getTimezoneOffset(date: Date, timezone: string): number {
  const utc = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }))
  const local = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  return local.getTime() - utc.getTime()
}
