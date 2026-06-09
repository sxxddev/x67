import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const programs = await prisma.hwidProgram.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        price: true,
        productId: true,
      },
    })

    return NextResponse.json({ programs })
  } catch (error) {
    console.error("HWID programs error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
