"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { Wallet, ShoppingBag, Gift, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"

type ProfilePayload = {
  user: {
    balance: number
    points: number
  }
  stats: {
    orderCount: number
    totalSpent: number
  }
}

export default function ProfilePage() {
  const { status } = useSession()
  const [data, setData] = useState<ProfilePayload | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false)
      return
    }
    if (status !== "authenticated") return

    fetch("/api/profile")
      .then((r) => (r.ok ? r.json() : null))
      .then((json) => {
        if (json) setData(json)
      })
      .finally(() => setLoading(false))
  }, [status])

  const balance = data?.user.balance ?? 0
  const points = data?.user.points ?? 0
  const orderCount = data?.stats.orderCount ?? 0
  const totalSpent = data?.stats.totalSpent ?? 0

  const stats = [
    {
      label: "ยอดเงินคงเหลือ",
      value: loading ? "…" : `${balance.toLocaleString("th-TH")} บาท`,
      icon: Wallet,
    },
    {
      label: "จำนวนคำสั่งซื้อ",
      value: loading ? "…" : `${orderCount} รายการ`,
      icon: ShoppingBag,
    },
    {
      label: "พอยท์สะสม",
      value: loading ? "…" : `${points.toLocaleString("th-TH")} พอยท์`,
      icon: Gift,
    },
    {
      label: "ยอดซื้อทั้งหมด",
      value: loading
        ? "…"
        : `${Math.floor(totalSpent).toLocaleString("th-TH")} บาท`,
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div className={cn(bw.panel, "p-6")}>
        <h1 className={cn("text-xl", bw.title)}>ภาพรวมบัญชี</h1>
        <p className={bw.subtitle}>ข้อมูลบัญชีและสถิติของคุณ</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div
              key={stat.label}
              className={cn(
                bw.panel,
                bw.panelHover,
                "flex items-center justify-between p-4"
              )}
            >
              <div>
                <p className={bw.subtitle}>{stat.label}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
              </div>
              <Icon className="h-10 w-10 text-white/70" />
            </div>
          )
        })}
      </div>

      <div className={cn(bw.panel, "p-6")}>
        <h2 className="mb-4 text-lg font-semibold text-white">กิจกรรมล่าสุด</h2>
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <ShoppingBag className={cn("h-16 w-16", bw.iconMuted)} />
          <p className={cn("mt-4", bw.muted)}>
            {orderCount > 0
              ? `มีคำสั่งซื้อสำเร็จ ${orderCount} รายการ — ดูรายละเอียดที่ประวัติการสั่งซื้อ`
              : "ยังไม่มีกิจกรรม"}
          </p>
        </div>
      </div>
    </div>
  )
}
