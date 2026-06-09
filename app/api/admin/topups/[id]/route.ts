import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { approveTopupTransaction } from "@/lib/topup-approve"

// PUT - Approve or Reject topup
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
    const topupId = parseInt(id)
    const body = await req.json()
    const { action, adminNote } = body // action: "approve" | "reject"
    const adminId = (session.user as any).id

    const topup = await prisma.topupTransaction.findUnique({
      where: { id: topupId },
    })

    if (!topup) {
      return NextResponse.json({ error: "Topup not found" }, { status: 404 })
    }

    if (topup.status !== "PENDING") {
      return NextResponse.json({ error: "Topup already processed" }, { status: 400 })
    }

    if (action === "approve") {
      await approveTopupTransaction(topupId, {
        adminId,
        adminNote,
      })

      return NextResponse.json({ success: true, message: "อนุมัติการเติมเงินสำเร็จ" })
    } else if (action === "reject") {
      await prisma.topupTransaction.update({
        where: { id: topupId },
        data: {
          status: "REJECTED",
          adminNote,
          approvedBy: adminId,
          approvedAt: new Date(),
        },
      })

      return NextResponse.json({ success: true, message: "ปฏิเสธการเติมเงินสำเร็จ" })
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  } catch (error) {
    console.error("Process topup error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
