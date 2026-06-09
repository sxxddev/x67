import { NextResponse } from "next/server"
import { getAuthUserId } from "@/lib/auth-user"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        image: true,
        balance: true,
        points: true,
        role: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const [orderCount, orderSum] = await Promise.all([
      prisma.order.count({
        where: { userId, status: "SUCCESS" },
      }),
      prisma.order.aggregate({
        where: { userId, status: "SUCCESS" },
        _sum: { totalPrice: true },
      }),
    ])

    return NextResponse.json({
      user,
      stats: {
        orderCount,
        totalSpent: orderSum._sum.totalPrice ?? 0,
      },
    })
  } catch (error) {
    console.error("Profile API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
