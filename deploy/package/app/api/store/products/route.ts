import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { toStoreProductCardData } from "@/lib/store-product-serializer"

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
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
      orderBy: [{ isHot: "desc" }, { createdAt: "desc" }],
    })

    return NextResponse.json({
      products: products.map((product) =>
        toStoreProductCardData(
          product,
          product.isUnlimited ? 999 : product.productStock.length,
          product._count.orders
        )
      ),
    })
  } catch (error) {
    console.error("Store products API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
