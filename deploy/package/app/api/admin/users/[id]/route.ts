import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// PUT update user
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: {
        ...(body.username !== undefined && { username: body.username }),
        ...(body.email !== undefined && { email: body.email }),
        ...(body.balance !== undefined && { balance: parseFloat(body.balance) }),
        ...(body.role !== undefined && { role: body.role }),
        ...(body.name !== undefined && { name: body.name }),
      },
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        balance: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(user)
  } catch (error) {
    console.error("Update user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE user
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    if (!session?.user || ((session.user as any).role || "").toLowerCase() !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    // Prevent self-deletion using username (since ID was removed from session)
    if ((session.user as any).username === (await prisma.user.findUnique({ where: { id: Number(id) }, select: { username: true } }))?.username) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 })
    }

    await prisma.user.delete({ where: { id: Number(id) } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete user error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
