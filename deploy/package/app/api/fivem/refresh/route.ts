import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const mod = await import("@/lib/fivem-monitor/payload-service.mjs")
    mod.resetPayloadCache()
    const data = await mod.buildPayload()
    return NextResponse.json(data)
  } catch (e) {
    console.error("[fivem/refresh]", e)
    const mod = await import("@/lib/fivem-monitor/payload-service.mjs")
    const message = e instanceof Error ? e.message : String(e)
    try {
      const fs = await import("fs")
      const path = await import("path")
      const cachePath = path.join(process.cwd(), "fivem-ac-monitor/fivem-cache.json")
      if (fs.existsSync(cachePath)) {
        const disk = JSON.parse(fs.readFileSync(cachePath, "utf8"))
        return NextResponse.json({
          ...disk,
          stale: true,
          error: message,
        })
      }
    } catch {
      /* ignore */
    }
    return NextResponse.json(mod.emptyErrorPayload(message))
  }
}
