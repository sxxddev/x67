import type { AcBadge } from "./types"

export const PAGE_SIZE = 12
export const LOCAL_CACHE_KEY = "fivem_th_dashboard_v1"

export function formatInt(n: number) {
  return new Intl.NumberFormat("th-TH").format(n)
}

export function badgeStyles(type: string) {
  const map: Record<string, string> = {
    ghostx: "border-violet-500/40 bg-violet-500/15 text-violet-300",
    bt: "border-blue-500/40 bg-blue-500/15 text-blue-300",
    nc: "border-cyan-500/40 bg-cyan-500/15 text-cyan-300",
    crc: "border-orange-500/40 bg-orange-500/15 text-orange-300",
    fini: "border-emerald-500/40 bg-emerald-500/15 text-emerald-300",
    wave: "border-sky-500/40 bg-sky-500/15 text-sky-300",
    launcher: "border-indigo-500/40 bg-indigo-500/15 text-indigo-300",
    "no-ac": "border-white/15 bg-white/5 text-white/50",
    no_ac: "border-white/15 bg-white/5 text-white/50",
  }
  return map[type] || "border-white/20 bg-white/10 text-white/70"
}

export function hashGradient(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  const hues = [280, 200, 330, 160, 25, 340]
  const h1 = hues[h % hues.length]
  const h2 = hues[(h >> 3) % hues.length]
  return `linear-gradient(135deg, hsl(${h1} 65% 38%), hsl(${h2} 60% 28%))`
}

export function normalizeServerIconUrl(icon: string | null | undefined) {
  if (!icon || typeof icon !== "string") return icon ?? null
  const m = icon.match(/\/api\/server-icon\/([^/]+)\/(.+)\.png$/)
  if (m) {
    return `https://servers-frontend.fivem.net/api/servers/icon/${m[1]}/${m[2]}.png`
  }
  return icon
}

export function serverSearchBlob(s: {
  name: string
  sub?: string
  endpoint: string
  badge?: AcBadge
}) {
  return `${s.name} ${s.sub || ""} ${s.endpoint} ${s.badge?.text || ""}`.toLowerCase()
}
