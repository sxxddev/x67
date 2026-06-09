import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { getAuthUserId } from "@/lib/auth-user"
import { orderProductImageSnapshot } from "@/lib/order-snapshot"
import { createLicenseKeysForOrder } from "@/lib/license-service"
import { prisma } from "@/lib/prisma"
import { applyProductDiscount } from "@/lib/product-options"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const body = await req.json()
    const { productId, quantity = 1, couponCode, optionId } = body

    if (quantity < 1 || quantity > 5) {
      return NextResponse.json({ error: "จำนวนสินค้าต้องอยู่ระหว่าง 1-5 ชิ้น" }, { status: 400 })
    }

    // Get product
    const product = await prisma.product.findUnique({
      where: { id: productId, isActive: true },
      include: {
        options: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
      },
    })

    if (!product) {
      return NextResponse.json({ error: "ไม่พบสินค้านี้" }, { status: 404 })
    }

    const activeOptions = product.options
    const hasOptions = activeOptions.length > 0

    let selectedOption: (typeof activeOptions)[number] | null = null
    if (hasOptions) {
      if (!optionId) {
        return NextResponse.json({ error: "กรุณาเลือกตัวเลือกสินค้า" }, { status: 400 })
      }
      selectedOption = activeOptions.find((o) => o.id === optionId) ?? null
      if (!selectedOption) {
        return NextResponse.json({ error: "ตัวเลือกไม่ถูกต้อง" }, { status: 400 })
      }
      if (selectedOption.stockCount < quantity) {
        return NextResponse.json({ error: "ตัวเลือกนี้ไม่เพียงพอ" }, { status: 400 })
      }
    }

    // Check stock availability (license-key products auto-generate keys — no stock needed)
    let stockItems: { id: string; accountEmail: string; accountPass: string; accountData: string | null }[] = []
    
    if (!product.isUnlimited && !product.generatesLicenseKey) {
      stockItems = await prisma.productStock.findMany({
        where: {
          productId,
          status: "AVAILABLE",
        },
        take: quantity,
        select: {
          id: true,
          accountEmail: true,
          accountPass: true,
          accountData: true,
        },
      })

      if (stockItems.length < quantity) {
        return NextResponse.json({ error: "สินค้าไม่เพียงพอ" }, { status: 400 })
      }
    }

    // Calculate price
    const basePrice = selectedOption ? selectedOption.price : product.price
    let unitPrice = applyProductDiscount(basePrice, product.discount)
    
    let totalPrice = unitPrice * quantity
    let couponDiscount = 0
    let couponId = null

    // Validate coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      })

      if (coupon && coupon.isActive) {
        const now = new Date()
        const isValidDate = coupon.startDate <= now && (!coupon.endDate || coupon.endDate >= now)
        const hasUsageLeft = !coupon.usageLimit || coupon.usedCount < coupon.usageLimit

        // Check if user already used this coupon
        const existingUsage = await prisma.couponUsage.findUnique({
          where: {
            userId_couponId: { userId, couponId: coupon.id },
          },
        })

        if (isValidDate && hasUsageLeft && !existingUsage && totalPrice >= coupon.minPurchase) {
          if (coupon.type === "PERCENT") {
            couponDiscount = totalPrice * (coupon.value / 100)
            if (coupon.maxDiscount && couponDiscount > coupon.maxDiscount) {
              couponDiscount = coupon.maxDiscount
            }
          } else {
            couponDiscount = coupon.value
          }
          couponDiscount = Math.floor(couponDiscount)
          couponId = coupon.id
        }
      }
    }

    const finalPrice = totalPrice - couponDiscount

    // Get user balance
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    })

    if (!user || user.balance < finalPrice) {
      return NextResponse.json({ error: "ยอดเงินไม่เพียงพอ กรุณาเติมเงิน" }, { status: 400 })
    }

    // Calculate points earned
    const pointsEarned = product.pointsEarn * quantity

    const orderName = selectedOption
      ? `${product.name} (${selectedOption.label})`
      : product.name

    // Process purchase in transaction
    let generatedLicenseKeys: string[] = []

    const order = await prisma.$transaction(async (tx) => {
      // Deduct balance
      await tx.user.update({
        where: { id: userId },
        data: {
          balance: { decrement: finalPrice },
          points: { increment: pointsEarned },
        },
      })

      // Create order
      const newOrder = await tx.order.create({
        data: {
          userId,
          productId,
          productName: orderName,
          productImage: orderProductImageSnapshot(product.image),
          price: unitPrice,
          quantity,
          totalPrice: finalPrice,
          pointsEarned,
          pointsUsed: 0,
          couponId,
          couponDiscount,
          productOptionId: selectedOption?.id ?? null,
          optionLabel: selectedOption?.label ?? null,
          status: "SUCCESS",
        },
      })

      if (selectedOption) {
        await tx.productOption.update({
          where: { id: selectedOption.id },
          data: { stockCount: { decrement: quantity } },
        })
      }

      // Update stock if not unlimited
      if (!product.isUnlimited && stockItems.length > 0) {
        await tx.productStock.updateMany({
          where: {
            id: { in: stockItems.map((s) => s.id) },
          },
          data: {
            status: "SOLD",
            orderId: newOrder.id,
          },
        })
      }

      // Record coupon usage if used
      if (couponId) {
        await tx.couponUsage.create({
          data: {
            userId,
            couponId,
            orderId: newOrder.id,
          },
        })
        await tx.coupon.update({
          where: { id: couponId },
          data: { usedCount: { increment: 1 } },
        })
      }

      // Record points history if earned
      if (pointsEarned > 0) {
        await tx.pointsHistory.create({
          data: {
            userId,
            points: pointsEarned,
            type: "EARN",
            description: `ได้รับแต้มจากการซื้อ ${product.name}`,
            orderId: newOrder.id,
          },
        })
      }

      if (product.generatesLicenseKey) {
        generatedLicenseKeys = await createLicenseKeysForOrder(tx, {
          productId,
          userId,
          orderId: newOrder.id,
          quantity,
          durationDays: selectedOption?.days ?? null,
        })
      }

      return newOrder
    })

    // Return order with stock items
    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        productName: order.productName,
        quantity: order.quantity,
        totalPrice: order.totalPrice,
        pointsEarned: order.pointsEarned,
        couponDiscount: order.couponDiscount,
        status: order.status,
      },
      stockItems: product.isUnlimited || product.generatesLicenseKey ? [] : stockItems.map((s) => ({
        email: s.accountEmail,
        password: s.accountPass,
        data: s.accountData,
      })),
      licenseKeys: generatedLicenseKeys,
    })
  } catch (error) {
    console.error("Purchase error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสั่งซื้อ" }, { status: 500 })
  }
}
