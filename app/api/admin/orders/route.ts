import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// GET all orders
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { username: true, name: true, email: true } },
      },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error("Admin orders error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
