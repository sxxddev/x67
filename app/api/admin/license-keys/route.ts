import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { maskLicenseKey } from "@/lib/license-key"
import { bulkGenerateLicenseKeys } from "@/lib/license-service"
import { prisma } from "@/lib/prisma"

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return (
    session?.user &&
    ((session.user as { role?: string }).role ?? "").toLowerCase() === "admin"
  )
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const productId = searchParams.get("productId")?.trim()
    const status = searchParams.get("status")?.trim()
    const q = searchParams.get("q")?.trim()
    const take = Math.min(Number(searchParams.get("take") ?? 100), 200)

    const keys = await prisma.licenseKey.findMany({
      where: {
        ...(productId ? { productId } : {}),
        ...(status ? { status: status as "ACTIVE" | "REVOKED" | "EXPIRED" } : {}),
        ...(q
          ? {
              OR: [
                { key: { contains: q.toUpperCase() } },
                { note: { contains: q } },
              ],
            }
          : {}),
      },
      orderBy: { createdAt: "desc" },
      take,
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, username: true, email: true } },
        order: { select: { id: true } },
      },
    })

    return NextResponse.json(
      keys.map((row) => ({
        ...row,
        keyMasked: maskLicenseKey(row.key),
      }))
    )
  } catch (error) {
    console.error("Admin license keys GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const productId = String(body.productId ?? "").trim()
    const count = Number(body.count) || 1
    const durationDays =
      body.durationDays === null || body.durationDays === ""
        ? null
        : Number(body.durationDays) || null
    const note = body.note ? String(body.note).trim() : null

    if (!productId) {
      return NextResponse.json({ error: "กรุณาเลือกสินค้า" }, { status: 400 })
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    })

    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้า" }, { status: 404 })
    }

    const keys = await bulkGenerateLicenseKeys({
      productId,
      count,
      durationDays,
      note,
    })

    return NextResponse.json({
      success: true,
      count: keys.length,
      keys,
      message: `สร้าง License Key ${keys.length} รายการแล้ว`,
    })
  } catch (error) {
    console.error("Admin license keys POST error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
