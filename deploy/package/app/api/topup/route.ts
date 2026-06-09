import { NextRequest, NextResponse } from "next/server"
import { getAuthUserId } from "@/lib/auth-user"
import { prisma } from "@/lib/prisma"
import { redeemAngpaoLink, resolveAngpaoReceiverPhone } from "@/lib/angpao"
import { getSiteSettings } from "@/lib/get-site-settings"
import { approveTopupTransaction } from "@/lib/topup-approve"
import {
  TOPUP_MAX_AMOUNT,
  TOPUP_MIN_AMOUNT,
  getAngpaoMinTopup,
  isValidTopupAmount,
  topupAmountError,
} from "@/lib/topup-limits"

// GET user's topup history
export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const topups = await prisma.topupTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
    })

    return NextResponse.json(topups)
  } catch (error) {
    console.error("Topup history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST create new topup request
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const body = await req.json()

    const { amount, slipImage, method = "PROMPTPAY", angpaoLink } = body
    const topupMethod = String(method).toUpperCase()

    const settings = await getSiteSettings()
    const siteMinTopup = settings.minTopup ?? TOPUP_MIN_AMOUNT
    const maxTopup = settings.maxTopup ?? TOPUP_MAX_AMOUNT
    const minTopup =
      topupMethod === "ANGPAO"
        ? getAngpaoMinTopup(siteMinTopup)
        : siteMinTopup
    const parsedAmount = parseFloat(amount.toString())

    const angpaoAuto =
      topupMethod === "ANGPAO" && settings.angpaoAutoApprove

    if (!angpaoAuto && !isValidTopupAmount(parsedAmount, minTopup, maxTopup)) {
      return NextResponse.json(
        { error: topupAmountError(minTopup, maxTopup) },
        { status: 400 }
      )
    }

    if (topupMethod === "ANGPAO") {
      if (!settings.angpaoEnabled) {
        return NextResponse.json(
          { error: "ช่องทางซองอังเปาปิดใช้งานชั่วคราว" },
          { status: 403 }
        )
      }
      if (!angpaoLink || typeof angpaoLink !== "string" || !angpaoLink.trim()) {
        return NextResponse.json(
          { error: "กรุณาวางลิงก์ซองอังเปา" },
          { status: 400 }
        )
      }
    } else if (!slipImage) {
      return NextResponse.json(
        { error: "กรุณาอัปโหลดสลิปการโอนเงิน" },
        { status: 400 }
      )
    }

    const pendingTopup = await prisma.topupTransaction.findFirst({
      where: {
        userId,
        status: "PENDING",
      },
    })

    if (pendingTopup) {
      return NextResponse.json(
        { error: "คุณมีรายการเติมเงินที่รอดำเนินการอยู่แล้ว" },
        { status: 400 }
      )
    }

    const link = topupMethod === "ANGPAO" ? angpaoLink.trim() : undefined

    if (topupMethod === "ANGPAO" && settings.angpaoAutoApprove) {
      const duplicateAngpao = await prisma.topupTransaction.findFirst({
        where: {
          method: "ANGPAO",
          note: link,
          status: { in: ["APPROVED", "PENDING"] },
        },
      })

      if (duplicateAngpao) {
        return NextResponse.json(
          { error: "ซองอังเปานี้ถูกใช้ไปแล้ว" },
          { status: 400 }
        )
      }

      const receiverPhone = resolveAngpaoReceiverPhone(
        settings.angpaoReceiverPhone
      )

      const redeem = await redeemAngpaoLink({
        link: link!,
        amount: parsedAmount || 0,
        userId,
        receiverPhone,
        apiEndpoint: settings.angpaoApiEndpoint,
        apiKey: settings.angpaoApiKey,
        allowedHosts: settings.angpaoAllowedHosts,
        requireApi: true,
      })

      if (!redeem.ok) {
        return NextResponse.json({ error: redeem.error }, { status: 400 })
      }

      const creditAmount = redeem.redeemedAmount ?? parsedAmount

      if (!isValidTopupAmount(creditAmount, minTopup, maxTopup)) {
        return NextResponse.json(
          {
            error: `ยอดในซอง (${creditAmount} บาท) ไม่อยู่ในช่วงที่อนุญาต (${minTopup}-${maxTopup} บาท)`,
          },
          { status: 400 }
        )
      }

      const topup = await prisma.topupTransaction.create({
        data: {
          userId,
          amount: creditAmount,
          method: "ANGPAO",
          note: link,
          status: "PENDING",
        },
      })

      await approveTopupTransaction(topup.id, {
        adminNote: `อนุมัติอัตโนมัติ (Vornyx) — ${creditAmount} บาท`,
      })

      const approved = await prisma.topupTransaction.findUnique({
        where: { id: topup.id },
      })

      return NextResponse.json(
        {
          ...approved,
          autoApproved: true,
          redeemedAmount: creditAmount,
          message: `เติมเงินสำเร็จ ${creditAmount.toLocaleString()} บาท — รับซองอังเปาอัตโนมัติ`,
        },
        { status: 201 }
      )
    }

    const topup = await prisma.topupTransaction.create({
      data: {
        userId,
        amount: parsedAmount,
        method: topupMethod === "ANGPAO" ? "ANGPAO" : "PROMPTPAY",
        slipImage: topupMethod === "ANGPAO" ? null : slipImage,
        note: link,
        status: "PENDING",
      },
    })

    return NextResponse.json(
      {
        ...topup,
        autoApproved: false,
        message:
          topupMethod === "ANGPAO"
            ? "ส่งคำขอแล้ว — รอแอดมินตรวจสอบ"
            : undefined,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error("Create topup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
