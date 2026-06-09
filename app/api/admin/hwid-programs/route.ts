import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return (
    session?.user &&
    ((session.user as { role?: string }).role ?? "").toLowerCase() === "admin"
  )
}

export async function GET() {
  try {
    const session = await auth()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const programs = await prisma.hwidProgram.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        product: { select: { id: true, name: true } },
        _count: { select: { resets: true } },
      },
    })

    return NextResponse.json(
      programs.map((p) => ({
        ...p,
        apiKey: p.apiKey ? "••••••••" : null,
      }))
    )
  } catch (error) {
    console.error("Admin HWID programs error:", error)
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

    if (body.action === "sync-from-products") {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
      })

      const existing = await prisma.hwidProgram.findMany({
        select: { productId: true, name: true },
      })
      const linkedProductIds = new Set(
        existing.map((p) => p.productId).filter(Boolean) as string[]
      )
      const existingNames = new Set(existing.map((p) => p.name.toLowerCase()))

      const toCreate = products.filter(
        (product) =>
          !linkedProductIds.has(product.id) &&
          !existingNames.has(product.name.toLowerCase())
      )

      if (toCreate.length === 0) {
        return NextResponse.json({ created: 0, message: "ไม่มีสินค้าใหม่ให้นำเข้า" })
      }

      await prisma.hwidProgram.createMany({
        data: toCreate.map((product, index) => ({
          name: product.name,
          productId: product.id,
          price: 20,
          sortOrder: existing.length + index,
          isActive: true,
        })),
      })

      return NextResponse.json({
        created: toCreate.length,
        message: `นำเข้า ${toCreate.length} โปรแกรมจากสินค้าแล้ว`,
      })
    }

    const name = String(body.name ?? "").trim()
    if (!name) {
      return NextResponse.json({ error: "กรุณากรอกชื่อโปรแกรม" }, { status: 400 })
    }

    const program = await prisma.hwidProgram.create({
      data: {
        name,
        price: Number(body.price) || 20,
        productId: body.productId || null,
        apiEndpoint: body.apiEndpoint?.trim() || null,
        apiKey: body.apiKey?.trim() || null,
        apiKeyHeader: body.apiKeyHeader?.trim() || "Authorization",
        licenseKeyField: body.licenseKeyField?.trim() || "license",
        sortOrder: Number(body.sortOrder) || 0,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json(program)
  } catch (error) {
    console.error("Admin create HWID program error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
