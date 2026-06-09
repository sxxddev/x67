import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { maskBuyerName } from "@/lib/mask-username"

const DEFAULT_LIMIT = 20

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Math.min(
      40,
      Math.max(1, Number(searchParams.get("limit") ?? DEFAULT_LIMIT) || DEFAULT_LIMIT)
    )

    const orders = await prisma.order.findMany({
      where: { status: "SUCCESS" },
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        productName: true,
        productImage: true,
        createdAt: true,
        product: {
          select: { image: true },
        },
        user: {
          select: {
            username: true,
            name: true,
          },
        },
      },
    })

    const items = orders.map((order) => ({
      id: order.id,
      productName: order.productName,
      productImage: order.product.image ?? order.productImage,
      buyerMasked: maskBuyerName(order.user.username ?? order.user.name),
      purchasedAt: order.createdAt.toISOString(),
    }))

    return NextResponse.json({ items })
  } catch (error) {
    console.error("Recent purchases error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
