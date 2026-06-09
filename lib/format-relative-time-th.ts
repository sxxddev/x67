/** เวลาแบบ relative ภาษาไทย — "4 ชม.ที่แล้ว" */
export function formatRelativeTimeTh(from: Date, now = new Date()): string {
  const diffMs = now.getTime() - from.getTime()
  if (diffMs < 0) return "เมื่อสักครู่"

  const minutes = Math.floor(diffMs / 60_000)
  if (minutes < 1) return "เมื่อสักครู่"
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} ชม.ที่แล้ว`

  const days = Math.floor(hours / 24)
  return `${days} วันที่แล้ว`
}
