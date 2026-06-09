"use client"

import { useEffect, useState, useCallback } from "react"
import {
  DollarSign,
  ShoppingCart,
  Users,
  TrendingUp,
  TrendingDown,
  Package,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"

interface StatsData {
  revenue: { current: number; change: number }
  orders: { current: number; change: number; total: number }
  users: { current: number; change: number; total: number }
  products: { total: number }
  recentOrders: {
    id: string
    productName: string
    price: number
    status: string
    userName: string
    createdAt: string
  }[]
}

function StatCard({
  title,
  value,
  change,
  icon: Icon,
  prefix = "",
}: {
  title: string
  value: string | number
  change: number
  icon: any
  prefix?: string
}) {
  const isPositive = change >= 0
  return (
    <div className={cn(bw.adminCard, bw.panelHover, "p-6")}>
      <div className="flex items-center justify-between">
        <div>
          <p className={bw.adminPageSubtitle}>{title}</p>
          <p className="mt-1 text-2xl font-bold text-white">
            {prefix}{typeof value === "number" ? value.toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {isPositive ? (
              <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <TrendingDown className="h-3.5 w-3.5 text-red-400" />
            )}
            <span
              className={cn(
                "text-xs font-medium",
                isPositive ? "text-emerald-400" : "text-red-400"
              )}
            >
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-white/40">เทียบกับเดือนที่แล้ว</span>
          </div>
        </div>
        <div className={bw.adminIconBox}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  )
}

function timeAgo(dateStr: string): string {
  const now = new Date()
  const date = new Date(dateStr)
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000)

  if (diff < 60) return `${diff} วินาทีที่แล้ว`
  if (diff < 3600) return `${Math.floor(diff / 60)} นาทีที่แล้ว`
  if (diff < 86400) return `${Math.floor(diff / 3600)} ชั่วโมงที่แล้ว`
  return `${Math.floor(diff / 86400)} วันที่แล้ว`
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    // Auto-refresh every 10 seconds
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [fetchStats])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className={bw.adminSpinner} />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className={bw.adminPageTitle}>ภาพรวม</h1>
        <p className={bw.adminPageSubtitle}>สรุปข้อมูลร้านค้าทั้งหมด</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="รายได้เดือนนี้"
          value={stats?.revenue.current || 0}
          change={stats?.revenue.change || 0}
          icon={DollarSign}
          prefix="฿"
        />
        <StatCard
          title="คำสั่งซื้อเดือนนี้"
          value={stats?.orders.current || 0}
          change={stats?.orders.change || 0}
          icon={ShoppingCart}
        />
        <StatCard
          title="ผู้ใช้งานเดือนนี้"
          value={stats?.users.current || 0}
          change={stats?.users.change || 0}
          icon={Users}
        />
        <StatCard
          title="สินค้าทั้งหมด"
          value={stats?.products.total || 0}
          change={0}
          icon={Package}
        />
      </div>

      {/* Recent Orders */}
      <div className={bw.adminTable}>
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-white">คำสั่งซื้อล่าสุด</h2>
            <p className={bw.adminPageSubtitle}>แสดงรายการสั่งซื้อล่าสุดจากลูกค้า</p>
          </div>
        </div>
        <div className="divide-y divide-white/10">
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            stats.recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-4">
                  <div className={cn(bw.adminIconBox, "h-10 w-10 rounded-lg")}>
                    <Package className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{order.productName}</p>
                    <p className="text-xs text-white/55">
                      <span className="inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {order.userName}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-white">฿{order.price.toFixed(2)}</p>
                  <p className="text-xs text-white/45">{timeAgo(order.createdAt)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <ShoppingCart className={cn("h-12 w-12", bw.iconMuted)} />
              <p className={cn("mt-3 text-sm", bw.muted)}>ยังไม่มีคำสั่งซื้อ</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
