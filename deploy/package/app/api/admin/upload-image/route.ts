import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { saveProductImageUpload } from "@/lib/save-product-upload"

function isAdmin(session: Awaited<ReturnType<typeof auth>>) {
  return (
    !!session?.user &&
    ((session.user as { role?: string }).role || "").toLowerCase() === "admin"
  )
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!isAdmin(session)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await req.formData()
    const file = formData.get("file")

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    const url = await saveProductImageUpload(file)
    return NextResponse.json({ url })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Upload failed"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
