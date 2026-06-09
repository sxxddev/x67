import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { prisma } from "@/lib/prisma"
import { getAuthUserId } from "@/lib/auth-user"

export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthUserId()
    if (!userId) {
      return NextResponse.json({ message: "กรุณาเข้าสู่ระบบ" }, { status: 401 })
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json()

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ message: "กรุณากรอกข้อมูลให้ครบ" }, { status: 400 })
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร" },
        { status: 400 }
      )
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { message: "รหัสผ่านใหม่ไม่ตรงกัน" },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true },
    })

    if (!user?.password) {
      return NextResponse.json(
        { message: "บัญชีนี้ไม่รองรับการเปลี่ยนรหัสผ่าน" },
        { status: 400 }
      )
    }

    const valid = await bcrypt.compare(currentPassword, user.password)
    if (!valid) {
      return NextResponse.json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashed },
    })

    return NextResponse.json({ message: "บันทึกรหัสผ่านใหม่สำเร็จ" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ message: "เกิดข้อผิดพลาด กรุณาลองใหม่" }, { status: 500 })
  }
}
