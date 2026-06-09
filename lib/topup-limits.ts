/** ค่าเริ่มต้นเติมเงิน — sync กับ admin settings (minTopup / maxTopup) */
export const TOPUP_MIN_AMOUNT = 10
export const TOPUP_MAX_AMOUNT = 10_000

export const TOPUP_AMOUNT_PLACEHOLDER =
  "ระบุจำนวนเงิน (10-10,000) 10 บาทขึ้นไป"

export function topupAmountError(min = TOPUP_MIN_AMOUNT, max = TOPUP_MAX_AMOUNT) {
  return `จำนวนเงินต้องอยู่ระหว่าง ${min.toLocaleString("th-TH")}-${max.toLocaleString("th-TH")} บาท (${min} บาทขึ้นไป)`
}

export function isValidTopupAmount(
  amount: number,
  min = TOPUP_MIN_AMOUNT,
  max = TOPUP_MAX_AMOUNT
) {
  return Number.isFinite(amount) && amount >= min && amount <= max
}

/** ขั้นต่ำซองอังเปา — ใช้ TOPUP_MIN_AMOUNT (10) แม้แอดมินตั้ง minTopup สูงกว่า (เช่น 20) */
export function getAngpaoMinTopup(siteMinTopup?: number | null): number {
  const configured =
    siteMinTopup != null && Number.isFinite(siteMinTopup)
      ? siteMinTopup
      : TOPUP_MIN_AMOUNT
  return Math.max(TOPUP_MIN_AMOUNT, Math.min(configured, TOPUP_MIN_AMOUNT))
}
