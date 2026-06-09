import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { normalizeProductImage } from "@/lib/product-image"

// GET all categories
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const categories = await prisma.category.findMany({
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      include: {
        _count: { select: { products: true } },
      },
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Admin categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new category
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    if (!body.name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 })
    }

    let image: string | null = null
    if (body.image !== undefined && body.image !== null && body.image !== "") {
      try {
        image = normalizeProductImage(body.image)
      } catch (err) {
        const message = err instanceof Error ? err.message : "รูปภาพไม่ถูกต้อง"
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    const category = await prisma.category.create({
      data: {
        name: body.name.trim(),
        image,
        isFeatured: Boolean(body.isFeatured),
        order: Number.isFinite(Number(body.order)) ? Number(body.order) : 0,
      },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error("Create category error:", error)
    return NextResponse.json({ error: "Internal server error - name might be duplicate" }, { status: 500 })
  }
}
