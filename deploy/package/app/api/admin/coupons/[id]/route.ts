import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// PUT update coupon
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const coupon = await prisma.coupon.update({
      where: { id },
      data: {
        ...(body.code !== undefined && { code: body.code.toUpperCase() }),
        ...(body.type !== undefined && { type: body.type }),
        ...(body.value !== undefined && { value: parseFloat(body.value) }),
        ...(body.minPurchase !== undefined && { minPurchase: parseFloat(body.minPurchase) }),
        ...(body.maxDiscount !== undefined && { maxDiscount: body.maxDiscount ? parseFloat(body.maxDiscount) : null }),
        ...(body.usageLimit !== undefined && { usageLimit: body.usageLimit ? parseInt(body.usageLimit) : null }),
        ...(body.startDate !== undefined && { startDate: new Date(body.startDate) }),
        ...(body.endDate !== undefined && { endDate: body.endDate ? new Date(body.endDate) : null }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    })

    return NextResponse.json(coupon)
  } catch (error) {
    console.error("Update coupon error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE coupon
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Check if coupon has been used
    const usageCount = await prisma.couponUsage.count({
      where: { couponId: id },
    })

    if (usageCount > 0) {
      return NextResponse.json({ error: "ไม่สามารถลบคูปองที่ถูกใช้แล้วได้" }, { status: 400 })
    }

    await prisma.coupon.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete coupon error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
