/** ตัด HTML/script ออกจากข้อความสำหรับแสดงบนการ์ด (ไม่ render เป็น markup) */
export function stripHtmlToText(html: string, maxLen = 100): string {
  const noScript = html.replace(/<script[\s\S]*?<\/script>/gi, "")
  const text = noScript
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (text.length <= maxLen) return text
  return `${text.slice(0, maxLen).trim()}…`
}
