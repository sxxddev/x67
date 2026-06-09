import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcrypt"

export async function POST(req: Request) {
  try {
    const { username, email, password } = await req.json()

    if (!username || !email || !password) {
      return NextResponse.json(
        { message: "กรุณากรอกข้อมูลให้ครบถ้วน" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { email },
        ],
      },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "ชื่อผู้ใช้หรืออีเมลนี้ถูกใช้งานแล้ว" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        balance: 0,
        role: "USER",
      },
    })

    return NextResponse.json(
      { message: "สมัครสมาชิกสำเร็จ", user: { id: user.id, username: user.username } },
      { status: 201 }
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { message: "เกิดข้อผิดพลาดในการสมัครสมาชิก" },
      { status: 500 }
    )
  }
}
