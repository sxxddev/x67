import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

// GET all users
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        image: true,
        balance: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: { select: { orders: true, topups: true } },
      },
    })

    return NextResponse.json(users)
  } catch (error) {
    console.error("Admin users error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
