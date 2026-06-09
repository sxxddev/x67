import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const { getPayload, emptyErrorPayload } = await import(
      "@/lib/fivem-monitor/payload-service.mjs"
    )
    const data = await getPayload()
    return NextResponse.json(data)
  } catch (e) {
    console.error("[fivem/thailand]", e)
    const { emptyErrorPayload } = await import(
      "@/lib/fivem-monitor/payload-service.mjs"
    )
    const message = e instanceof Error ? e.message : String(e)
    return NextResponse.json(emptyErrorPayload(message))
  }
}
