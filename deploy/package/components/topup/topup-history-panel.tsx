"use client"

import { useCallback, useEffect, useState } from "react"
import { Wallet, Clock, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface TopupHistoryItem {
  id: number
  amount: number
  method: string
  slipImage: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  adminNote: string | null
  createdAt: string
}

export function TopupHistoryPanel({ refreshKey = 0 }: { refreshKey?: number }) {
  const [history, setHistory] = useState<TopupHistoryItem[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch("/api/topup")
      if (res.ok) {
        setHistory(await res.json())
      }
    } catch {
      console.error("Failed to fetch history")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    fetchHistory()
  }, [fetchHistory, refreshKey])

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-medium text-white">ประวัติการเติมเงิน</h2>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
        </div>
      ) : history.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 text-center backdrop-blur-xl">
          <Wallet className="mx-auto mb-3 h-12 w-12 text-white/20" />
          <p className="text-sm font-normal text-white/50">ยังไม่มีประวัติการเติมเงิน</p>
        </div>
      ) : (
        <div className="max-h-[600px] space-y-3 overflow-y-auto pr-2">
          {history.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-full border border-white/10 bg-white/5 p-2">
                    {item.status === "APPROVED" && (
                      <CheckCircle className="h-4 w-4 text-white" />
                    )}
                    {item.status === "PENDING" && (
                      <Clock className="h-4 w-4 text-white/70" />
                    )}
                    {item.status === "REJECTED" && (
                      <XCircle className="h-4 w-4 text-white/50" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">
                      +฿{item.amount.toLocaleString()}
                    </p>
                    <p className="text-xs font-normal text-white/50">
                      {item.method === "ANGPAO" ? "ซองอังเปา" : "พร้อมเพย์"} •{" "}
                      {new Date(item.createdAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full border px-2 py-1 text-xs font-normal",
                    item.status === "APPROVED"
                      ? "border-white/20 bg-white/10 text-white"
                      : item.status === "PENDING"
                        ? "border-white/15 bg-white/5 text-white/80"
                        : "border-white/10 bg-black/60 text-white/50"
                  )}
                >
                  {item.status === "APPROVED"
                    ? "อนุมัติแล้ว"
                    : item.status === "PENDING"
                      ? "รอดำเนินการ"
                      : "ปฏิเสธ"}
                </span>
              </div>
              {item.adminNote && (
                <p className="mt-2 border-t border-white/10 pt-2 text-xs font-normal text-white/50">
                  หมายเหตุ: {item.adminNote}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function useTopupPending() {
  const [hasPending, setHasPending] = useState(false)
  const [loading, setLoading] = useState(true)

  const check = useCallback(async () => {
    try {
      const res = await fetch("/api/topup")
      if (res.ok) {
        const data: TopupHistoryItem[] = await res.json()
        setHasPending(data.some((t) => t.status === "PENDING"))
      }
    } catch {
      console.error("Failed to check pending topup")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    check()
  }, [check])

  return { hasPending, loading, refresh: check }
}
