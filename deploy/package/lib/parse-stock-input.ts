export type ParsedStockLine = {
  email: string
  password: string
  data: string
}

const FREEFORM_EMAIL = "—"
const FREEFORM_PASS = "—"

const FIELD_LABEL_HEAD =
  /^(key|download|upload|email|e-?mail|password|pass|user|login|token|url|link|rockstar|license|serial|note|web|mail|username|host|server|file|otp|pin|code|id|ชื่อผู้ใช้|รหัส|ลิงก์|ดาวน์โหลด)$/i

function fieldLabelHead(line: string): string {
  const idx = line.indexOf(":")
  if (idx <= 0) return ""
  return line.slice(0, idx).trim()
}

function isFieldLabelLine(line: string): boolean {
  const head = fieldLabelHead(line.trim())
  return head.length > 0 && FIELD_LABEL_HEAD.test(head)
}

/** แถว email:pass แบบมี colon เดียว (ไม่มี label นำ เช่น key/download) */
function isBulkCredentialLine(line: string): boolean {
  const t = line.trim()
  const first = t.indexOf(":")
  if (first <= 0) return false
  if (t.indexOf(":", first + 1) !== -1) return false
  const head = t.slice(0, first).trim()
  if (!head || isFieldLabelLine(t)) return false
  return t.slice(first + 1).trim().length > 0
}

function parseSingleLine(line: string): ParsedStockLine {
  const pipeIdx = line.indexOf("|")
  if (pipeIdx > 0) {
    const email = line.slice(0, pipeIdx).trim()
    const password = line.slice(pipeIdx + 1).trim()
    if (email && password) {
      return { email, password, data: line }
    }
  }

  if (isBulkCredentialLine(line)) {
    const colonIdx = line.indexOf(":")
    return {
      email: line.slice(0, colonIdx).trim(),
      password: line.slice(colonIdx + 1).trim(),
      data: line,
    }
  }

  return {
    email: FREEFORM_EMAIL,
    password: FREEFORM_PASS,
    data: line,
  }
}

function parseBlock(block: string): ParsedStockLine[] {
  const trimmed = block.trim()
  if (!trimmed) return []

  const lines = trimmed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length === 0) return []
  if (lines.length === 1) return [parseSingleLine(lines[0])]

  const splitAsMultiple =
    lines.length > 1 &&
    lines.every(isBulkCredentialLine) &&
    !lines.some(isFieldLabelLine)

  if (splitAsMultiple) {
    return lines.map((line) => parseSingleLine(line))
  }

  return [
    {
      email: FREEFORM_EMAIL,
      password: FREEFORM_PASS,
      data: lines.join("\n"),
    },
  ]
}

/**
 * - บรรทัดว่างคั่น = หลายชิ้น
 * - หลายบรรทัดติดกัน = 1 ชิ้น (ค่าเริ่มต้น) ยกเว้น bulk email:pass หลายแถว
 */
export function parseStockInput(raw: string): ParsedStockLine[] {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const blocks = trimmed.split(/\n\s*\n+/).map((b) => b.trim()).filter(Boolean)
  return blocks.flatMap((block) => parseBlock(block))
}

export function isFreeformStockItem(item: {
  accountEmail: string
  accountPass: string
  accountData?: string | null
}): boolean {
  return (
    item.accountEmail === FREEFORM_EMAIL &&
    item.accountPass === FREEFORM_PASS &&
    !!item.accountData?.trim()
  )
}

export function formatStockLine(item: {
  accountEmail: string
  accountPass: string
  accountData?: string | null
}): string {
  if (item.accountData?.trim()) return item.accountData.trim()
  if (item.accountEmail === FREEFORM_EMAIL && item.accountPass === FREEFORM_PASS) return ""
  return `${item.accountEmail}:${item.accountPass}`
}

export function formatStockDeliveryItem(item: {
  email: string
  password: string
  data?: string | null
}): string {
  if (item.data?.trim()) return item.data.trim()
  if (item.email === FREEFORM_EMAIL || item.password === FREEFORM_PASS) return ""
  return `${item.email}:${item.password}`
}
