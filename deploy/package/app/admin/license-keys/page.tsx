"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  KeyRound,
  Plus,
  Trash2,
  X,
  Copy,
  Check,
  RefreshCw,
  Ban,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"

type ProductOption = { id: string; name: string }

type LicenseKeyRow = {
  id: string
  key: string
  keyMasked: string
  productId: string
  status: "ACTIVE" | "REVOKED" | "EXPIRED"
  hwid: string | null
  expiresAt: string | null
  note: string | null
  createdAt: string
  product?: { id: string; name: string }
  user?: { id: number; username: string | null; email: string | null } | null
  order?: { id: number } | null
}

const emptyGenForm = {
  productId: "",
  count: "10",
  durationDays: "",
  note: "",
}

export default function AdminLicenseKeysPage() {
  const [products, setProducts] = useState<ProductOption[]>([])
  const [rows, setRows] = useState<LicenseKeyRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filterProduct, setFilterProduct] = useState("")
  const [filterStatus, setFilterStatus] = useState("")
  const [search, setSearch] = useState("")
  const [showModal, setShowModal] = useState(false)
  const [genForm, setGenForm] = useState(emptyGenForm)
  const [generating, setGenerating] = useState(false)
  const [generatedKeys, setGeneratedKeys] = useState<string[]>([])
  const [copied, setCopied] = useState<string | null>(null)
  const [toast, setToast] = useState<{ msg: string; type?: "error" } | null>(null)

  const showToast = (msg: string, type?: "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchProducts = useCallback(async () => {
    const res = await fetch("/api/admin/products")
    if (res.ok) {
      const data = await res.json()
      setProducts(
        Array.isArray(data)
          ? data.map((p: { id: string; name: string }) => ({ id: p.id, name: p.name }))
          : []
      )
    }
  }, [])

  const fetchKeys = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filterProduct) params.set("productId", filterProduct)
      if (filterStatus) params.set("status", filterStatus)
      if (search.trim()) params.set("q", search.trim())
      params.set("take", "150")

      const res = await fetch(`/api/admin/license-keys?${params}`)
      if (res.ok) {
        setRows(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [filterProduct, filterStatus, search])

  useEffect(() => {
    fetchProducts()
  }, [fetchProducts])

  useEffect(() => {
    fetchKeys()
  }, [fetchKeys])

  const handleGenerate = async () => {
    if (!genForm.productId) {
      showToast("กรุณาเลือกสินค้า", "error")
      return
    }

    setGenerating(true)
    setGeneratedKeys([])
    try {
      const res = await fetch("/api/admin/license-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: genForm.productId,
          count: Number(genForm.count) || 1,
          durationDays: genForm.durationDays ? Number(genForm.durationDays) : null,
          note: genForm.note || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error ?? "สร้างไม่สำเร็จ", "error")
        return
      }
      setGeneratedKeys(data.keys ?? [])
      showToast(data.message ?? "สร้าง Key แล้ว")
      fetchKeys()
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setGenerating(false)
    }
  }

  const handleRevoke = async (id: string) => {
    if (!confirm("ยกเลิก Key นี้?")) return
    const res = await fetch(`/api/admin/license-keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "REVOKED" }),
    })
    if (res.ok) {
      showToast("ยกเลิก Key แล้ว")
      fetchKeys()
    } else {
      showToast("ดำเนินการไม่สำเร็จ", "error")
    }
  }

  const handleResetHwid = async (id: string) => {
    const res = await fetch(`/api/admin/license-keys/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hwid: null }),
    })
    if (res.ok) {
      showToast("รีเซ็ต HWID แล้ว")
      fetchKeys()
    } else {
      showToast("รีเซ็ตไม่สำเร็จ", "error")
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("ลบ Key นี้ถาวร?")) return
    const res = await fetch(`/api/admin/license-keys/${id}`, { method: "DELETE" })
    if (res.ok) {
      showToast("ลบแล้ว")
      fetchKeys()
    } else {
      showToast("ลบไม่สำเร็จ", "error")
    }
  }

  const copyText = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(id)
    setTimeout(() => setCopied(null), 2000)
  }

  const statusLabel: Record<string, string> = {
    ACTIVE: "ใช้งานได้",
    REVOKED: "ยกเลิก",
    EXPIRED: "หมดอายุ",
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <KeyRound className="h-6 w-6" />
            License Key
          </h1>
          <p className="mt-1 text-sm text-white/50">
            จัดการ Key ใน DB — ใช้กับ API validate และรีเซ็ต HWID บนเว็บ
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setGenForm(emptyGenForm)
            setGeneratedKeys([])
            setShowModal(true)
          }}
          className={cn(bw.adminBtnPrimary, "gap-2")}
        >
          <Plus className="h-4 w-4" />
          สร้าง Key
        </button>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <select
          value={filterProduct}
          onChange={(e) => setFilterProduct(e.target.value)}
          className={cn(bw.adminSelect, "max-w-xs")}
        >
          <option value="">ทุกสินค้า</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={cn(bw.adminSelect, "max-w-[140px]")}
        >
          <option value="">ทุกสถานะ</option>
          <option value="ACTIVE">ใช้งานได้</option>
          <option value="REVOKED">ยกเลิก</option>
          <option value="EXPIRED">หมดอายุ</option>
        </select>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหา Key..."
          className={cn(bw.adminInputPlain, "max-w-xs flex-1")}
        />
        <button type="button" onClick={fetchKeys} className={cn(bw.adminBtnGhost, "gap-2")}>
          <RefreshCw className="h-4 w-4" />
          รีเฟรช
        </button>
      </div>

      <div className="mb-4 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/70">
        <p className="font-medium text-white">API สำหรับ Client (x67_roblox ในอนาคต)</p>
        <p className="mt-1 font-mono text-xs text-emerald-400">
          POST /api/license/validate
        </p>
        <p className="mt-2 text-xs text-white/50">
          Body: {"{ key, hwid, productId? }"} — ตั้ง LICENSE_API_SECRET ใน .env แล้วส่ง header X-License-Secret
        </p>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-white/5" />
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          ยังไม่มี License Key
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm text-white">
            <thead className="border-b border-white/10 bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">สินค้า</th>
                <th className="px-4 py-3">เจ้าของ</th>
                <th className="px-4 py-3">HWID</th>
                <th className="px-4 py-3">หมดอายุ</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{row.keyMasked}</span>
                      <button
                        type="button"
                        onClick={() => copyText(row.key, row.id)}
                        className="rounded p-1 text-white/50 hover:bg-white/10 hover:text-white"
                        title="คัดลอก Key"
                      >
                        {copied === row.id ? (
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">{row.product?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-white/60">
                    {row.user?.username ?? row.user?.email ?? (row.order ? `#${row.order.id}` : "—")}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {row.hwid ? `${row.hwid.slice(0, 12)}…` : "—"}
                  </td>
                  <td className="px-4 py-3 text-white/60">
                    {row.expiresAt
                      ? new Date(row.expiresAt).toLocaleDateString("th-TH")
                      : "ไม่หมดอายุ"}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        row.status === "ACTIVE"
                          ? "bg-emerald-500/15 text-emerald-400"
                          : row.status === "REVOKED"
                          ? "bg-red-500/15 text-red-400"
                          : "bg-white/10 text-white/40"
                      )}
                    >
                      {statusLabel[row.status] ?? row.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      {row.status === "ACTIVE" && row.hwid ? (
                        <button
                          type="button"
                          onClick={() => handleResetHwid(row.id)}
                          className="rounded-lg p-2 text-white/70 hover:bg-white/10"
                          title="รีเซ็ต HWID"
                        >
                          <RefreshCw className="h-4 w-4" />
                        </button>
                      ) : null}
                      {row.status === "ACTIVE" ? (
                        <button
                          type="button"
                          onClick={() => handleRevoke(row.id)}
                          className="rounded-lg p-2 text-amber-400/80 hover:bg-amber-500/10"
                          title="ยกเลิก Key"
                        >
                          <Ban className="h-4 w-4" />
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg p-2 text-red-400/80 hover:bg-red-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-[#111] p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">สร้าง License Key</h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-white/60 hover:bg-white/10"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="สินค้า">
                <select
                  value={genForm.productId}
                  onChange={(e) => setGenForm({ ...genForm, productId: e.target.value })}
                  className={bw.adminSelect}
                >
                  <option value="">— เลือกสินค้า —</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="จำนวน">
                  <input
                    type="number"
                    min={1}
                    max={500}
                    value={genForm.count}
                    onChange={(e) => setGenForm({ ...genForm, count: e.target.value })}
                    className={bw.adminInputPlain}
                  />
                </Field>
                <Field label="อายุ (วัน) — ว่าง = ไม่หมดอายุ">
                  <input
                    type="number"
                    min={0}
                    value={genForm.durationDays}
                    onChange={(e) => setGenForm({ ...genForm, durationDays: e.target.value })}
                    className={bw.adminInputPlain}
                    placeholder="เช่น 30"
                  />
                </Field>
              </div>
              <Field label="หมายเหตุ (ไม่บังคับ)">
                <input
                  value={genForm.note}
                  onChange={(e) => setGenForm({ ...genForm, note: e.target.value })}
                  className={bw.adminInputPlain}
                />
              </Field>
            </div>

            {generatedKeys.length > 0 ? (
              <div className="mt-4 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3">
                <p className="mb-2 text-xs text-emerald-400">Key ที่สร้างแล้ว — คัดลอกเก็บไว้</p>
                <pre className="max-h-40 overflow-auto whitespace-pre-wrap font-mono text-xs text-white">
                  {generatedKeys.join("\n")}
                </pre>
                <button
                  type="button"
                  onClick={() => copyText(generatedKeys.join("\n"), "all")}
                  className={cn(bw.adminBtnGhost, "mt-2 gap-2 text-xs")}
                >
                  {copied === "all" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  คัดลอกทั้งหมด
                </button>
              </div>
            ) : null}

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" onClick={() => setShowModal(false)} className={bw.adminBtnGhost}>
                ปิด
              </button>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={generating}
                className={bw.adminBtnPrimary}
              >
                {generating ? "กำลังสร้าง..." : "สร้าง"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {toast ? (
        <div
          className={cn(
            "fixed bottom-6 right-6 z-50 rounded-lg px-4 py-3 text-sm text-white shadow-lg",
            toast.type === "error" ? "bg-red-600" : "bg-emerald-600"
          )}
        >
          {toast.msg}
        </div>
      ) : null}
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/50">{label}</span>
      {children}
    </label>
  )
}
