import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)

    // Revenue this month
    const revenueThisMonth = await prisma.order.aggregate({
      _sum: { price: true },
      where: {
        createdAt: { gte: startOfMonth },
        status: "SUCCESS",
      },
    })

    // Revenue last month
    const revenueLastMonth = await prisma.order.aggregate({
      _sum: { price: true },
      where: {
        createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        status: "SUCCESS",
      },
    })

    // Orders this month
    const ordersThisMonth = await prisma.order.count({
      where: { createdAt: { gte: startOfMonth } },
    })

    const ordersLastMonth = await prisma.order.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    })

    // Users this month
    const usersThisMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfMonth } },
    })

    const usersLastMonth = await prisma.user.count({
      where: { createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
    })

    // Total counts
    const totalUsers = await prisma.user.count()
    const totalProducts = await prisma.product.count()
    const totalOrders = await prisma.order.count()

    // Recent orders
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { user: { select: { username: true, name: true } } },
    })

    // Revenue chart data (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    const dailyOrders = await prisma.order.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: "SUCCESS",
      },
      select: { price: true, createdAt: true },
    })

    // Top-up chart data
    const dailyTopups = await prisma.topupTransaction.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo },
        status: "APPROVED",
      },
      select: { amount: true, createdAt: true, method: true },
    })

    const revThisMonth = revenueThisMonth._sum.price || 0
    const revLastMonth = revenueLastMonth._sum.price || 0
    const revenueChange = revLastMonth > 0 ? ((revThisMonth - revLastMonth) / revLastMonth) * 100 : 0
    const ordersChange = ordersLastMonth > 0 ? ((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100 : 0
    const usersChange = usersLastMonth > 0 ? ((usersThisMonth - usersLastMonth) / usersLastMonth) * 100 : 0

    return NextResponse.json({
      revenue: { current: revThisMonth, change: revenueChange },
      orders: { current: ordersThisMonth, change: ordersChange, total: totalOrders },
      users: { current: usersThisMonth, change: usersChange, total: totalUsers },
      products: { total: totalProducts },
      recentOrders: recentOrders.map((o) => ({
        id: o.id,
        productName: o.productName,
        price: o.price,
        status: o.status,
        userName: o.user.username || o.user.name || "Unknown",
        createdAt: o.createdAt,
      })),
      dailyOrders,
      dailyTopups,
    })
  } catch (error) {
    console.error("Admin stats error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
