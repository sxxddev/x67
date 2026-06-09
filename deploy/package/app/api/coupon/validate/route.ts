import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAuthUserId } from "@/lib/auth-user"
import { prisma } from "@/lib/prisma"

// POST - Validate coupon code
export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()
    const { code, totalPrice } = body

    if (!code) {
      return NextResponse.json({ error: "กรุณาระบุรหัสคูปอง" }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    })

    if (!coupon) {
      return NextResponse.json({ error: "ไม่พบคูปองนี้" }, { status: 404 })
    }

    // Check if coupon is active
    if (!coupon.isActive) {
      return NextResponse.json({ error: "คูปองนี้ไม่ได้เปิดใช้งาน" }, { status: 400 })
    }

    // Check date validity
    const now = new Date()
    if (coupon.startDate > now) {
      return NextResponse.json({ error: "คูปองนี้ยังไม่เริ่มใช้งาน" }, { status: 400 })
    }
    if (coupon.endDate && coupon.endDate < now) {
      return NextResponse.json({ error: "คูปองนี้หมดอายุแล้ว" }, { status: 400 })
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json({ error: "คูปองนี้ถูกใช้ครบจำนวนแล้ว" }, { status: 400 })
    }

    // Check if user already used this coupon
    const existingUsage = await prisma.couponUsage.findUnique({
      where: {
        userId_couponId: {
          userId,
          couponId: coupon.id,
        },
      },
    })

    if (existingUsage) {
      return NextResponse.json({ error: "คุณใช้คูปองนี้ไปแล้ว" }, { status: 400 })
    }

    // Check minimum purchase
    if (totalPrice && totalPrice < coupon.minPurchase) {
      return NextResponse.json({ 
        error: `ยอดซื้อขั้นต่ำ ฿${coupon.minPurchase}` 
      }, { status: 400 })
    }

    // Calculate discount
    let discount = 0
    if (coupon.type === "PERCENT") {
      discount = (totalPrice || 0) * (coupon.value / 100)
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount
      }
    } else {
      discount = coupon.value
    }

    return NextResponse.json({
      isValid: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        type: coupon.type,
        value: coupon.value,
        minPurchase: coupon.minPurchase,
        maxDiscount: coupon.maxDiscount,
      },
      discount: Math.floor(discount),
    })
  } catch (error) {
    console.error("Validate coupon error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
