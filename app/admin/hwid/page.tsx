"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  Key,
  Plus,
  Pencil,
  Trash2,
  X,
  Download,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"

type HwidProgramRow = {
  id: string
  name: string
  price: number
  productId: string | null
  apiEndpoint: string | null
  apiKey: string | null
  apiKeyHeader: string | null
  licenseKeyField: string
  sortOrder: number
  isActive: boolean
  product?: { id: string; name: string } | null
  _count?: { resets: number }
}

const emptyForm = {
  name: "",
  price: "20",
  productId: "",
  apiEndpoint: "",
  apiKey: "",
  apiKeyHeader: "Authorization",
  licenseKeyField: "license",
  sortOrder: "0",
  isActive: true,
}

export default function AdminHwidPage() {
  const [programs, setPrograms] = useState<HwidProgramRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<HwidProgramRow | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [toast, setToast] = useState<{ msg: string; type?: "error" } | null>(null)

  const showToast = (msg: string, type?: "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const fetchPrograms = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/hwid-programs")
      if (res.ok) {
        setPrograms(await res.json())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchPrograms()
  }, [fetchPrograms])

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const openEdit = (row: HwidProgramRow) => {
    setEditing(row)
    setForm({
      name: row.name,
      price: String(row.price),
      productId: row.productId ?? "",
      apiEndpoint: row.apiEndpoint ?? "",
      apiKey: row.apiKey ?? "",
      apiKeyHeader: row.apiKeyHeader ?? "Authorization",
      licenseKeyField: row.licenseKeyField ?? "license",
      sortOrder: String(row.sortOrder),
      isActive: row.isActive,
    })
    setShowModal(true)
  }

  const handleSave = async () => {
    if (!form.name.trim()) {
      showToast("กรุณากรอกชื่อโปรแกรม", "error")
      return
    }

    setSaving(true)
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 20,
        sortOrder: Number(form.sortOrder) || 0,
        productId: form.productId || null,
        apiEndpoint: form.apiEndpoint || null,
        apiKey: form.apiKey || null,
      }

      const res = editing
        ? await fetch(`/api/admin/hwid-programs/${editing.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })
        : await fetch("/api/admin/hwid-programs", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const data = await res.json()
        showToast(data.error ?? "บันทึกไม่สำเร็จ", "error")
        return
      }

      showToast(editing ? "อัปเดตแล้ว" : "เพิ่มโปรแกรมแล้ว")
      setShowModal(false)
      fetchPrograms()
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("ลบโปรแกรมนี้?")) return
    const res = await fetch(`/api/admin/hwid-programs/${id}`, { method: "DELETE" })
    if (res.ok) {
      showToast("ลบแล้ว")
      fetchPrograms()
    } else {
      showToast("ลบไม่สำเร็จ", "error")
    }
  }

  const handleSync = async () => {
    setSyncing(true)
    try {
      const res = await fetch("/api/admin/hwid-programs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "sync-from-products" }),
      })
      const data = await res.json()
      if (!res.ok) {
        showToast(data.error ?? "นำเข้าไม่สำเร็จ", "error")
        return
      }
      showToast(data.message ?? "นำเข้าสำเร็จ")
      fetchPrograms()
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-white">
            <Key className="h-6 w-6" />
            รีเซ็ต HWID
          </h1>
          <p className="mt-1 text-sm text-white/50">
            จัดการโปรแกรมและราคารีเซ็ต — ไม่ใส่ API = ใช้ Key ใน DB โดยตรง
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSync}
            disabled={syncing}
            className={cn(bw.adminBtnGhost, "gap-2")}
          >
            <Download className="h-4 w-4" />
            {syncing ? "กำลังนำเข้า..." : "นำเข้าจากสินค้า"}
          </button>
          <button type="button" onClick={openCreate} className={cn(bw.adminBtnPrimary, "gap-2")}>
            <Plus className="h-4 w-4" />
            เพิ่มโปรแกรม
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-48 animate-pulse rounded-xl bg-white/5" />
      ) : programs.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-white/5 p-10 text-center text-white/50">
          ยังไม่มีโปรแกรม — กด &quot;นำเข้าจากสินค้า&quot; หรือ &quot;เพิ่มโปรแกรม&quot;
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-white/10">
          <table className="w-full text-left text-sm text-white">
            <thead className="border-b border-white/10 bg-white/5 text-white/60">
              <tr>
                <th className="px-4 py-3">โปรแกรม</th>
                <th className="px-4 py-3">ราคา</th>
                <th className="px-4 py-3">API</th>
                <th className="px-4 py-3">รีเซ็ต</th>
                <th className="px-4 py-3">สถานะ</th>
                <th className="px-4 py-3 text-right">จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {programs.map((row) => (
                <tr key={row.id} className="border-b border-white/5 hover:bg-white/[0.03]">
                  <td className="px-4 py-3 font-medium">{row.name}</td>
                  <td className="px-4 py-3">{row.price.toFixed(2)} ฿</td>
                  <td className="px-4 py-3">
                    {row.apiEndpoint ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        API ภายนอก
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-sky-400">
                        <Check className="h-3.5 w-3.5" />
                        Key ใน DB
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-white/60">{row._count?.resets ?? 0}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs",
                        row.isActive
                          ? "bg-emerald-500/15 text-emerald-400"
                          : "bg-white/10 text-white/40"
                      )}
                    >
                      {row.isActive ? "เปิด" : "ปิด"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(row)}
                        className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(row.id)}
                        className="rounded-lg p-2 text-red-400/80 hover:bg-red-500/10 hover:text-red-400"
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
              <h2 className="text-lg font-bold text-white">
                {editing ? "แก้ไขโปรแกรม" : "เพิ่มโปรแกรม"}
              </h2>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-white/60 hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <Field label="ชื่อโปรแกรม">
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className={bw.adminInputPlain}
                  placeholder="เช่น AIMCOLOR รันบนเว็บ"
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="ราคา (฿)">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className={bw.adminInputPlain}
                  />
                </Field>
                <Field label="ลำดับ">
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className={bw.adminInputPlain}
                  />
                </Field>
              </div>
              <Field label="API Endpoint">
                <input
                  value={form.apiEndpoint}
                  onChange={(e) => setForm({ ...form, apiEndpoint: e.target.value })}
                  className={bw.adminInputPlain}
                  placeholder="https://your-api.com/reset-hwid (ว่าง = ใช้ Key ใน DB)"
                />
              </Field>
              <Field label="API Key">
                <input
                  type="password"
                  value={form.apiKey}
                  onChange={(e) => setForm({ ...form, apiKey: e.target.value })}
                  className={bw.adminInputPlain}
                  placeholder={editing?.apiKey ? "•••••••• (เว้นว่าง = ไม่เปลี่ยน)" : "sk-..."}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Header สำหรับ Key">
                  <input
                    value={form.apiKeyHeader}
                    onChange={(e) => setForm({ ...form, apiKeyHeader: e.target.value })}
                    className={bw.adminInputPlain}
                    placeholder="Authorization"
                  />
                </Field>
                <Field label="ชื่อ field License">
                  <input
                    value={form.licenseKeyField}
                    onChange={(e) => setForm({ ...form, licenseKeyField: e.target.value })}
                    className={bw.adminInputPlain}
                    placeholder="license"
                  />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-sm text-white/80">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded"
                />
                เปิดใช้งาน
              </label>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className={bw.adminBtnGhost}
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className={bw.adminBtnPrimary}
              >
                {saving ? "กำลังบันทึก..." : "บันทึก"}
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

function Field({
  label,
  children,
}: {
  label: string
  children: ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-white/50">{label}</span>
      {children}
    </label>
  )
}
