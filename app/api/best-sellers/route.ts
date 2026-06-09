import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { toStoreProductCardData } from "@/lib/store-product-serializer"

const DEFAULT_LIMIT = 3

const productSelect = {
  id: true,
  name: true,
  description: true,
  price: true,
  discount: true,
  image: true,
  isUnlimited: true,
  isHot: true,
  badge: true,
  productStock: { where: { status: "AVAILABLE" as const }, select: { id: true } },
  options: { orderBy: { sortOrder: "asc" as const } },
} as const

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      6,
      Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT)
    )

    const soldGroups = await prisma.order.groupBy({
      by: ["productId"],
      where: { status: "SUCCESS" },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
    })

    const soldByProduct = new Map(
      soldGroups.map((group) => [group.productId, group._sum.quantity ?? 0])
    )

    let productIds = soldGroups.slice(0, limit).map((group) => group.productId)

    if (productIds.length < limit) {
      const extras = await prisma.product.findMany({
        where: {
          isActive: true,
          ...(productIds.length > 0 ? { id: { notIn: productIds } } : {}),
        },
        orderBy: [{ isHot: "desc" }, { createdAt: "desc" }],
        take: limit - productIds.length,
        select: { id: true },
      })
      productIds = [...productIds, ...extras.map((product) => product.id)]
    }

    if (productIds.length === 0) {
      return NextResponse.json({ items: [] })
    }

    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, isActive: true },
      select: productSelect,
    })

    const productMap = new Map(products.map((product) => [product.id, product]))

    const items = productIds
      .map((id) => {
        const product = productMap.get(id)
        if (!product) return null

        return toStoreProductCardData(
          product,
          product.isUnlimited ? 999 : product.productStock.length,
          soldByProduct.get(id) ?? 0
        )
      })
      .filter((item): item is NonNullable<typeof item> => item != null)

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Best sellers error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
