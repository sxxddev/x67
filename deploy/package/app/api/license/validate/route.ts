import { NextRequest, NextResponse } from "next/server"
import {
  getLicenseApiSecret,
  licenseCorsHeaders,
  normalizeLicenseKey,
} from "@/lib/license-key"
import { validateAndBindLicense } from "@/lib/license-service"

function jsonWithCors(body: object, status = 200) {
  return NextResponse.json(body, {
    status,
    headers: licenseCorsHeaders(),
  })
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: licenseCorsHeaders(),
  })
}

export async function POST(req: NextRequest) {
  try {
    const secret = getLicenseApiSecret()
    if (secret) {
      const headerSecret = req.headers.get("x-license-secret")?.trim()
      if (headerSecret !== secret) {
        return jsonWithCors({ success: false, error: "Unauthorized" }, 401)
      }
    }

    const body = await req.json()
    const key = normalizeLicenseKey(String(body.key ?? body.license ?? ""))
    const hwid = String(body.hwid ?? body.hwId ?? "").trim()
    const productId = body.productId ? String(body.productId).trim() : undefined

    const result = await validateAndBindLicense({ key, hwid, productId })

    if (!result.ok) {
      return jsonWithCors({ success: false, error: result.error }, 403)
    }

    return jsonWithCors({
      success: true,
      message: "ยืนยันสำเร็จ",
      productName: result.productName,
      expiresAt: result.expiresAt?.toISOString() ?? null,
    })
  } catch (error) {
    console.error("License validate error:", error)
    return jsonWithCors({ success: false, error: "เกิดข้อผิดพลาด" }, 500)
  }
}
