/** แปลงเบอร์ไทยเป็นรูปแบบ 0XXXXXXXXX (10 หลัก) */
export function normalizeThaiPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "")
  if (digits.length === 10 && digits.startsWith("0")) return digits
  if (digits.length === 11 && digits.startsWith("66")) return `0${digits.slice(2)}`
  if (digits.length === 9 && /^[689]/.test(digits)) return `0${digits}`
  return null
}

export function isValidThaiMobile(phone: string): boolean {
  const n = normalizeThaiPhone(phone)
  return n != null && /^0[689]\d{8}$/.test(n)
}

export function angpaoPhoneError(): string {
  return "กรุณาระบุเบอร์ TrueMoney ผู้รับซองให้ถูกต้อง (เช่น 0812345678)"
}
