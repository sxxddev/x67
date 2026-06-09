"use client"

import { useEffect, useState, useCallback } from "react"
import { ShoppingCart, Package, Users, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"
import { UserAvatar } from "@/components/user-avatar"

interface OrderData {
  id: string
  userId: string
  productId: string
  productName: string
  productImage: string | null
  price: number
  quantity: number
  status: string
  accountEmail: string | null
  accountPassword: string | null
  createdAt: string
  user: { username: string | null; name: string | null; email: string | null }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/orders")
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
    const interval = setInterval(fetchOrders, 10000)
    return () => clearInterval(interval)
  }, [fetchOrders])

  const filteredOrders = orders.filter((o) => (filter === "all" ? true : o.status === filter))

  const totalRevenue = orders
    .filter((o) => o.status === "SUCCESS")
    .reduce((sum, o) => sum + o.price, 0)

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className={bw.adminPageTitle}>การสั่งซื้อ</h1>
          <p className={bw.adminPageSubtitle}>
            รวม {orders.length} รายการ · รายได้รวม ฿{totalRevenue.toLocaleString("th-TH", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2">
        {[
          { id: "all", label: "ทั้งหมด" },
          { id: "SUCCESS", label: "สำเร็จ" },
          { id: "PENDING", label: "รอดำเนินการ" },
          { id: "FAILED", label: "ยกเลิก/ล้มเหลว" },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              filter === f.id ? bw.adminFilterActive : bw.adminFilterIdle
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={bw.adminTable}>
        <table className="w-full">
          <thead>
            <tr className={bw.adminTableHead}>
              <th className={bw.adminTh}>สินค้า</th>
              <th className={bw.adminTh}>ผู้ซื้อ</th>
              <th className={bw.adminTh}>ราคา</th>
              <th className={bw.adminTh}>สถานะ</th>
              <th className={bw.adminTh}>วันที่</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {filteredOrders.map((order) => (
              <tr key={order.id} className={bw.adminRow}>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className={cn(bw.adminIconBox, "h-10 w-10 rounded-lg")}>
                      <Package className="h-5 w-5" />
                    </div>
                    <p className="max-w-[200px] truncate text-sm font-medium text-white">{order.productName}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <UserAvatar className="h-7 w-7" iconClassName="text-[10px]" />
                    <span className="text-sm text-white/80">{order.user.username || order.user.name || "-"}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-semibold text-white">฿{order.price.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-block rounded-full px-2.5 py-1 text-xs font-medium",
                      order.status === "SUCCESS"
                        ? "bg-emerald-500/15 text-emerald-400"
                        : order.status === "PENDING"
                        ? "bg-amber-500/15 text-amber-400"
                        : "bg-red-500/15 text-red-400"
                    )}
                  >
                    {order.status === "SUCCESS" ? "สำเร็จ" : order.status === "PENDING" ? "รอดำเนินการ" : "ยกเลิก/ล้มเหลว"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-white/55">
                  {new Date(order.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
              </tr>
            ))}
            {filteredOrders.length === 0 && (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <ShoppingCart className={cn("mx-auto h-12 w-12", bw.iconMuted)} />
                  <p className={cn("mt-3 text-sm", bw.muted)}>ไม่มีรายการสั่งซื้อ</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
