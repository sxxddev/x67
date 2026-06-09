import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { normalizeProductImage } from "@/lib/product-image"
import { syncProductOptions } from "@/lib/product-options-server"
import { serializeProductOption, type ProductOptionInput } from "@/lib/product-options"

// GET single product with stock
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const product = await prisma.product.findUnique({ 
      where: { id },
      include: {
        category: true,
        options: { orderBy: { sortOrder: "asc" } },
        _count: {
          select: {
            orders: true,
            productStock: true,
          }
        }
      }
    })
    
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    // Get available stock count
    const availableStock = await prisma.productStock.count({
      where: {
        productId: id,
        status: "AVAILABLE",
      }
    })

    return NextResponse.json({
      ...product,
      stockCount: availableStock,
      options: product.options.map(serializeProductOption),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT update product
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    let imageUpdate: { image: string | null } | Record<string, never> = {}
    if (body.image !== undefined) {
      try {
        imageUpdate = { image: normalizeProductImage(body.image) }
      } catch (err) {
        const message = err instanceof Error ? err.message : "รูปภาพไม่ถูกต้อง"
        return NextResponse.json({ error: message }, { status: 400 })
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.price !== undefined && { price: parseFloat(body.price) }),
        ...(body.discount !== undefined && { discount: parseFloat(body.discount) }),
        ...imageUpdate,
        ...(body.categoryId !== undefined && { categoryId: body.categoryId }),
        ...(body.isUnlimited !== undefined && { isUnlimited: body.isUnlimited }),
        ...(body.generatesLicenseKey !== undefined && {
          generatesLicenseKey: body.generatesLicenseKey,
        }),
        ...(body.pointsEarn !== undefined && { pointsEarn: parseInt(body.pointsEarn) }),
        ...(body.isHot !== undefined && { isHot: body.isHot }),
        ...(body.badge !== undefined && { badge: body.badge || null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    if (Array.isArray(body.options)) {
      await syncProductOptions(id, body.options as ProductOptionInput[])
    }

    const withOptions = await prisma.product.findUnique({
      where: { id },
      include: { options: { orderBy: { sortOrder: "asc" } } },
    })

    return NextResponse.json(withOptions ?? product)
  } catch (error) {
    console.error("Update product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE product
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    
    // Delete all stock items first (cascade should handle this but let's be explicit)
    await prisma.productStock.deleteMany({
      where: { productId: id }
    })
    
    await prisma.product.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete product error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
