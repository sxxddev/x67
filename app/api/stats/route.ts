import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [users, products, stockItems, soldAgg] = await Promise.all([
      prisma.user.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.productStock.count({ where: { status: "AVAILABLE" } }),
      prisma.order.aggregate({
        where: { status: "SUCCESS" },
        _sum: { quantity: true },
      }),
    ])

    return NextResponse.json({
      users,
      products,
      stock: stockItems,
      sold: soldAgg._sum.quantity ?? 0,
    })
  } catch (error) {
    console.error("Public stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
