"use client"

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react"
import {
  Copy,
  Gamepad2,
  LayoutGrid,
  List,
  Loader2,
  Play,
  RefreshCw,
  Search,
  Server,
  Shield,
  Signal,
  Users,
} from "lucide-react"
import { SITE_BRAND_NAME } from "@/lib/brand"
import { bw } from "@/lib/bw-theme"
import {
  badgeStyles,
  formatInt,
  hashGradient,
  LOCAL_CACHE_KEY,
  normalizeServerIconUrl,
  PAGE_SIZE,
  serverSearchBlob,
} from "@/lib/fivem-monitor/client-utils"
import type { FiveMPayload, FiveMServer } from "@/lib/fivem-monitor/types"
import { cn } from "@/lib/utils"

const FETCH_MS = 28000

function StatusDot({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]",
        className
      )}
    />
  )
}

function StatCard({
  icon: Icon,
  value,
  label,
  iconClass,
}: {
  icon: typeof Server
  value: string
  label: string
  iconClass: string
}) {
  return (
    <div className={cn(bw.panel, "flex items-center gap-4 p-4")}>
      <div
        className={cn(
          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10",
          iconClass
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <div className="text-2xl font-bold tabular-nums text-white">{value}</div>
        <div className="text-xs text-white/50">{label}</div>
      </div>
    </div>
  )
}

function ServerRow({
  server,
  rank,
  onCopy,
}: {
  server: FiveMServer
  rank: number
  onCopy: (text: string) => void
}) {
  const [imgFailed, setImgFailed] = useState(false)
  const grad = hashGradient(server.endpoint)
  const badgeClass = badgeStyles(server.badge?.type || "no-ac")

  return (
    <div
      className={cn(
        bw.panel,
        "flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:gap-4 sm:p-4"
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        <div className="w-6 shrink-0 text-center text-sm font-medium tabular-nums text-white/35">
          {rank}
        </div>
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10"
          style={{ background: grad }}
        >
          {server.icon && !imgFailed ? (
            <img
              src={server.icon}
              alt=""
              className="h-full w-full object-cover"
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
            />
          ) : (
            <span className="text-xs font-bold uppercase text-white/90">
              {server.endpoint.slice(0, 2)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-white sm:text-base">
            {server.name}
          </div>
          {server.sub ? (
            <p className="mt-0.5 line-clamp-2 text-xs text-white/45">
              ➔ {server.sub}
            </p>
          ) : null}
          <span
            className={cn(
              "mt-1.5 inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
              badgeClass
            )}
          >
            {server.badge?.text || "ไม่พบ Anti-Cheat"}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 pl-9 sm:pl-0">
        <div className="text-right tabular-nums">
          <span className="text-base font-semibold text-white">
            {formatInt(server.players)}
          </span>
          <span className="text-sm text-white/40">
            {" "}
            / {formatInt(server.maxPlayers)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            title="คัดลอกลิงก์เข้าเซิร์ฟเวอร์"
            onClick={() => onCopy(server.connect)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/60 transition hover:bg-white/10 hover:text-white"
          >
            <Copy className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="เปิด FiveM / เข้าเซิร์ฟเวอร์"
            onClick={() =>
              window.open(server.connect, "_blank", "noopener,noreferrer")
            }
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/30 bg-cyan-400/15 text-cyan-300 transition hover:bg-cyan-400/25 hover:text-cyan-200"
          >
            <Play className="h-4 w-4 fill-current" />
          </button>
        </div>
      </div>
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number
  totalPages: number
  onChange: (page: number) => void
}) {
  if (totalPages <= 1) return null

  const maxButtons = 7
  let start = Math.max(1, currentPage - 3)
  let end = Math.min(totalPages, start + maxButtons - 1)
  start = Math.max(1, end - maxButtons + 1)

  const pages: (number | "dots")[] = []
  if (start > 1) {
    pages.push(1)
    if (start > 2) pages.push("dots")
  }
  for (let p = start; p <= end; p++) pages.push(p)
  if (end < totalPages) {
    if (end < totalPages - 1) pages.push("dots")
    pages.push(totalPages)
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-1.5 pt-4">
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onChange(currentPage - 1)}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10 disabled:opacity-40"
      >
        ก่อนหน้า
      </button>
      {pages.map((p, i) =>
        p === "dots" ? (
          <span key={`dots-${i}`} className="px-1 text-white/30">
            …
          </span>
        ) : (
          <button
            key={p}
            type="button"
            onClick={() => onChange(p)}
            className={cn(
              "min-w-[2rem] rounded-lg border px-2 py-1.5 text-xs tabular-nums transition",
              p === currentPage
                ? "border-cyan-400/50 bg-cyan-400/15 text-cyan-300"
                : "border-white/10 text-white/60 hover:bg-white/10"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onChange(currentPage + 1)}
        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/10 disabled:opacity-40"
      >
        ถัดไป
      </button>
    </div>
  )
}

export function FivemServersDashboard() {
  const [allServers, setAllServers] = useState<FiveMServer[]>([])
  const [stats, setStats] = useState<FiveMPayload["stats"]>({
    totalServers: 0,
    totalPlayers: 0,
    activeServers: 0,
    gta5Instances: 0,
  })
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [viewMode, setViewMode] = useState<"list" | "grid">("list")
  const [sortByPlayers, setSortByPlayers] = useState(true)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [cacheWarning, setCacheWarning] = useState("")
  const [lastUpdate, setLastUpdate] = useState("")

  const applyPayload = useCallback((data: FiveMPayload) => {
    setCacheWarning(data.cacheWarning || "")
    setError(data.error || "")
    const servers = (data.servers || []).map((s) => ({
      ...s,
      icon: normalizeServerIconUrl(s.icon) ?? null,
    }))
    setAllServers(servers)
    setStats(
      data.stats || {
        totalServers: 0,
        totalPlayers: 0,
        activeServers: 0,
        gta5Instances: 0,
      }
    )
    setLastUpdate(
      new Date().toLocaleTimeString("th-TH", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    )
  }, [])

  const loadData = useCallback(
    async (forceRefresh = false) => {
      setError("")
      setCacheWarning("")

      let cached: FiveMPayload | null = null
      if (!forceRefresh) {
        try {
          const raw = localStorage.getItem(LOCAL_CACHE_KEY)
          if (raw) cached = JSON.parse(raw) as FiveMPayload
        } catch {
          /* ignore */
        }
      }

      const hasLocal =
        cached && Array.isArray(cached.servers) && cached.servers.length > 0
      if (hasLocal) {
        applyPayload(cached!)
        setLoading(false)
      } else if (forceRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const abortCtl = new AbortController()
      const abortTimer = setTimeout(() => abortCtl.abort(), FETCH_MS)

      try {
        const url = forceRefresh
          ? `/api/fivem/refresh?t=${Date.now()}`
          : "/api/fivem/thailand"
        const res = await fetch(url, { signal: abortCtl.signal })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const data = (await res.json()) as FiveMPayload
        try {
          localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(data))
        } catch {
          /* ignore */
        }
        applyPayload(data)
      } catch (e) {
        const aborted =
          e instanceof Error &&
          (e.name === "AbortError" || (e as { code?: number }).code === 20)
        if (aborted) {
          if (!hasLocal) {
            setError("โหลดนานเกินไป — ลองกดรีเฟรชหรือตรวจสอบเครือข่าย")
          } else {
            setCacheWarning(
              "อัปเดตล่าสุดไม่สำเร็จ — แสดงข้อมูลจากแคชเครื่อง"
            )
          }
        } else if (!hasLocal) {
          setError(
            e instanceof Error
              ? e.message
              : "โหลดข้อมูลไม่สำเร็จ — ตรวจสอบเครือข่ายหรือว่า FiveM API ถูกบล็อก"
          )
        }
      } finally {
        clearTimeout(abortTimer)
        setLoading(false)
        setRefreshing(false)
      }
    },
    [applyPayload]
  )

  useEffect(() => {
    loadData(false)
  }, [loadData])

  const filtered = useMemo(() => {
    let list = allServers.slice()
    const q = search.trim().toLowerCase()
    if (q) {
      list = list.filter((s) => serverSearchBlob(s).includes(q))
    }
    if (sortByPlayers) {
      list.sort((a, b) => b.players - a.players)
    }
    return list
  }, [allServers, search, sortByPlayers])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const pageRows = filtered.slice(
    (safePage - 1) * PAGE_SIZE,
    safePage * PAGE_SIZE
  )

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      window.prompt("คัดลอกลิงก์", text)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadData(true)
  }

  return (
    <div className="space-y-6">
      <div className={cn(bw.panel, "relative overflow-hidden p-5 sm:p-6")}>
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-cyan-300">
              <Gamepad2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white sm:text-2xl">
                FiveM Servers
              </h1>
              <p className="text-sm text-white/50">
                รายชื่อเซิร์ฟเวอร์ FiveM ไทย BY :{" "}
                {SITE_BRAND_NAME.toUpperCase()}
              </p>
            </div>
          </div>
          <RefreshButton refreshing={refreshing} onClick={handleRefresh} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Server}
          value={formatInt(stats.totalServers)}
          label="เซิร์ฟเวอร์"
          iconClass="bg-violet-500/15 text-violet-300"
        />
        <StatCard
          icon={Users}
          value={formatInt(stats.totalPlayers)}
          label="ผู้เล่นทั้งหมด"
          iconClass="bg-blue-500/15 text-blue-300"
        />
        <StatCard
          icon={Signal}
          value={formatInt(stats.activeServers)}
          label="กำลังเปิด"
          iconClass="bg-emerald-500/15 text-emerald-300"
        />
        <StatCard
          icon={Gamepad2}
          value={formatInt(stats.gta5Instances)}
          label="GTA5"
          iconClass="bg-amber-500/15 text-amber-300"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className={cn(bw.panel, "flex items-center justify-between gap-4 p-5")}>
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Server className="h-4 w-4 text-cyan-400" />
              ระบบตรวจสอบเซิร์ฟเวอร์
            </h3>
            <p className="mt-1 text-sm text-white/50">
              แสดงจำนวนผู้เล่นและสถานะของเซิร์ฟเวอร์ FiveM ทั่วประเทศไทยแบบเรียลไทม์
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <StatusDot /> Online
          </div>
        </div>
        <div className={cn(bw.panel, "flex items-center justify-between gap-4 p-5")}>
          <div>
            <h3 className="flex items-center gap-2 text-base font-semibold text-white">
              <Shield className="h-4 w-4 text-cyan-400" />
              วิเคราะห์ระบบป้องกัน
            </h3>
            <p className="mt-1 text-sm text-white/50">
              ตรวจสอบและแจ้งเตือนระบบกันโปรของแต่ละเซิร์ฟเวอร์ เพื่อเพิ่มความมั่นใจ
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300">
            <StatusDot /> Active
          </div>
        </div>
      </div>

      {lastUpdate ? (
        <p className="text-right text-xs text-white/35">
          อัปเดตล่าสุด: {lastUpdate}
        </p>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      {cacheWarning ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {cacheWarning}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setCurrentPage(1)
            }}
            placeholder="ค้นหาชื่อ"
            className="w-full rounded-xl border border-white/10 bg-black/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-white/35 outline-none backdrop-blur transition focus:border-white/25 focus:ring-2 focus:ring-white/10"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              setSortByPlayers(true)
              setAllServers((prev) =>
                [...prev].sort((a, b) => b.players - a.players)
              )
              setCurrentPage(1)
            }}
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition",
              sortByPlayers
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                : "border-white/10 bg-black/50 text-white/60 hover:text-white"
            )}
          >
            <Users className="h-4 w-4" />
            ผู้เล่น
          </button>
          <button
            type="button"
            onClick={() =>
              setViewMode((m) => (m === "list" ? "grid" : "list"))
            }
            className={cn(
              "inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm transition",
              viewMode === "grid"
                ? "border-cyan-400/40 bg-cyan-400/10 text-cyan-300"
                : "border-white/10 bg-black/50 text-white/60 hover:text-white"
            )}
          >
            {viewMode === "grid" ? (
              <LayoutGrid className="h-4 w-4" />
            ) : (
              <List className="h-4 w-4" />
            )}
            มุมมอง
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 text-sm leading-relaxed text-amber-100/90">
        สถานะกันโปร (GHOSTX) เป็นข้อมูลเบื้องต้น อาจมีการเปลี่ยนแปลงตามการอัปเดตของเซิร์ฟเวอร์
        | เพิ่มเติมทุกเซิร์ฟเวอร์ไม่ได้ใช้แค่กันโปร GhostX ยังมีกันโปรอื่นๆ
        อีกที่ทางเราไม่ได้บอกทั้งหมด เพราะว่ามันไม่สำคัญสำหรับโปรแกรมของทางเรา
      </div>

      {loading && allServers.length === 0 ? (
        <div className="flex items-center justify-center gap-2 py-16 text-white/50">
          <Loader2 className="h-5 w-5 animate-spin" />
          กำลังโหลดรายการเซิร์ฟเวอร์…
        </div>
      ) : (
        <>
          <div
            className={cn(
              "space-y-2",
              viewMode === "grid" &&
                "grid grid-cols-1 gap-2 space-y-0 md:grid-cols-2"
            )}
          >
            {pageRows.map((server, idx) => (
              <ServerRow
                key={server.endpoint}
                server={server}
                rank={(safePage - 1) * PAGE_SIZE + idx + 1}
                onCopy={handleCopy}
              />
            ))}
          </div>

          {filtered.length === 0 && !loading ? (
            <p className="py-12 text-center text-sm text-white/45">
              ไม่พบเซิร์ฟเวอร์ที่ตรงกับการค้นหา
            </p>
          ) : null}

          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onChange={setCurrentPage}
          />
        </>
      )}
    </div>
  )
}

function RefreshButton({
  refreshing,
  onClick,
}: {
  refreshing: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={refreshing}
      className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-medium text-white/80 transition hover:bg-white/10 hover:text-white disabled:opacity-50 sm:self-auto"
    >
      <RefreshCw className={cn("h-4 w-4", refreshing && "animate-spin")} />
      รีเฟรช
    </button>
  )
}
