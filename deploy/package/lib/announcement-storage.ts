const STORAGE_KEY = "mq-announcement-dismissed-until"
const ONE_HOUR_MS = 60 * 60 * 1000

export function isAnnouncementSnoozed(): boolean {
  if (typeof window === "undefined") return false
  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return false
  const until = Number(raw)
  if (!Number.isFinite(until)) {
    localStorage.removeItem(STORAGE_KEY)
    return false
  }
  if (Date.now() < until) return true
  localStorage.removeItem(STORAGE_KEY)
  return false
}

export function snoozeAnnouncementForOneHour(): void {
  localStorage.setItem(STORAGE_KEY, String(Date.now() + ONE_HOUR_MS))
}
