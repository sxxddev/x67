import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { toStoreProductCardData } from "@/lib/store-product-serializer"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> }
) {
  try {
    const { categoryId } = await params

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            products: { where: { isActive: true } },
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const products = await prisma.product.findMany({
      where: { categoryId, isActive: true },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        discount: true,
        image: true,
        isUnlimited: true,
        isHot: true,
        badge: true,
        productStock: { where: { status: "AVAILABLE" }, select: { id: true } },
        options: { orderBy: { sortOrder: "asc" } },
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      category: {
        id: category.id,
        name: category.name,
        image: category.image,
        isFeatured: category.isFeatured,
        productCount: category._count.products,
      },
      products: products.map((p) =>
        toStoreProductCardData(
          p,
          p.isUnlimited ? 999 : p.productStock.length,
          p._count.orders
        )
      ),
    })
  } catch (error) {
    console.error("Store category API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
