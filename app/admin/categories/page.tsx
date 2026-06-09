"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Check,
  ImageIcon,
  Star,
  ArrowUpDown,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"
import {
  CATEGORY_BANNER_HEIGHT,
  CATEGORY_BANNER_WIDTH,
  categoryBannerSizeClass,
} from "@/lib/category-grid-layout"

interface CategoryData {
  id: string
  name: string
  image: string | null
  isFeatured: boolean
  order: number
  createdAt: string
  _count?: { products: number }
}

const emptyForm = {
  name: "",
  image: "",
  isFeatured: false,
  order: "0",
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryData[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryData | null>(
    null
  )
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<{ msg: string; type?: "error" } | null>(
    null
  )

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/categories")
      if (res.ok) {
        const data = await res.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCategories()
    const interval = setInterval(fetchCategories, 10000)
    return () => clearInterval(interval)
  }, [fetchCategories])

  const showToast = (msg: string, type?: "error") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 3000)
  }

  const openCreate = () => {
    setEditingCategory(null)
    setForm(emptyForm)
    setShowModal(true)
  }

  const handleEdit = (category: CategoryData) => {
    setEditingCategory(category)
    setForm({
      name: category.name,
      image: category.image || "",
      isFeatured: category.isFeatured,
      order: String(category.order ?? 0),
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (
      !confirm(
        "คุณแน่ใจที่จะลบหมวดหมู่นี้? สินค้าที่อยู่ในหมวดหมู่นี้จะถูกลบด้วย"
      )
    )
      return
    try {
      const res = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        showToast("ลบหมวดหมู่สำเร็จ")
        fetchCategories()
      } else {
        const data = await res.json()
        showToast(data.error || "เกิดข้อผิดพลาด", "error")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)

    try {
      const url = editingCategory
        ? `/api/admin/categories/${editingCategory.id}`
        : "/api/admin/categories"
      const method = editingCategory ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          image: form.image.trim() || null,
          isFeatured: form.isFeatured,
          order: parseInt(form.order, 10) || 0,
        }),
      })

      if (res.ok) {
        showToast(editingCategory ? "แก้ไขสำเร็จ" : "เพิ่มหมวดหมู่สำเร็จ")
        setShowModal(false)
        setForm(emptyForm)
        setEditingCategory(null)
        fetchCategories()
      } else {
        const data = await res.json()
        showToast(data.error || "เกิดข้อผิดพลาด", "error")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setSaving(false)
    }
  }

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-right-4 duration-300">
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-2xl",
              toast.type === "error" ? "bg-red-900" : "bg-gray-900"
            )}
          >
            <Check className="h-4 w-4 text-emerald-400" />
            {toast.msg}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className={bw.adminIconBox}>
            <Tags className="h-6 w-6" />
          </div>
          <div>
            <h1 className={bw.adminPageTitle}>จัดการหมวดหมู่</h1>
            <p className={bw.adminPageSubtitle}>
              ชื่อ + รูปแบนเนอร์ สำหรับหน้าร้าน (รายการหมวดหมู่)
            </p>
          </div>
        </div>
        <button onClick={openCreate} className={bw.adminBtnPrimary}>
          <Plus className="h-4 w-4" />
          เพิ่มหมวดหมู่ใหม่
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={cn(bw.adminCard, "p-6")}>
          <div className="mb-2 flex items-center justify-between">
            <span className={bw.adminLabel}>หมวดหมู่ทั้งหมด</span>
            <Tags className="h-5 w-5 text-white/70" />
          </div>
          <div className="text-3xl font-black text-white">{categories.length}</div>
        </div>
        <div className={cn(bw.adminCard, "p-6")}>
          <div className="mb-2 flex items-center justify-between">
            <span className={bw.adminLabel}>แนะนำ (Featured)</span>
            <Star className="h-5 w-5 text-red-400" />
          </div>
          <div className="text-3xl font-black text-white">
            {categories.filter((c) => c.isFeatured).length}
          </div>
        </div>
      </div>

      <div className={bw.adminTable}>
        <div className="border-b border-white/10 bg-white/5 p-4">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              placeholder="ค้นหาหมวดหมู่..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={bw.adminInput}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className={bw.adminTableHead}>
                <th className={bw.adminTh}>รูป / ชื่อ</th>
                <th className={bw.adminTh}>ลำดับ</th>
                <th className={bw.adminTh}>สินค้า</th>
                <th className={cn(bw.adminTh, "text-right")}>เครื่องมือ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className={bw.adminSpinner} />
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-white/40">
                    ไม่พบข้อมูลหมวดหมู่
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr key={category.id} className={bw.adminRow}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="h-14 w-24 shrink-0 overflow-hidden rounded-lg border border-white/10 bg-black">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-white/25">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-black text-white">
                              {category.name}
                            </span>
                            {category.isFeatured && (
                              <Star className="h-3.5 w-3.5 fill-red-500 text-red-500" />
                            )}
                          </div>
                          <div className="max-w-[200px] truncate text-[10px] text-white/40">
                            {category.image || "ไม่มีรูป"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white/70">
                      {category.order}
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-white/70">
                      {category._count?.products ?? 0}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleEdit(category)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/55 hover:bg-white/20"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(category.id)}
                          className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-white/55 hover:bg-red-500/20 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-200">
            <div className={cn(bw.adminCard, "overflow-hidden p-8")}>
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-black text-white">
                  {editingCategory ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่ใหม่"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg p-2 text-white/45 hover:bg-white/10"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className={bw.adminLabel}>ชื่อหมวดหมู่</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="เช่น FIVEM GAME, ROBLOX..."
                    className={bw.adminInputPlain}
                  />
                </div>

                <div className="space-y-2">
                  <label className={bw.adminLabel}>
                    รูปแบนเนอร์ (URL)
                  </label>
                  <input
                    type="url"
                    value={form.image}
                    onChange={(e) =>
                      setForm({ ...form, image: e.target.value })
                    }
                    placeholder={`https://... แนะนำ ${CATEGORY_BANNER_WIDTH}×${CATEGORY_BANNER_HEIGHT}px`}
                    className={bw.adminInputPlain}
                  />
                  {form.image.trim() && (
                    <div className="overflow-hidden rounded-xl border border-white/10">
                      <img
                        src={form.image.trim()}
                        alt="preview"
                        className={cn(categoryBannerSizeClass, "max-w-full object-cover")}
                        onError={(e) => {
                          ;(e.target as HTMLImageElement).style.display =
                            "none"
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className={bw.adminLabel}>ลำดับแสดง</label>
                    <input
                      type="number"
                      min={0}
                      value={form.order}
                      onChange={(e) =>
                        setForm({ ...form, order: e.target.value })
                      }
                      className={bw.adminInputPlain}
                    />
                  </div>
                  <label
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 mt-6",
                      form.isFeatured
                        ? "border-red-500/50 bg-red-500/10"
                        : "border-white/15 bg-white/5"
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={form.isFeatured}
                      onChange={(e) =>
                        setForm({ ...form, isFeatured: e.target.checked })
                      }
                      className="h-4 w-4 rounded"
                    />
                    <span className="flex items-center gap-1 text-sm font-bold text-white">
                      <Star className="h-4 w-4 text-red-400" />
                      แนะนำ
                    </span>
                  </label>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className={cn("flex-1", bw.adminBtnGhost)}
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className={cn("flex-1", bw.adminBtnPrimary)}
                  >
                    {saving
                      ? "กำลังบันทึก..."
                      : editingCategory
                        ? "บันทึก"
                        : "เพิ่มหมวดหมู่"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
