import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET all coupons
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const coupons = await prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { couponUsage: true, orders: true },
        },
      },
    })

    return NextResponse.json(coupons)
  } catch (error) {
    console.error("Get coupons error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create coupon
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    
    // Check if code already exists
    const existing = await prisma.coupon.findUnique({
      where: { code: body.code.toUpperCase() },
    })

    if (existing) {
      return NextResponse.json({ error: "รหัสคูปองนี้มีอยู่แล้ว" }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
      data: {
        code: body.code.toUpperCase(),
        type: body.type || "PERCENT",
        value: parseFloat(body.value),
        minPurchase: body.minPurchase ? parseFloat(body.minPurchase) : 0,
        maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null,
        usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null,
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : null,
        isActive: body.isActive !== false,
      },
    })

    return NextResponse.json(coupon, { status: 201 })
  } catch (error) {
    console.error("Create coupon error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
