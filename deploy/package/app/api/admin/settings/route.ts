import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/get-site-settings"
import {
  angpaoPhoneError,
  isValidThaiMobile,
  normalizeThaiPhone,
} from "@/lib/angpao-phone"
import {
  DEFAULT_SITE_SETTINGS,
  SITE_SETTINGS_ID,
} from "@/lib/site-settings-defaults"

const MASKED_KEY = "••••••••"

async function requireAdmin() {
  const session = await auth()
  if (
    !session?.user ||
    ((session.user as { role?: string }).role || "").toLowerCase() !== "admin"
  ) {
    return null
  }
  return session
}

function toAdminResponse(settings: Awaited<ReturnType<typeof getSiteSettings>>) {
  return {
    ...settings,
    angpaoApiKey: settings.angpaoApiKey ? MASKED_KEY : "",
    angpaoApiKeySet: Boolean(settings.angpaoApiKey),
  }
}

export async function GET() {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const settings = await getSiteSettings()
    return NextResponse.json(toAdminResponse(settings))
  } catch (error) {
    console.error("Admin settings GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!(await requireAdmin())) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const angpaoApiKeyRaw =
      body.angpaoApiKey != null ? String(body.angpaoApiKey).trim() : ""
    const updateApiKey =
      angpaoApiKeyRaw.length > 0 && !angpaoApiKeyRaw.includes("•")

    const angpaoAutoApprove = Boolean(body.angpaoAutoApprove ?? false)
    const receiverRaw =
      body.angpaoReceiverPhone != null
        ? String(body.angpaoReceiverPhone).trim()
        : ""
    const angpaoReceiverPhone = receiverRaw
      ? normalizeThaiPhone(receiverRaw)
      : null

    if (
      angpaoAutoApprove &&
      (!angpaoReceiverPhone || !isValidThaiMobile(angpaoReceiverPhone))
    ) {
      return NextResponse.json({ error: angpaoPhoneError() }, { status: 400 })
    }

    const data = {
      siteName:
        String(body.siteName ?? "").trim() || DEFAULT_SITE_SETTINGS.siteName,
      siteDescription:
        body.siteDescription != null ? String(body.siteDescription) : null,
      promptPayNumber:
        body.promptPayNumber != null ? String(body.promptPayNumber) : null,
      promptPayName:
        body.promptPayName != null ? String(body.promptPayName) : null,
      pointsPerBaht: Number(
        body.pointsPerBaht ?? DEFAULT_SITE_SETTINGS.pointsPerBaht
      ),
      pointsValue: Number(
        body.pointsValue ?? DEFAULT_SITE_SETTINGS.pointsValue
      ),
      minTopup: Number(body.minTopup ?? DEFAULT_SITE_SETTINGS.minTopup),
      maxTopup: Number(body.maxTopup ?? DEFAULT_SITE_SETTINGS.maxTopup),
      angpaoEnabled: Boolean(body.angpaoEnabled ?? true),
      angpaoAutoApprove,
      angpaoReceiverPhone,
      angpaoApiEndpoint:
        body.angpaoApiEndpoint != null
          ? String(body.angpaoApiEndpoint).trim() || null
          : null,
      angpaoAllowedHosts:
        body.angpaoAllowedHosts != null
          ? String(body.angpaoAllowedHosts).trim() ||
            DEFAULT_SITE_SETTINGS.angpaoAllowedHosts
          : DEFAULT_SITE_SETTINGS.angpaoAllowedHosts,
      ...(updateApiKey ? { angpaoApiKey: angpaoApiKeyRaw } : {}),
    }

    const settings = await prisma.siteSettings.upsert({
      where: { id: SITE_SETTINGS_ID },
      create: {
        id: SITE_SETTINGS_ID,
        ...DEFAULT_SITE_SETTINGS,
        ...data,
        angpaoApiKey: updateApiKey
          ? angpaoApiKeyRaw
          : DEFAULT_SITE_SETTINGS.angpaoApiKey || null,
      },
      update: data,
    })

    return NextResponse.json(toAdminResponse(settings))
  } catch (error) {
    console.error("Admin settings PUT error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
