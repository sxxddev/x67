import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return (
    session?.user &&
    ((session.user as { role?: string }).role ?? "").toLowerCase() === "admin"
  )
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const body = await req.json()

    const data: {
      status?: "ACTIVE" | "REVOKED" | "EXPIRED"
      hwid?: string | null
      note?: string | null
      expiresAt?: Date | null
    } = {}

    if (body.status === "ACTIVE" || body.status === "REVOKED" || body.status === "EXPIRED") {
      data.status = body.status
    }
    if (body.hwid === null || body.hwid === "") {
      data.hwid = null
    }
    if (body.note !== undefined) {
      data.note = body.note ? String(body.note).trim() : null
    }
    if (body.expiresAt !== undefined) {
      data.expiresAt = body.expiresAt ? new Date(body.expiresAt) : null
    }

    const updated = await prisma.licenseKey.update({
      where: { id },
      data,
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, username: true } },
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Admin license key PATCH error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    await prisma.licenseKey.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin license key DELETE error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params
    const row = await prisma.licenseKey.findUnique({
      where: { id },
      include: {
        product: { select: { id: true, name: true } },
        user: { select: { id: true, username: true, email: true } },
        order: { select: { id: true, createdAt: true } },
      },
    })

    if (!row) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    return NextResponse.json(row)
  } catch (error) {
    console.error("Admin license key GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
