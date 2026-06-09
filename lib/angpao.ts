import {
  angpaoPhoneError,
  isValidThaiMobile,
  normalizeThaiPhone,
} from "@/lib/angpao-phone"
import {
  VORNYX_TRUEMONEY_API,
  redeemTrueMoneyVoucher,
} from "@/lib/vornyx-truemoney"

export { VORNYX_TRUEMONEY_API, redeemTrueMoneyVoucher }

const DEFAULT_HOSTS = ["gift.truemoney.com", "tmn.app"]

export function parseAllowedHosts(hosts: string | null | undefined) {
  if (!hosts?.trim()) return DEFAULT_HOSTS
  return hosts
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean)
}

export function isValidAngpaoLink(
  link: string,
  allowedHosts?: string | null
): boolean {
  const trimmed = link.trim()
  if (!trimmed) return false

  // รองรับ hash ซองโดยตรง (Vornyx รับได้)
  if (/^[a-f0-9]{20,}$/i.test(trimmed)) return true

  try {
    const url = new URL(trimmed)
    const hosts = parseAllowedHosts(allowedHosts)
    const host = url.hostname.toLowerCase()
    return hosts.some((h) => host === h || host.endsWith(`.${h}`))
  } catch {
    return false
  }
}

export function resolveAngpaoReceiverPhone(
  stored?: string | null
): string | null {
  const raw = stored?.trim() || process.env.ANGPAO_RECEIVER_PHONE?.trim() || ""
  if (!raw) return null
  return normalizeThaiPhone(raw)
}

export function resolveAngpaoApiEndpoint(stored?: string | null): string {
  return (
    stored?.trim() ||
    process.env.ANGPAO_REDEEM_API_URL?.trim() ||
    VORNYX_TRUEMONEY_API
  )
}

export function isVornyxAngpaoEndpoint(endpoint: string): boolean {
  const lower = endpoint.toLowerCase()
  return lower.includes("vornyx.pro") || lower.includes("apitrue.")
}

export type AngpaoRedeemResult =
  | { ok: true; message?: string; redeemedAmount?: number }
  | { ok: false; error: string }

async function redeemViaVornyx(params: {
  link: string
  phone: string
  endpoint: string
}): Promise<AngpaoRedeemResult> {
  const result = await redeemTrueMoneyVoucher(
    params.phone,
    params.link,
    params.endpoint
  )

  if (result.ok) {
    return {
      ok: true,
      message: "vornyx-redeemed",
      redeemedAmount: result.amountBaht > 0 ? result.amountBaht : undefined,
    }
  }

  return { ok: false, error: result.error }
}

async function redeemViaGenericApi(params: {
  link: string
  amount: number
  userId: number
  phone: string
  endpoint: string
  apiKey?: string | null
}): Promise<AngpaoRedeemResult> {
  const res = await fetch(params.endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(params.apiKey?.trim() || process.env.ANGPAO_REDEEM_API_KEY
        ? {
            Authorization: `Bearer ${params.apiKey?.trim() || process.env.ANGPAO_REDEEM_API_KEY}`,
          }
        : {}),
    },
    body: JSON.stringify({
      link: params.link.trim(),
      url: params.link.trim(),
      voucher: params.link.trim(),
      amount: params.amount,
      userId: params.userId,
      phone: params.phone,
      mobile: params.phone,
      receiverPhone: params.phone,
      receiver_phone: params.phone,
    }),
    signal: AbortSignal.timeout(25_000),
  })

  const data = (await res.json().catch(() => ({}))) as {
    success?: boolean
    ok?: boolean
    error?: string
    message?: string
    status?: { code?: string }
    data?: { my_ticket?: { amount_baht?: string } }
  }

  if (!res.ok) {
    return {
      ok: false,
      error: data.error || data.message || `API รับซองล้มเหลว (${res.status})`,
    }
  }

  if (data.success === false || data.ok === false) {
    return {
      ok: false,
      error: data.error || data.message || "ไม่สามารถรับซองอังเปาได้",
    }
  }

  if (data.status?.code?.toUpperCase() === "SUCCESS") {
    const raw = data.data?.my_ticket?.amount_baht
    const redeemedAmount = raw ? parseFloat(String(raw)) : undefined
    return {
      ok: true,
      message: data.message || "redeemed",
      redeemedAmount:
        redeemedAmount && Number.isFinite(redeemedAmount)
          ? redeemedAmount
          : undefined,
    }
  }

  return { ok: true, message: data.message || "redeemed" }
}

/** เรียก API รับซองเข้าเบอร์ผู้รับที่ตั้งไว้ */
export async function redeemAngpaoLink(params: {
  link: string
  amount: number
  userId: number
  receiverPhone?: string | null
  apiEndpoint?: string | null
  apiKey?: string | null
  allowedHosts?: string | null
  requireApi?: boolean
}): Promise<AngpaoRedeemResult> {
  const {
    link,
    amount,
    userId,
    receiverPhone,
    apiEndpoint,
    apiKey,
    allowedHosts,
    requireApi = false,
  } = params

  if (!isValidAngpaoLink(link, allowedHosts)) {
    return {
      ok: false,
      error: "ลิงก์ซองอังเปาไม่ถูกต้อง (ต้องเป็นลิงก์ TrueMoney Wallet)",
    }
  }

  const phone = receiverPhone
    ? normalizeThaiPhone(receiverPhone)
    : resolveAngpaoReceiverPhone(null)

  if (!phone || !isValidThaiMobile(phone)) {
    return { ok: false, error: angpaoPhoneError() }
  }

  const endpoint = resolveAngpaoApiEndpoint(apiEndpoint)

  if (!endpoint) {
    if (requireApi) {
      return {
        ok: false,
        error:
          "ยังไม่ได้ตั้งค่า API รับซอง — ต้องมี API เพื่อรับเงินเข้าเบอร์ TrueMoney อัตโนมัติ",
      }
    }
    return { ok: true, message: "validated-link-only" }
  }

  try {
    if (isVornyxAngpaoEndpoint(endpoint)) {
      return await redeemViaVornyx({ link, phone, endpoint })
    }

    return await redeemViaGenericApi({
      link,
      amount,
      userId,
      phone,
      endpoint,
      apiKey,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : "unknown"
    return { ok: false, error: `เชื่อมต่อ API รับซองไม่สำเร็จ: ${msg}` }
  }
}
