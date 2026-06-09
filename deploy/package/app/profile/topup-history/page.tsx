"use client"

import { useEffect, useState } from "react"
import { type TopupHistory } from "@/lib/store"
import { Wallet, ChevronDown, DollarSign } from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"

function formatMethod(method: string) {
  if (method === "ANGPAO") return "ซองอังเปา"
  if (method === "PROMPTPAY") return "พร้อมเพย์"
  return method
}

function statusLabel(status: TopupHistory["status"]) {
  if (status === "APPROVED") return "สำเร็จ"
  if (status === "PENDING") return "รอดำเนินการ"
  return "ถูกปฏิเสธ"
}

function TopupCard({ topup }: { topup: TopupHistory }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className={cn(bw.panel, bw.panelHover, "overflow-hidden")}>
      <div
        className="flex cursor-pointer items-center justify-between p-4"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/10 text-white">
            <DollarSign className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h3 className="truncate font-semibold text-white">
              เติมเงินผ่าน {formatMethod(topup.method)}
            </h3>
            <p className="text-sm text-white/55">
              {new Date(topup.createdAt).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-emerald-500">
              +{topup.amount.toLocaleString()} บาท
            </p>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                topup.status === "APPROVED"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : topup.status === "PENDING"
                    ? "bg-yellow-500/10 text-yellow-500"
                    : "bg-red-500/10 text-red-500"
              )}
            >
              {statusLabel(topup.status)}
            </span>
          </div>
          <ChevronDown
            className={cn(
              "h-5 w-5 text-white/55 transition-transform",
              isExpanded && "rotate-180"
            )}
          />
        </div>
      </div>

      {isExpanded && (
        <div className="border-t border-white/10 bg-white/5 p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="mb-1 text-xs text-white/55">เลขที่รายการ</p>
              <p className="font-mono text-sm text-white">{topup.id}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/55">ช่องทางการชำระเงิน</p>
              <p className="text-sm text-white">{formatMethod(topup.method)}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/55">สถานะ</p>
              <p className="text-sm text-white">{statusLabel(topup.status)}</p>
            </div>
            <div>
              <p className="mb-1 text-xs text-white/55">เวลาที่ทำรายการ</p>
              <p className="text-sm text-white">
                {new Date(topup.createdAt).toLocaleTimeString("th-TH")}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TopupHistoryPage() {
  const [topups, setTopups] = useState<TopupHistory[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/topup")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setTopups(Array.isArray(data) ? data : []))
      .catch(() => setTopups([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className={cn(bw.panel, "p-6")}>
        <h1 className="text-xl font-bold text-white">ประวัติการเติมเงิน</h1>
        <p className="text-sm text-white/55">รายการเติมเงินทั้งหมดของคุณ</p>
      </div>
      {loading ? (
        <div className={cn(bw.panel, "p-6")}>
          <div className="flex min-h-[200px] items-center justify-center text-white/55">
            กำลังโหลด...
          </div>
        </div>
      ) : topups.length > 0 ? (
        <div className="space-y-4">
          {topups.map((topup) => (
            <TopupCard key={topup.id} topup={topup} />
          ))}
        </div>
      ) : (
        <div className={cn(bw.panel, "p-6")}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Wallet className="h-20 w-20 text-white/25" />
            <h3 className="mt-4 text-lg font-semibold text-white">ไม่มีประวัติการเติมเงิน</h3>
            <p className="mt-2 text-white/55">คุณยังไม่เคยเติมเงินเข้าระบบ</p>
          </div>
        </div>
      )}
    </div>
  )
}
