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

    const existing = await prisma.hwidProgram.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: "Not found" }, { status: 404 })
    }

    const apiKey =
      body.apiKey === "••••••••" || body.apiKey === undefined
        ? existing.apiKey
        : body.apiKey?.trim() || null

    const program = await prisma.hwidProgram.update({
      where: { id },
      data: {
        name: body.name !== undefined ? String(body.name).trim() : undefined,
        price: body.price !== undefined ? Number(body.price) : undefined,
        productId: body.productId !== undefined ? body.productId || null : undefined,
        apiEndpoint:
          body.apiEndpoint !== undefined ? body.apiEndpoint?.trim() || null : undefined,
        apiKey,
        apiKeyHeader:
          body.apiKeyHeader !== undefined
            ? body.apiKeyHeader?.trim() || "Authorization"
            : undefined,
        licenseKeyField:
          body.licenseKeyField !== undefined
            ? body.licenseKeyField?.trim() || "license"
            : undefined,
        sortOrder: body.sortOrder !== undefined ? Number(body.sortOrder) : undefined,
        isActive: body.isActive !== undefined ? Boolean(body.isActive) : undefined,
      },
    })

    return NextResponse.json({
      ...program,
      apiKey: program.apiKey ? "••••••••" : null,
    })
  } catch (error) {
    console.error("Admin update HWID program error:", error)
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
    await prisma.hwidProgram.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Admin delete HWID program error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
