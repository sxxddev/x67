import { NextResponse } from "next/server"
import { getAuthUserId } from "@/lib/auth-user"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        stockItems: {
          select: {
            id: true,
            accountEmail: true,
            accountPass: true,
            accountData: true,
          },
        },
        licenseKeys: {
          select: {
            id: true,
            key: true,
            status: true,
            expiresAt: true,
            hwid: true,
          },
        },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Orders history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
