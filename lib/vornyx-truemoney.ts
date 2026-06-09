/** Vornyx TrueMoney Voucher API — https://www.vornyx.pro/ */
export const VORNYX_TRUEMONEY_API = "http://apitrue.vornyx.pro/truemoney"

export type VornyxRedeemResponse = {
  status?: string | { message?: string; code?: string }
  message?: string
  data?: {
    voucher?: { amount_baht?: string; status?: string; link?: string }
    owner_profile?: { full_name?: string }
    my_ticket?: { mobile?: string; amount_baht?: string; full_name?: string }
  }
}

export type VornyxRedeemResult =
  | {
      ok: true
      amountBaht: number
      data: NonNullable<VornyxRedeemResponse["data"]>
    }
  | { ok: false; error: string; raw?: VornyxRedeemResponse }

const ERROR_TH: Record<string, string> = {
  VOUCHER_OUT_OF_STOCK: "ซองหมดแล้ว",
  VOUCHER_REDEEMED: "ซองถูกแลกไปแล้ว",
  VOUCHER_NOT_FOUND: "ไม่พบซองอังเปา",
  VOUCHER_EXPIRED: "ซองหมดอายุแล้ว",
  TARGET_USER_NOT_FOUND: "ไม่พบเบอร์ TrueWallet นี้",
  REDEEMED: "ซองถูกแลกไปแล้ว",
}

function mapError(data: VornyxRedeemResponse, httpStatus: number): string {
  if (httpStatus === 429) {
    return "เรียก API บ่อยเกินไป (สูงสุด 10 ครั้ง/นาที)"
  }
  const code =
    typeof data.status === "object"
      ? data.status?.code?.toUpperCase()
      : undefined
  if (code && ERROR_TH[code]) return ERROR_TH[code]
  if (typeof data.status === "object" && data.status?.message) {
    return String(data.status.message)
  }
  if (typeof data.status === "string" && data.status.toLowerCase() === "fail") {
    return data.message || "ไม่สามารถรับซองได้"
  }
  return data.message || `รับซองล้มเหลว (${httpStatus})`
}

/** แลกซองอังเปา TrueMoney — ตาม docs Vornyx */
export async function redeemTrueMoneyVoucher(
  phone: string,
  voucher: string,
  endpoint: string = VORNYX_TRUEMONEY_API
): Promise<VornyxRedeemResult> {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, voucher: voucher.trim() }),
    signal: AbortSignal.timeout(30_000),
  })

  const data = (await res.json().catch(() => ({}))) as VornyxRedeemResponse

  if (data?.status && typeof data.status === "object" && data.status.code === "SUCCESS") {
    const amountRaw =
      data.data?.my_ticket?.amount_baht ?? data.data?.voucher?.amount_baht ?? "0"
    const amountBaht = parseFloat(String(amountRaw))

    return {
      ok: true,
      amountBaht: Number.isFinite(amountBaht) ? amountBaht : 0,
      data: data.data ?? {},
    }
  }

  return { ok: false, error: mapError(data, res.status), raw: data }
}
