import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const categoryId = searchParams.get("categoryId")
    const isHot = searchParams.get("isHot") === "true"
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!) : undefined

    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(categoryId && { categoryId }),
        ...(isHot && { isHot: true }),
      },
      include: {
        category: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    })

    // Get stock count for each product
    const productsWithStock = await Promise.all(
      products.map(async (product) => {
        const stockCount = await prisma.productStock.count({
          where: {
            productId: product.id,
            status: "AVAILABLE",
          },
        })
        return {
          ...product,
          stockCount,
        }
      })
    )

    return NextResponse.json(productsWithStock)
  } catch (error) {
    console.error("Products error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
