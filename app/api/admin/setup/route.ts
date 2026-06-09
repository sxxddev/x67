import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

// One-time setup: Set a user's role to admin
// Usage: POST /api/admin/setup with { "username": "yourname", "secret": "your-nextauth-secret" }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, secret } = body

    // Verify with NEXTAUTH_SECRET for security
    const setupSecret =
      process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET
    if (!setupSecret || secret !== setupSecret) {
      return NextResponse.json({ error: "Invalid secret" }, { status: 401 })
    }

    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { username },
      data: { role: "ADMIN" },
      select: { id: true, username: true, role: true },
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    console.error("Setup error:", error)
    return NextResponse.json({ error: "User not found or internal error" }, { status: 500 })
  }
}
