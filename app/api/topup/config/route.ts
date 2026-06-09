import { NextResponse } from "next/server"
import { getSiteSettings } from "@/lib/get-site-settings"
import { getAngpaoMinTopup } from "@/lib/topup-limits"

/** ตั้งค่าเติมเงินสำหรับหน้าผู้ใช้ (ไม่มีข้อมูลลับ) */
export async function GET() {
  try {
    const s = await getSiteSettings()
    return NextResponse.json({
      minTopup: s.minTopup,
      angpaoMinTopup: getAngpaoMinTopup(s.minTopup),
      maxTopup: s.maxTopup,
      angpaoEnabled: s.angpaoEnabled,
      angpaoAutoApprove: s.angpaoAutoApprove,
      promptPayNumber: s.promptPayNumber,
      promptPayName: s.promptPayName,
    })
  } catch (error) {
    console.error("Topup config GET error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
