export function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date + 'T00:00:00') : date
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function formatDayLabel(date: string): string {
  const d = new Date(date + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()
}

export function getWeekStart(date?: string): string {
  const d = date ? new Date(date + 'T00:00:00') : new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

export function getWeekEnd(date?: string): string {
  const start = new Date(getWeekStart(date) + 'T00:00:00')
  start.setDate(start.getDate() + 6)
  return start.toISOString().split('T')[0]
}

export function getWeekDays(weekStart?: string): string[] {
  const start = new Date((weekStart || getWeekStart()) + 'T00:00:00')
  const days: string[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function getWeekNumber(date?: string): number {
  const d = date ? new Date(date + 'T00:00:00') : new Date()
  const startOfYear = new Date(d.getFullYear(), 0, 1)
  const diff = d.getTime() - startOfYear.getTime()
  return Math.ceil((diff / 86400000 + startOfYear.getDay() + 1) / 7)
}

export function daysClean(startDate: string, lastResetDate?: string | null): number {
  const from = lastResetDate
    ? new Date(lastResetDate + 'T00:00:00')
    : new Date(startDate + 'T00:00:00')
  const now = new Date()
  const diff = now.getTime() - from.getTime()
  return Math.max(0, Math.floor(diff / 86400000))
}

export function getPast7Days(): string[] {
  const days: string[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().split('T')[0])
  }
  return days
}

export function getMonthDays(year: number, month: number): string[] {
  const days: string[] = []
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push(date.toISOString().split('T')[0])
  }
  return days
}

export function isToday(date: string): boolean {
  return date === today()
}

export function isFuture(date: string): boolean {
  return date > today()
}
