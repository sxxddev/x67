import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { normalizeProductImage } from "@/lib/product-image"
import { syncProductOptions } from "@/lib/product-options-server"
import type { ProductOptionInput } from "@/lib/product-options"

// GET all products with stock count
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
        options: { orderBy: { sortOrder: "asc" } },
        _count: { 
          select: { 
            orders: true,
            productStock: true,
          } 
        },
      },
    })

    // Get available stock count for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const availableStock = await prisma.productStock.count({
          where: {
            productId: product.id,
            status: "AVAILABLE",
          },
        })
        return {
          ...product,
          stockCount: availableStock,
        }
      })
    )

    return NextResponse.json(productsWithStock)
  } catch (error) {
    console.error("Admin products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new product
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    let image: string | null = null
    try {
      image = normalizeProductImage(body.image)
    } catch (err) {
      const message = err instanceof Error ? err.message : "รูปภาพไม่ถูกต้อง"
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const product = await prisma.product.create({
      data: {
        name: body.name,
        description: body.description || "",
        price: parseFloat(body.price),
        discount: body.discount ? parseFloat(body.discount) : 0,
        image,
        categoryId: body.categoryId,
        isUnlimited: body.isUnlimited || false,
        generatesLicenseKey: body.generatesLicenseKey || false,
        pointsEarn: parseInt(body.pointsEarn) || 0,
        isHot: body.isHot || false,
        badge: body.badge || null,
        isActive: body.isActive !== false,
      },
    })

    if (Array.isArray(body.options) && body.options.length > 0) {
      await syncProductOptions(product.id, body.options as ProductOptionInput[])
    }

    const withOptions = await prisma.product.findUnique({
      where: { id: product.id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    })

    return NextResponse.json(withOptions ?? product, { status: 201 })
  } catch (error) {
    console.error("Create product error:", error)
    const message =
      error instanceof Error && error.message.includes("too long")
        ? "รูปภาพยาวเกินขีดจำกัด — ใช้ URL แทน หรือรัน prisma db push อัปเดตฐานข้อมูล"
        : "Internal server error"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
