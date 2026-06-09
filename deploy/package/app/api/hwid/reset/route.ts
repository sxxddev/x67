import { NextRequest, NextResponse } from "next/server"
import { getAuthUserId } from "@/lib/auth-user"
import { callHwidResetApi } from "@/lib/hwid-api-client"
import { resetLicenseHwid } from "@/lib/license-service"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const body = await req.json()
    const programId = String(body.programId ?? "").trim()
    const licenseKey = String(body.licenseKey ?? "").trim()

    if (!programId) {
      return NextResponse.json({ error: "ไม่พบโปรแกรม" }, { status: 400 })
    }
    if (!licenseKey || licenseKey.length < 3) {
      return NextResponse.json({ error: "กรุณากรอก License Key ให้ถูกต้อง" }, { status: 400 })
    }

    const program = await prisma.hwidProgram.findFirst({
      where: { id: programId, isActive: true },
    })

    if (!program) {
      return NextResponse.json({ error: "ไม่พบโปรแกรมนี้" }, { status: 404 })
    }

    const useInternalDb = !program.apiEndpoint?.trim()

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { balance: true },
    })

    if (!user || user.balance < program.price) {
      return NextResponse.json(
        { error: "ยอดเงินไม่เพียงพอ กรุณาเติมเงิน" },
        { status: 400 }
      )
    }

    const log = await prisma.$transaction(async (tx) => {
      const freshUser = await tx.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      })

      if (!freshUser || freshUser.balance < program.price) {
        throw new Error("INSUFFICIENT_BALANCE")
      }

      await tx.user.update({
        where: { id: userId },
        data: { balance: { decrement: program.price } },
      })

      return tx.hwidResetLog.create({
        data: {
          userId,
          programId: program.id,
          licenseKey,
          price: program.price,
          status: "PENDING",
        },
      })
    })

    const apiResult = useInternalDb
      ? await (async () => {
          const result = await resetLicenseHwid({
            key: licenseKey,
            productId: program.productId,
          })
          return result.ok
            ? { ok: true as const, body: "internal-db-reset" }
            : { ok: false as const, error: result.error, body: null }
        })()
      : await callHwidResetApi(
          {
            apiEndpoint: program.apiEndpoint!,
            apiKey: program.apiKey,
            apiKeyHeader: program.apiKeyHeader,
            licenseKeyField: program.licenseKeyField,
          },
          licenseKey
        )

    if (apiResult.ok) {
      await prisma.hwidResetLog.update({
        where: { id: log.id },
        data: {
          status: "SUCCESS",
          apiResponse: apiResult.body ?? null,
          errorMsg: null,
        },
      })

      const balance = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true },
      })

      return NextResponse.json({
        success: true,
        message: "รีเซ็ต HWID สำเร็จ",
        balance: balance?.balance ?? 0,
      })
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { balance: { increment: program.price } },
      })

      await tx.hwidResetLog.update({
        where: { id: log.id },
        data: {
          status: "FAILED",
          apiResponse: apiResult.body ?? null,
          errorMsg: apiResult.error ?? "รีเซ็ตไม่สำเร็จ",
        },
      })
    })

    return NextResponse.json(
      { error: apiResult.error ?? "รีเซ็ต HWID ไม่สำเร็จ — คืนเงินแล้ว" },
      { status: 502 }
    )
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
      return NextResponse.json(
        { error: "ยอดเงินไม่เพียงพอ กรุณาเติมเงิน" },
        { status: 400 }
      )
    }
    console.error("HWID reset error:", error)
    return NextResponse.json({ error: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 })
  }
}
