/** แสดงชื่อผู้ซื้อแบบ mask — เช่น gup*** */
export function maskBuyerName(name: string | null | undefined): string {
  const clean = (name ?? "").trim()
  if (!clean) return "usr***"
  if (clean.length <= 3) return `${clean}***`
  return `${clean.slice(0, 3)}***`
}
