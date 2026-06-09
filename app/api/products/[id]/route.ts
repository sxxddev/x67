import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { resolveProductImageUrl } from "@/lib/product-image"
import { serializeProductOption } from "@/lib/product-options"

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id, isActive: true },
      include: {
        category: true,
        options: { orderBy: { sortOrder: "asc" } },
        _count: { select: { orders: true } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    const stockCount = await prisma.productStock.count({
      where: {
        productId: id,
        status: "AVAILABLE",
      },
    })

    const { _count, options, ...rest } = product

    return NextResponse.json({
      ...rest,
      image: resolveProductImageUrl(rest.image),
      stockCount,
      soldCount: _count.orders,
      options: options.map(serializeProductOption),
    })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
