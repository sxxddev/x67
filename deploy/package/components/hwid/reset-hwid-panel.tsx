"use client"

import { useCallback, useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import {
  ChevronRight,
  Clock,
  DollarSign,
  Key,
  Loader2,
} from "lucide-react"
import { AuthLinkButton } from "@/components/auth-link-button"
import { cn } from "@/lib/utils"
import { formatRelativeTimeTh } from "@/lib/format-relative-time-th"

type HwidProgram = {
  id: string
  name: string
  price: number
}

type HwidHistoryItem = {
  id: string
  programName: string
  licenseKeyMasked: string
  price: number
  status: "PENDING" | "SUCCESS" | "FAILED"
  errorMsg: string | null
  createdAt: string
}

function statusLabel(status: HwidHistoryItem["status"]) {
  if (status === "SUCCESS") return "สำเร็จ"
  if (status === "FAILED") return "ล้มเหลว"
  return "กำลังดำเนินการ"
}

function statusClass(status: HwidHistoryItem["status"]) {
  if (status === "SUCCESS") return "text-emerald-400"
  if (status === "FAILED") return "text-red-400"
  return "text-amber-400"
}

export function ResetHwidPanel() {
  const { data: session, status: authStatus } = useSession()
  const [programs, setPrograms] = useState<HwidProgram[]>([])
  const [history, setHistory] = useState<HwidHistoryItem[]>([])
  const [balance, setBalance] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [licenseKeys, setLicenseKeys] = useState<Record<string, string>>({})
  const [submittingId, setSubmittingId] = useState<string | null>(null)
  const [message, setMessage] = useState<{ text: string; type: "ok" | "err" } | null>(
    null
  )

  const isLoggedIn = authStatus === "authenticated" && !!session?.user

  const loadData = useCallback(async () => {
    try {
      const programRes = await fetch("/api/hwid/programs")
      const programData = await programRes.json()
      if (Array.isArray(programData.programs)) {
        setPrograms(programData.programs)
      }

      if (isLoggedIn) {
        const [historyRes, profileRes] = await Promise.all([
          fetch("/api/hwid/history"),
          fetch("/api/profile"),
        ])
        const historyData = await historyRes.json()
        const profileData = await profileRes.json()

        if (Array.isArray(historyData.items)) setHistory(historyData.items)
        if (profileData.user?.balance != null) setBalance(profileData.user.balance)
      }
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn])

  useEffect(() => {
    if (authStatus === "loading") return
    loadData()
  }, [authStatus, loadData])

  const handleReset = async (program: HwidProgram) => {
    const licenseKey = (licenseKeys[program.id] ?? "").trim()
    if (!licenseKey) {
      setMessage({ text: "กรุณากรอก License Key", type: "err" })
      return
    }

    setSubmittingId(program.id)
    setMessage(null)

    try {
      const res = await fetch("/api/hwid/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ programId: program.id, licenseKey }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ text: data.error ?? "รีเซ็ตไม่สำเร็จ", type: "err" })
        return
      }

      setMessage({ text: data.message ?? "รีเซ็ต HWID สำเร็จ", type: "ok" })
      if (typeof data.balance === "number") setBalance(data.balance)
      setLicenseKeys((prev) => ({ ...prev, [program.id]: "" }))
      setExpandedId(null)

      const historyRes = await fetch("/api/hwid/history")
      const historyData = await historyRes.json()
      if (Array.isArray(historyData.items)) setHistory(historyData.items)
    } catch {
      setMessage({ text: "เกิดข้อผิดพลาด กรุณาลองใหม่", type: "err" })
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading || authStatus === "loading") {
    return (
      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="h-40 animate-pulse rounded-xl bg-white/5" />
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <Key className="mx-auto mb-4 h-10 w-10 text-white/50" />
        <h1 className="text-xl font-bold text-white">รีเซ็ต HWID</h1>
        <p className="mt-2 text-sm text-white/50">
          กรุณาเข้าสู่ระบบเพื่อใช้งานระบบรีเซ็ต HWID
        </p>
        <AuthLinkButton
          mode="login"
          className="mt-6 inline-flex rounded-full bg-white px-6 py-2.5 text-sm font-medium text-black"
        >
          เข้าสู่ระบบ
        </AuthLinkButton>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8">
      <div className="space-y-2 text-center">
        <div className="flex items-center justify-center gap-2">
          <Key className="h-6 w-6 text-white" aria-hidden />
          <h1 className="text-2xl font-bold text-white">รีเซ็ต HWID</h1>
        </div>
        <p className="text-sm text-white/50">
          รีเซ็ต Hardware ID สำหรับปลดล็อคการใช้งานบนอุปกรณ์ใหม่
        </p>
        <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white">
          <DollarSign className="h-4 w-4 shrink-0" aria-hidden />
          <span>ยอดเงิน:</span>
          <span className="font-semibold">
            {(balance ?? 0).toLocaleString("th-TH", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            ฿
          </span>
        </div>
        {message ? (
          <p
            className={cn(
              "text-sm",
              message.type === "ok" ? "text-emerald-400" : "text-red-400"
            )}
          >
            {message.text}
          </p>
        ) : null}
      </div>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,4fr)]">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/45">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Key className="h-4 w-4" aria-hidden />
              รีเซ็ต HWID
            </h2>
          </div>
          <div className="p-4">
            {programs.length === 0 ? (
              <p className="py-6 text-center text-sm text-white/50">
                ยังไม่มีโปรแกรม — รอแอดมินเพิ่มรายการ
              </p>
            ) : (
              <div className="space-y-1">
                {programs.map((program) => {
                  const open = expandedId === program.id
                  const busy = submittingId === program.id
                  return (
                    <div key={program.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId((current) =>
                            current === program.id ? null : program.id
                          )
                        }
                        className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/5"
                      >
                        <ChevronRight
                          className={cn(
                            "h-4 w-4 shrink-0 transition-transform duration-200",
                            open && "rotate-90"
                          )}
                          aria-hidden
                        />
                        <Key className="h-4 w-4 shrink-0 opacity-60" aria-hidden />
                        <span className="flex-1 truncate font-medium text-white">
                          {program.name}
                        </span>
                        <span className="shrink-0 text-xs text-white/60">
                          {program.price.toFixed(2)} ฿
                        </span>
                      </button>

                      {open ? (
                        <div className="mb-2 ml-11 mr-3 space-y-3 rounded-lg border border-white/10 bg-white/[0.03] p-3">
                          <div>
                            <label
                              htmlFor={`license-${program.id}`}
                              className="mb-1 block text-xs text-white/50"
                            >
                              License Key
                            </label>
                            <input
                              id={`license-${program.id}`}
                              type="text"
                              value={licenseKeys[program.id] ?? ""}
                              onChange={(e) =>
                                setLicenseKeys((prev) => ({
                                  ...prev,
                                  [program.id]: e.target.value,
                                }))
                              }
                              placeholder="กรอก License Key ของคุณ"
                              className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/20"
                            />
                          </div>
                          <button
                            type="button"
                            disabled={busy}
                            onClick={() => handleReset(program)}
                            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2 text-sm font-medium text-black transition-opacity hover:bg-white/95 disabled:opacity-60"
                          >
                            {busy ? (
                              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                            ) : null}
                            รีเซ็ต HWID ({program.price.toFixed(2)} ฿)
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-white/10 bg-black/45">
          <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
              <Clock className="h-4 w-4" aria-hidden />
              ประวัติการรีเซ็ต
            </h2>
          </div>
          <div className="p-4">
            {history.length === 0 ? (
              <div className="py-8 text-center text-white/50">
                <Clock className="mx-auto mb-2 h-8 w-8" aria-hidden />
                <p>ยังไม่มีประวัติการรีเซ็ต</p>
              </div>
            ) : (
              <div className="space-y-2">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-white">
                          {item.programName}
                        </p>
                        <p className="text-xs text-white/40">
                          {item.licenseKeyMasked} ·{" "}
                          {formatRelativeTimeTh(new Date(item.createdAt))}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-xs text-white/50">
                          {item.price.toFixed(2)} ฿
                        </p>
                        <p className={cn("text-xs font-medium", statusClass(item.status))}>
                          {statusLabel(item.status)}
                        </p>
                      </div>
                    </div>
                    {item.errorMsg && item.status === "FAILED" ? (
                      <p className="mt-1 text-xs text-red-400/80">{item.errorMsg}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
