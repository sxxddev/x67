export type HwidApiConfig = {
  apiEndpoint: string | null
  apiKey: string | null
  apiKeyHeader: string | null
  licenseKeyField: string
}

export type HwidApiResult = {
  ok: boolean
  statusCode?: number
  body?: string
  error?: string
}

export async function callHwidResetApi(
  config: HwidApiConfig,
  licenseKey: string
): Promise<HwidApiResult> {
  const endpoint = config.apiEndpoint?.trim()
  if (!endpoint) {
    return { ok: false, error: "ยังไม่ได้ตั้งค่า API สำหรับโปรแกรมนี้" }
  }

  const field = config.licenseKeyField?.trim() || "license"
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  }

  const apiKey = config.apiKey?.trim()
  if (apiKey) {
    const headerName = config.apiKeyHeader?.trim() || "Authorization"
    const value =
      headerName.toLowerCase() === "authorization" && !apiKey.startsWith("Bearer ")
        ? `Bearer ${apiKey}`
        : apiKey
    headers[headerName] = value
  }

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify({ [field]: licenseKey.trim() }),
      signal: AbortSignal.timeout(20_000),
    })

    const body = await res.text()
    if (!res.ok) {
      return {
        ok: false,
        statusCode: res.status,
        body: body.slice(0, 4000),
        error: `API ตอบกลับ ${res.status}`,
      }
    }

    return {
      ok: true,
      statusCode: res.status,
      body: body.slice(0, 4000),
    }
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "เรียก API ไม่สำเร็จ",
    }
  }
}

/** แสดงคีย์แบบ mask ในประวัติ */
export function maskLicenseKey(key: string): string {
  const clean = key.trim()
  if (clean.length <= 4) return `${clean}***`
  return `${clean.slice(0, 4)}***`
}
