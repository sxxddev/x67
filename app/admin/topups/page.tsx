"use client"

import { useEffect, useState, useCallback } from "react"
import { Wallet, Check, X, Eye, AlertCircle, Clock, CheckCircle, XCircle, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"

interface TopupData {
  id: number
  userId: number
  amount: number
  method: string
  slipImage: string | null
  status: "PENDING" | "APPROVED" | "REJECTED"
  adminNote: string | null
  createdAt: string
  approvedAt: string | null
  user: { 
    id: number
    username: string | null
    name: string | null
    email: string | null
    balance: number
  }
}

export default function AdminTopupsPage() {
  const [topups, setTopups] = useState<TopupData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")
  const [selectedTopup, setSelectedTopup] = useState<TopupData | null>(null)
  const [processing, setProcessing] = useState(false)
  const [adminNote, setAdminNote] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchTopups = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/topups")
      if (res.ok) {
        const data = await res.json()
        setTopups(data)
      }
    } catch (error) {
      console.error("Failed to fetch topups:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTopups()
    const interval = setInterval(fetchTopups, 10000)
    return () => clearInterval(interval)
  }, [fetchTopups])

  const handleAction = async (action: "approve" | "reject") => {
    if (!selectedTopup) return
    setProcessing(true)

    try {
      const res = await fetch(`/api/admin/topups/${selectedTopup.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, adminNote }),
      })

      if (res.ok) {
        showToast(action === "approve" ? "อนุมัติการเติมเงินสำเร็จ" : "ปฏิเสธการเติมเงินสำเร็จ")
        setSelectedTopup(null)
        setAdminNote("")
        fetchTopups()
      } else {
        const err = await res.json()
        showToast(err.error || "เกิดข้อผิดพลาด", "error")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setProcessing(false)
    }
  }

  const filteredTopups = topups.filter((t) => (filter === "all" ? true : t.status === filter))

  const stats = {
    pending: topups.filter(t => t.status === "PENDING").length,
    approved: topups.filter(t => t.status === "APPROVED").length,
    rejected: topups.filter(t => t.status === "REJECTED").length,
    totalApproved: topups.filter(t => t.status === "APPROVED").reduce((sum, t) => sum + t.amount, 0),
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-background min-h-screen">
      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg px-4 py-3 shadow-xl animate-in slide-in-from-right",
          toast.type === "success" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground"
        )}>
          {toast.type === "success" ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <span className="font-medium text-sm">{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">การเติมเงิน</h1>
        <p className="text-sm text-muted-foreground">
          จัดการคำขอเติมเงินจากผู้ใช้งาน
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-warning/50 bg-warning/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">รอดำเนินการ</span>
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div className="text-3xl font-black text-warning">{stats.pending}</div>
        </div>
        <div className="rounded-2xl border border-success/50 bg-success/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">อนุมัติแล้ว</span>
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
          <div className="text-3xl font-black text-success">{stats.approved}</div>
        </div>
        <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ปฏิเสธ</span>
            <XCircle className="h-5 w-5 text-destructive" />
          </div>
          <div className="text-3xl font-black text-destructive">{stats.rejected}</div>
        </div>
        <div className="rounded-2xl border border-primary/50 bg-primary/10 p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ยอดรวมอนุมัติ</span>
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-black text-primary">฿{stats.totalApproved.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter Tags */}
      <div className="flex gap-2">
        {[
          { id: "all", label: "ทั้งหมด", count: topups.length },
          { id: "PENDING", label: "รอดำเนินการ", count: stats.pending },
          { id: "APPROVED", label: "อนุมัติแล้ว", count: stats.approved },
          { id: "REJECTED", label: "ปฏิเสธ", count: stats.rejected },
        ].map((f) => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id)}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
              filter === f.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">ผู้ใช้</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">จำนวน</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">สลิป</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">วันที่</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTopups.map((topup) => (
              <tr key={topup.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <UserAvatar className="h-8 w-8 shrink-0" iconClassName="text-xs" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{topup.user.username || topup.user.name || "-"}</p>
                      <p className="text-xs text-muted-foreground">ยอดเงินปัจจุบัน: ฿{topup.user.balance.toLocaleString()}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-success">+฿{topup.amount.toLocaleString()}</td>
                <td className="px-6 py-4">
                  {topup.slipImage ? (
                    <button
                      onClick={() => setSelectedTopup(topup)}
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      <ImageIcon className="h-4 w-4" />
                      ดูสลิป
                    </button>
                  ) : (
                    <span className="text-xs text-muted-foreground">ไม่มี</span>
                  )}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold",
                      topup.status === "APPROVED"
                        ? "bg-success/20 text-success"
                        : topup.status === "PENDING"
                        ? "bg-warning/20 text-warning"
                        : "bg-destructive/20 text-destructive"
                    )}
                  >
                    {topup.status === "APPROVED" && <CheckCircle className="h-3 w-3" />}
                    {topup.status === "PENDING" && <Clock className="h-3 w-3" />}
                    {topup.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                    {topup.status === "APPROVED" ? "อนุมัติแล้ว" : topup.status === "PENDING" ? "รอดำเนินการ" : "ปฏิเสธ"}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {new Date(topup.createdAt).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    {topup.status === "PENDING" && (
                      <>
                        <button
                          onClick={() => { setSelectedTopup(topup); setAdminNote(""); }}
                          className="rounded-xl p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                          title="ดูรายละเอียด"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filteredTopups.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Wallet className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">ไม่มีรายการเติมเงิน</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Topup Detail Modal */}
      {selectedTopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setSelectedTopup(null)} />
          
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-foreground">รายละเอียดการเติมเงิน</h2>
                <p className="text-sm text-muted-foreground">#{selectedTopup.id}</p>
              </div>
              <button onClick={() => setSelectedTopup(null)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/50">
                <UserAvatar className="h-12 w-12 shrink-0" iconClassName="text-lg" />
                <div>
                  <p className="text-lg font-bold text-foreground">{selectedTopup.user.username || selectedTopup.user.name}</p>
                  <p className="text-sm text-muted-foreground">ยอดเงินปัจจุบัน: ฿{selectedTopup.user.balance.toLocaleString()}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-2xl font-black text-success">+฿{selectedTopup.amount.toLocaleString()}</p>
                </div>
              </div>

              {/* Slip Image */}
              {selectedTopup.slipImage && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-foreground">สลิปการโอนเงิน</p>
                  <div className="rounded-xl overflow-hidden border border-border">
                    <img
                      src={selectedTopup.slipImage}
                      alt="Slip"
                      className="w-full max-h-[400px] object-contain bg-muted"
                    />
                  </div>
                </div>
              )}

              {/* Admin Note */}
              {selectedTopup.status === "PENDING" && (
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">หมายเหตุ (ถ้ามี)</label>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    rows={2}
                    placeholder="หมายเหตุสำหรับผู้ใช้..."
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                </div>
              )}

              {/* Actions */}
              {selectedTopup.status === "PENDING" ? (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAction("reject")}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-destructive/50 px-4 py-3 text-sm font-bold text-destructive hover:bg-destructive/10 transition-all disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" />
                    ปฏิเสธ
                  </button>
                  <button
                    onClick={() => handleAction("approve")}
                    disabled={processing}
                    className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-success px-4 py-3 text-sm font-bold text-success-foreground hover:bg-success/90 transition-all disabled:opacity-50"
                  >
                    <CheckCircle className="h-4 w-4" />
                    {processing ? "กำลังดำเนินการ..." : "อนุมัติ"}
                  </button>
                </div>
              ) : (
                <div className={cn(
                  "p-4 rounded-xl text-center",
                  selectedTopup.status === "APPROVED" ? "bg-success/10" : "bg-destructive/10"
                )}>
                  <p className={cn(
                    "font-bold",
                    selectedTopup.status === "APPROVED" ? "text-success" : "text-destructive"
                  )}>
                    {selectedTopup.status === "APPROVED" ? "อนุมัติแล้ว" : "ปฏิเสธแล้ว"}
                  </p>
                  {selectedTopup.adminNote && (
                    <p className="text-sm text-muted-foreground mt-1">หมายเหตุ: {selectedTopup.adminNote}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
