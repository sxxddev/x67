import { NextResponse } from "next/server"
import { getAuthUserId } from "@/lib/auth-user"
import { maskLicenseKey } from "@/lib/hwid-api-client"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const logs = await prisma.hwidResetLog.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        program: { select: { name: true } },
      },
    })

    return NextResponse.json({
      items: logs.map((log) => ({
        id: log.id,
        programName: log.program.name,
        licenseKeyMasked: maskLicenseKey(log.licenseKey),
        price: log.price,
        status: log.status,
        errorMsg: log.errorMsg,
        createdAt: log.createdAt.toISOString(),
      })),
    })
  } catch (error) {
    console.error("HWID history error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
