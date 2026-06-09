import { NextRequest, NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import {
  EXT_TO_MIME,
  getProductUploadFilePath,
  resolveUploadFilename,
} from "@/lib/save-product-upload"

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  const { filename: raw } = await params
  const filename = resolveUploadFilename(raw)
  if (!filename) {
    return new NextResponse("Not found", { status: 404 })
  }

  const ext = path.extname(filename).toLowerCase()
  const contentType = EXT_TO_MIME[ext]
  if (!contentType) {
    return new NextResponse("Not found", { status: 404 })
  }

  try {
    const data = await fs.readFile(getProductUploadFilePath(filename))
    return new NextResponse(data, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400",
      },
    })
  } catch {
    try {
      const legacy = await fs.readFile(
        path.join(process.cwd(), "public", "uploads", "products", filename)
      )
      return new NextResponse(legacy, {
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=86400",
        },
      })
    } catch {
      return new NextResponse("Not found", { status: 404 })
    }
  }
}
