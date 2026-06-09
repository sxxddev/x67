"use client"

import { useEffect, useState, useCallback } from "react"
import { Ticket, Plus, Pencil, Trash2, X, Check, AlertCircle, Percent, DollarSign, Calendar, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface Coupon {
  id: string
  code: string
  type: "PERCENT" | "FIXED"
  value: number
  minPurchase: number
  maxDiscount: number | null
  usageLimit: number | null
  usedCount: number
  startDate: string
  endDate: string | null
  isActive: boolean
  createdAt: string
  _count?: { couponUsage: number; orders: number }
}

const emptyCoupon = {
  code: "",
  type: "PERCENT" as const,
  value: "",
  minPurchase: "0",
  maxDiscount: "",
  usageLimit: "",
  startDate: new Date().toISOString().split("T")[0],
  endDate: "",
  isActive: true,
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [formData, setFormData] = useState(emptyCoupon)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchCoupons = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/coupons")
      if (res.ok) {
        setCoupons(await res.json())
      }
    } catch (error) {
      console.error("Failed to fetch coupons:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCoupons()
  }, [fetchCoupons])

  const handleCreate = () => {
    setEditingCoupon(null)
    setFormData(emptyCoupon)
    setShowModal(true)
  }

  const handleEdit = (coupon: Coupon) => {
    setEditingCoupon(coupon)
    setFormData({
      code: coupon.code,
      type: coupon.type,
      value: coupon.value.toString(),
      minPurchase: coupon.minPurchase.toString(),
      maxDiscount: coupon.maxDiscount?.toString() || "",
      usageLimit: coupon.usageLimit?.toString() || "",
      startDate: new Date(coupon.startDate).toISOString().split("T")[0],
      endDate: coupon.endDate ? new Date(coupon.endDate).toISOString().split("T")[0] : "",
      isActive: coupon.isActive,
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจที่จะลบคูปองนี้?")) return
    
    try {
      const res = await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" })
      if (res.ok) {
        showToast("ลบคูปองสำเร็จ")
        fetchCoupons()
      } else {
        const err = await res.json()
        showToast(err.error || "ไม่สามารถลบได้", "error")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingCoupon
        ? `/api/admin/coupons/${editingCoupon.id}`
        : "/api/admin/coupons"
      const method = editingCoupon ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        showToast(editingCoupon ? "อัพเดทคูปองสำเร็จ" : "สร้างคูปองสำเร็จ")
        setShowModal(false)
        fetchCoupons()
      } else {
        const err = await res.json()
        showToast(err.error || "เกิดข้อผิดพลาด", "error")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setSaving(false)
    }
  }

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    let code = ""
    for (let i = 0; i < 8; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, code })
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">คูปองส่วนลด</h1>
          <p className="text-sm text-muted-foreground mt-1">จัดการคูปองและโค้ดส่วนลด</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          สร้างคูปองใหม่
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">คูปองทั้งหมด</span>
            <Ticket className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">{coupons.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">กำลังใช้งาน</span>
            <Check className="h-5 w-5 text-success" />
          </div>
          <div className="text-3xl font-black text-success">{coupons.filter(c => c.isActive).length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">ถูกใช้ไปแล้ว</span>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {coupons.reduce((sum, c) => sum + (c._count?.couponUsage || 0), 0)}
          </div>
        </div>
      </div>

      {/* Coupons Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">โค้ด</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">ส่วนลด</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">เงื่อนไข</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">การใช้งาน</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {coupons.map((coupon) => (
              <tr key={coupon.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4">
                  <span className="font-mono font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-lg">
                    {coupon.code}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {coupon.type === "PERCENT" ? (
                      <Percent className="h-4 w-4 text-success" />
                    ) : (
                      <DollarSign className="h-4 w-4 text-success" />
                    )}
                    <span className="font-bold text-foreground">
                      {coupon.type === "PERCENT" ? `${coupon.value}%` : `฿${coupon.value}`}
                    </span>
                    {coupon.maxDiscount && (
                      <span className="text-xs text-muted-foreground">(สูงสุด ฿{coupon.maxDiscount})</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">
                  {coupon.minPurchase > 0 ? `ขั้นต่ำ ฿${coupon.minPurchase}` : "ไม่มี"}
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-foreground">
                    {coupon._count?.couponUsage || 0}
                    {coupon.usageLimit && <span className="text-muted-foreground">/{coupon.usageLimit}</span>}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex rounded-full px-3 py-1.5 text-xs font-bold",
                    coupon.isActive ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                  )}>
                    {coupon.isActive ? "เปิดใช้งาน" : "ปิดใช้งาน"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(coupon)}
                      className="rounded-xl p-2.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title="แก้ไข"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(coupon.id)}
                      className="rounded-xl p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <Ticket className="mx-auto h-12 w-12 text-muted-foreground/30" />
                  <p className="mt-3 text-sm text-muted-foreground">ยังไม่มีคูปอง</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Ticket className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {editingCoupon ? "แก้ไขคูปอง" : "สร้างคูปองใหม่"}
                  </h2>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Code */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">รหัสคูปอง *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    placeholder="เช่น SAVE20"
                    className="flex-1 rounded-xl border border-border bg-input px-4 py-3 text-sm font-mono font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                  <button
                    type="button"
                    onClick={generateCode}
                    className="rounded-xl bg-secondary px-4 py-3 text-sm font-medium text-secondary-foreground hover:bg-muted transition-colors"
                  >
                    สุ่ม
                  </button>
                </div>
              </div>

              {/* Type & Value */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">ประเภท</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as "PERCENT" | "FIXED" })}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  >
                    <option value="PERCENT">เปอร์เซ็นต์ (%)</option>
                    <option value="FIXED">จำนวนเงิน (฿)</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">มูลค่า *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === "PERCENT" ? "10" : "50"}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">ยอดซื้อขั้นต่ำ</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.minPurchase}
                    onChange={(e) => setFormData({ ...formData, minPurchase: e.target.value })}
                    placeholder="0"
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                {formData.type === "PERCENT" && (
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">ส่วนลดสูงสุด</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.maxDiscount}
                      onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                      placeholder="ไม่จำกัด"
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Usage Limit */}
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-foreground">จำกัดการใช้งาน (ครั้ง)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.usageLimit}
                  onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                  placeholder="ไม่จำกัด"
                  className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">วันที่เริ่ม</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-foreground">วันที่หมดอายุ</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                  />
                </div>
              </div>

              {/* Active */}
              <label className={cn(
                "flex items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                formData.isActive ? "border-success/50 bg-success/10" : "border-border bg-muted/50"
              )}>
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="h-5 w-5 rounded-md border-border text-success focus:ring-success/20"
                />
                <div>
                  <p className={cn("text-sm font-bold", formData.isActive ? "text-success" : "text-foreground")}>เปิดใช้งาน</p>
                  <p className="text-xs text-muted-foreground">คูปองนี้สามารถใช้ได้</p>
                </div>
              </label>
            </form>

            <div className="border-t border-border bg-muted/50 px-6 py-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-bold text-muted-foreground hover:bg-muted transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="rounded-xl bg-primary px-6 py-2.5 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition-all disabled:opacity-70"
              >
                {saving ? "กำลังบันทึก..." : editingCoupon ? "บันทึก" : "สร้างคูปอง"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
