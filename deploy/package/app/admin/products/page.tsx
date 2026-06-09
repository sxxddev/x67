"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Package,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Check,
  Tag,
  Boxes,
  Percent,
  Sparkles,
  Upload,
  Eye,
  Copy,
  AlertCircle,
  GripVertical,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { formatStockLine } from "@/lib/parse-stock-input"

interface Category {
  id: string
  name: string
}

interface StockItem {
  id: string
  accountEmail: string
  accountPass: string
  accountData?: string | null
  status: "AVAILABLE" | "SOLD" | "RESERVED"
  createdAt: string
  order?: { id: number; userId: number; createdAt: string } | null
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  discount: number
  image: string | null
  categoryId: string
  category?: Category
  isUnlimited: boolean
  generatesLicenseKey?: boolean
  pointsEarn: number
  isHot: boolean
  badge: string | null
  isActive: boolean
  createdAt: string
  stockCount?: number
  _count?: { orders: number; productStock: number }
  options?: ProductOptionRow[]
}

type ProductOptionRow = {
  id?: string
  label: string
  days: string
  price: string
  stockCount: string
  isActive: boolean
}

const emptyOption = (): ProductOptionRow => ({
  label: "",
  days: "",
  price: "",
  stockCount: "0",
  isActive: true,
})

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  discount: "",
  image: "",
  categoryId: "",
  isUnlimited: false,
  generatesLicenseKey: false,
  pointsEarn: "0",
  isHot: false,
  badge: "",
  isActive: true,
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showStockModal, setShowStockModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [formData, setFormData] = useState(emptyProduct)
  const [formOptions, setFormOptions] = useState<ProductOptionRow[]>([])
  const [stockInput, setStockInput] = useState("")
  const [saving, setSaving] = useState(false)
  const [search, setSearch] = useState("")
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const fetchData = useCallback(async () => {
    try {
      const [resProducts, resCategories] = await Promise.all([
        fetch("/api/admin/products"),
        fetch("/api/admin/categories")
      ])
      
      if (resProducts.ok) {
        setProducts(await resProducts.json())
      }
      if (resCategories.ok) {
        const cats = await resCategories.json()
        setCategories(cats)
        if (cats.length > 0 && formData.categoryId === "") {
          setFormData(prev => ({ ...prev, categoryId: cats[0].id }))
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error)
    } finally {
      setLoading(false)
    }
  }, [formData.categoryId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImage(true)
    try {
      const body = new FormData()
      body.append("file", file)
      const res = await fetch("/api/admin/upload-image", { method: "POST", body })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Upload failed")
      setFormData((prev) => ({ ...prev, image: data.url }))
      showToast("อัปโหลดรูปแล้ว — เก็บบนเซิร์ฟเวอร์ถาวร")
    } catch (err) {
      showToast(err instanceof Error ? err.message : "อัปโหลดไม่สำเร็จ", "error")
    } finally {
      setUploadingImage(false)
      e.target.value = ""
    }
  }

  const isDiscordImage = (url: string) =>
    /cdn\.discordapp\.com|media\.discordapp\.net/i.test(url)

  const handleCreate = () => {
    setEditingProduct(null)
    setFormData({
      ...emptyProduct,
      categoryId: categories.length > 0 ? categories[0].id : ""
    })
    setFormOptions([])
    setShowModal(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      discount: product.discount?.toString() || "0",
      image: product.image || "",
      categoryId: product.categoryId,
      isUnlimited: product.isUnlimited,
      generatesLicenseKey: product.generatesLicenseKey ?? false,
      pointsEarn: product.pointsEarn.toString(),
      isHot: product.isHot,
      badge: product.badge || "",
      isActive: product.isActive,
    })
    setFormOptions(
      (product.options ?? []).map((o) => ({
        id: o.id,
        label: o.label,
        days: o.days != null ? String(o.days) : "",
        price: String(o.price),
        stockCount: String(o.stockCount),
        isActive: o.isActive,
      }))
    )
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("คุณแน่ใจที่จะลบสินค้านี้? สต็อกทั้งหมดจะถูกลบด้วย")) return
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" })
      if (res.ok) {
        showToast("ลบสินค้าสำเร็จ")
        fetchData()
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const url = editingProduct
        ? `/api/admin/products/${editingProduct.id}`
        : "/api/admin/products"
      const method = editingProduct ? "PUT" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          options: formOptions
            .filter((o) => o.label.trim() && o.price.trim())
            .map((o, index) => ({
              id: o.id,
              label: o.label.trim(),
              days: o.days.trim() ? parseInt(o.days, 10) : null,
              price: parseFloat(o.price),
              stockCount: parseInt(o.stockCount || "0", 10) || 0,
              sortOrder: index,
              isActive: o.isActive,
            })),
        }),
      })

      if (res.ok) {
        showToast(editingProduct ? "อัพเดทสินค้าสำเร็จ" : "เพิ่มสินค้าสำเร็จ")
        setShowModal(false)
        fetchData()
      } else {
        const data = await res.json().catch(() => ({}))
        showToast(
          typeof data.error === "string" ? data.error : "เกิดข้อผิดพลาด",
          "error"
        )
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleManageStock = async (product: Product) => {
    setSelectedProduct(product)
    setStockInput("")
    setShowStockModal(true)
    
    try {
      const res = await fetch(`/api/admin/products/${product.id}/stock`)
      if (res.ok) {
        setStockItems(await res.json())
      }
    } catch {
      showToast("ไม่สามารถโหลดสต็อกได้", "error")
    }
  }

  const handleAddStock = async () => {
    if (!selectedProduct || !stockInput.trim()) {
      showToast("กรุณาใส่ข้อมูลสต็อก", "error")
      return
    }
    setSaving(true)

    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: stockInput }),
      })

      if (res.ok) {
        const result = await res.json()
        showToast(`เพิ่มสต็อกสำเร็จ ${result.count} รายการ`)
        setStockInput("")
        handleManageStock(selectedProduct)
        fetchData()
      } else {
        const err = await res.json().catch(() => ({}))
        showToast(err.error || "เพิ่มสต็อกไม่สำเร็จ", "error")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteStock = async (stockId: string) => {
    if (!selectedProduct) return
    if (!confirm("ลบสต็อกนี้?")) return

    try {
      const res = await fetch(`/api/admin/products/${selectedProduct.id}/stock?stockId=${stockId}`, {
        method: "DELETE",
      })

      if (res.ok) {
        showToast("ลบสต็อกสำเร็จ")
        handleManageStock(selectedProduct)
        fetchData()
      } else {
        const err = await res.json()
        showToast(err.error || "ไม่สามารถลบได้", "error")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด", "error")
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    showToast("คัดลอกแล้ว")
  }

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category?.name.toLowerCase().includes(search.toLowerCase())
  )

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
          <h1 className="text-2xl font-bold tracking-tight text-foreground">คลังสินค้า</h1>
          <p className="text-sm text-muted-foreground mt-1">จัดการสินค้า สต็อกบัญชี และโปรโมชั่น</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" />
          เพิ่มสินค้าใหม่
        </button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">สินค้าทั้งหมด</span>
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div className="text-3xl font-black text-foreground">{products.length}</div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">สต็อกพร้อมขาย</span>
            <Boxes className="h-5 w-5 text-success" />
          </div>
          <div className="text-3xl font-black text-foreground">
            {products.reduce((sum, p) => sum + (p.stockCount || 0), 0)}
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 border-l-4 border-l-destructive">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">สินค้า HOT</span>
            <Sparkles className="h-5 w-5 text-destructive" />
          </div>
          <div className="text-3xl font-black text-foreground">{products.filter(p => p.isHot).length}</div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-muted-foreground" />
        </div>
        <input
          type="text"
          placeholder="ค้นหาสินค้า หรือหมวดหมู่..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-input py-2.5 pl-10 pr-4 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-shadow outline-none placeholder:text-muted-foreground"
        />
      </div>

      {/* Products Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">สินค้า</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">หมวดหมู่</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">สต็อก</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">ราคา</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">สถานะ</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-muted-foreground uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-muted/30 transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-border bg-muted flex-shrink-0">
                      <img
                        src={product.image || "https://placehold.jp/1a1a2e/ffffff/100x100.png?text=No+Image"}
                        alt={product.name}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate max-w-[200px]">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        {product.isHot && (
                          <span className="inline-flex rounded-full bg-destructive/20 px-2 py-0.5 text-[10px] font-bold text-destructive tracking-wide badge-hot">
                            HOT
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground">ขายแล้ว {product._count?.orders || 0}</span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
                    <Tag className="h-3 w-3" />
                    {product.category?.name || "ไม่ระบุ"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button
                    onClick={() => handleManageStock(product)}
                    className="flex items-center gap-2 group/stock"
                  >
                    <Boxes className={cn(
                      "h-4 w-4",
                      product.isUnlimited ? "text-primary" : ((product.stockCount || 0) > 0 ? "text-success" : "text-destructive")
                    )} />
                    <span className={cn(
                      "text-sm font-semibold group-hover/stock:underline",
                      product.isUnlimited ? "text-primary" : ((product.stockCount || 0) > 0 ? "text-success" : "text-destructive")
                    )}>
                      {product.isUnlimited ? "ไม่จำกัด" : `${product.stockCount || 0} ชิ้น`}
                    </span>
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    {product.options && product.options.filter((o) => o.isActive).length > 0 ? (
                      <>
                        <span className="text-sm font-bold text-foreground">
                          ฿{Math.min(...product.options.filter((o) => o.isActive).map((o) => o.price)).toFixed(0)}
                          {" - "}
                          ฿{Math.max(...product.options.filter((o) => o.isActive).map((o) => o.price)).toFixed(0)}
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          {product.options.filter((o) => o.isActive).length} ตัวเลือก
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-foreground">฿{product.price.toFixed(0)}</span>
                          {product.discount > 0 && (
                            <span className="text-xs font-medium text-muted-foreground line-through">
                              ฿{(product.price / (1 - product.discount / 100)).toFixed(0)}
                            </span>
                          )}
                        </div>
                        {product.discount > 0 && (
                          <span className="text-[10px] font-bold text-success mt-0.5 inline-flex items-center gap-0.5">
                            <Percent className="h-2.5 w-2.5" />
                            ลด {product.discount}%
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex rounded-full px-3 py-1.5 text-xs font-bold",
                    product.isActive
                      ? "bg-success/20 text-success"
                      : "bg-muted text-muted-foreground"
                  )}>
                    {product.isActive ? "เปิดขาย" : "ปิดขาย"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleManageStock(product)}
                      className="rounded-xl p-2.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title="จัดการสต็อก"
                    >
                      <Boxes className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleEdit(product)}
                      className="rounded-xl p-2.5 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                      title="แก้ไข"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="rounded-xl p-2.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      title="ลบ"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted border-2 border-dashed border-border">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <p className="mt-4 text-sm font-medium text-foreground">ไม่พบสินค้า</p>
                  <p className="mt-1 text-xs text-muted-foreground">ลองค้นหาด้วยคำอื่น หรือเพิ่มสินค้าใหม่</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          
          <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">
                    {editingProduct ? "แก้ไขสินค้า" : "เพิ่มสินค้าใหม่"}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {editingProduct ? "แก้ไขรายละเอียดสินค้า" : "กรอกข้อมูลสินค้าใหม่"}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowModal(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ข้อมูลทั่วไป</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">ชื่อสินค้า *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="เช่น Netflix Premium 30 วัน"
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">หมวดหมู่ *</label>
                    <select
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    >
                      <option value="">เลือกหมวดหมู่</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2 space-y-2">
                    <label className="text-sm font-semibold text-foreground">รูปภาพสินค้า</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border bg-input px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted">
                        <Upload className="h-4 w-4" />
                        {uploadingImage ? "กำลังอัปโหลด..." : "อัปโหลดรูป (แนะนำ)"}
                        <input
                          type="file"
                          accept="image/png,image/jpeg,image/webp,image/gif"
                          className="hidden"
                          disabled={uploadingImage}
                          onChange={handleImageUpload}
                        />
                      </label>
                      <span className="text-xs text-muted-foreground">หรือวาง URL ด้านล่าง</span>
                    </div>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      placeholder="https://... หรือ /uploads/products/..."
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                    {formData.image.trim() && isDiscordImage(formData.image) ? (
                      <p className="flex items-start gap-2 text-xs text-amber-400">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        ลิงก์ Discord หมดอายุได้ — ลูกค้าบางคนจะไม่เห็นรูป กรุณากดอัปโหลดรูปแทน
                      </p>
                    ) : null}
                    {formData.image.trim() ? (
                      <div className="overflow-hidden rounded-xl border border-border bg-zinc-900">
                        <img
                          src={formData.image.trim()}
                          alt="preview"
                          className="h-40 w-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    ) : null}
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">รายละเอียด</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                      placeholder="รายละเอียดสินค้า..."
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Pricing */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">ราคา</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">ราคาขาย (บาท) *</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm font-bold text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">ส่วนลด (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                      className="w-full rounded-xl border border-success/30 bg-success/5 px-4 py-3 text-sm font-bold text-success focus:border-success focus:ring-1 focus:ring-success outline-none"
                      placeholder="0"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-foreground">แต้มที่ได้รับ</label>
                    <input
                      type="number"
                      min="0"
                      value={formData.pointsEarn}
                      onChange={(e) => setFormData({ ...formData, pointsEarn: e.target.value })}
                      className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Product options (duration tiers) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      ตัวเลือกสินค้า (วัน / ราคา)
                    </h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      เช่น 1 วัน, 7 วัน, ถาวร — ว่างไว้ถ้าใช้ราคาเดียว
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFormOptions((prev) => [...prev, emptyOption()])}
                    className="inline-flex items-center gap-1 rounded-lg border border-border bg-muted/50 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    เพิ่มตัวเลือก
                  </button>
                </div>

                {formOptions.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
                    ยังไม่มีตัวเลือก — ใช้ราคาเดียวจากด้านบน
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formOptions.map((opt, index) => (
                      <div
                        key={opt.id ?? `new-${index}`}
                        className="rounded-xl border border-border bg-muted/20 p-4 space-y-3"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground">
                            <GripVertical className="h-3.5 w-3.5" />
                            ตัวเลือก #{index + 1}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setFormOptions((prev) => prev.filter((_, i) => i !== index))
                            }
                            className="rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                          <div className="col-span-2 space-y-1">
                            <label className="text-xs font-semibold text-foreground">ชื่อตัวเลือก *</label>
                            <input
                              type="text"
                              value={opt.label}
                              onChange={(e) => {
                                const v = e.target.value
                                setFormOptions((prev) =>
                                  prev.map((row, i) => (i === index ? { ...row, label: v } : row))
                                )
                              }}
                              placeholder="เช่น 1 วัน, ถาวร"
                              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">จำนวนวัน</label>
                            <input
                              type="number"
                              min="0"
                              value={opt.days}
                              onChange={(e) => {
                                const v = e.target.value
                                setFormOptions((prev) =>
                                  prev.map((row, i) => (i === index ? { ...row, days: v } : row))
                                )
                              }}
                              placeholder="ว่าง = ถาวร"
                              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">ราคา (฿) *</label>
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              value={opt.price}
                              onChange={(e) => {
                                const v = e.target.value
                                setFormOptions((prev) =>
                                  prev.map((row, i) => (i === index ? { ...row, price: v } : row))
                                )
                              }}
                              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm font-bold"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-foreground">สต็อกตัวเลือก</label>
                            <input
                              type="number"
                              min="0"
                              value={opt.stockCount}
                              onChange={(e) => {
                                const v = e.target.value
                                setFormOptions((prev) =>
                                  prev.map((row, i) => (i === index ? { ...row, stockCount: v } : row))
                                )
                              }}
                              className="w-full rounded-lg border border-border bg-input px-3 py-2 text-sm"
                            />
                          </div>
                          <label className="col-span-2 flex items-center gap-2 rounded-lg border border-border bg-input px-3 py-2 cursor-pointer sm:col-span-4">
                            <input
                              type="checkbox"
                              checked={opt.isActive}
                              onChange={(e) => {
                                const v = e.target.checked
                                setFormOptions((prev) =>
                                  prev.map((row, i) => (i === index ? { ...row, isActive: v } : row))
                                )
                              }}
                              className="h-4 w-4 rounded"
                            />
                            <span className="text-sm text-foreground">เปิดขายตัวเลือกนี้</span>
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-px bg-border" />

              {/* Status */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">สถานะ</h3>
                <div className="flex flex-wrap gap-4">
                  <label className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                    formData.isActive ? "border-success/50 bg-success/10" : "border-border bg-muted/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="h-5 w-5 rounded-md border-border text-success focus:ring-success/20"
                    />
                    <div>
                      <p className={cn("text-sm font-bold", formData.isActive ? "text-success" : "text-foreground")}>เปิดขาย</p>
                      <p className="text-xs text-muted-foreground">แสดงบนหน้าร้าน</p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                    formData.isHot ? "border-destructive/50 bg-destructive/10" : "border-border bg-muted/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.isHot}
                      onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                      className="h-5 w-5 rounded-md border-border text-destructive focus:ring-destructive/20"
                    />
                    <div>
                      <p className={cn("text-sm font-bold", formData.isHot ? "text-destructive" : "text-foreground")}>HOT</p>
                      <p className="text-xs text-muted-foreground">ติดป้ายยอดนิยม</p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                    formData.isUnlimited ? "border-primary/50 bg-primary/10" : "border-border bg-muted/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.isUnlimited}
                      onChange={(e) => setFormData({ ...formData, isUnlimited: e.target.checked })}
                      className="h-5 w-5 rounded-md border-border text-primary focus:ring-primary/20"
                    />
                    <div>
                      <p className={cn("text-sm font-bold", formData.isUnlimited ? "text-primary" : "text-foreground")}>ไม่จำกัดสต็อก</p>
                      <p className="text-xs text-muted-foreground">ขายได้ไม่จำกัด</p>
                    </div>
                  </label>

                  <label className={cn(
                    "flex flex-1 items-center gap-3 rounded-xl border p-4 cursor-pointer transition-all",
                    formData.generatesLicenseKey ? "border-sky-500/50 bg-sky-500/10" : "border-border bg-muted/50"
                  )}>
                    <input
                      type="checkbox"
                      checked={formData.generatesLicenseKey}
                      onChange={(e) =>
                        setFormData({ ...formData, generatesLicenseKey: e.target.checked })
                      }
                      className="h-5 w-5 rounded-md border-border text-sky-500 focus:ring-sky-500/20"
                    />
                    <div>
                      <p className={cn("text-sm font-bold", formData.generatesLicenseKey ? "text-sky-400" : "text-foreground")}>สร้าง License Key</p>
                      <p className="text-xs text-muted-foreground">ออก Key อัตโนมัติเมื่อซื้อ (ไม่ใช้สต็อกบัญชี)</p>
                    </div>
                  </label>
                </div>
              </div>
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
                {saving ? "กำลังบันทึก..." : editingProduct ? "บันทึก" : "สร้างสินค้า"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock Modal */}
      {showStockModal && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setShowStockModal(false)} />
          
          <div className="relative w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="border-b border-border bg-muted/50 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-foreground">จัดการสต็อก</h2>
                  <p className="text-sm text-muted-foreground">{selectedProduct.name}</p>
                </div>
              </div>
              <button onClick={() => setShowStockModal(false)} className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Add Stock */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  เพิ่มสต็อกใหม่
                </h3>
                <div className="space-y-2">
                  <textarea
                    value={stockInput}
                    onChange={(e) => setStockInput(e.target.value)}
                    rows={5}
                    placeholder={
                      "วางได้ทุกรูปแบบ\n\nkey: ... + download: ... (หลายบรรทัดติดกัน) = 1 ชิ้น\nคั่นด้วยบรรทัดว่าง = หลายชิ้น\nหลายแถว email:password ติดกัน = หลายชิ้น"
                    }
                    className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground font-mono focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none"
                  />
                  <button
                    onClick={handleAddStock}
                    disabled={saving || !stockInput.trim()}
                    className="flex items-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-success-foreground hover:bg-success/90 transition-all disabled:opacity-50"
                  >
                    <Plus className="h-4 w-4" />
                    {saving ? "กำลังเพิ่ม..." : "เพิ่มสต็อก"}
                  </button>
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Stock List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  รายการสต็อก ({stockItems.length})
                </h3>
                
                {stockItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Boxes className="h-12 w-12 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">ยังไม่มีสต็อก</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {stockItems.map((item) => (
                      <div
                        key={item.id}
                        className={cn(
                          "rounded-xl border p-3 space-y-2",
                          item.status === "AVAILABLE" ? "border-success/30 bg-success/5" : "border-muted bg-muted/30"
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              "text-xs font-bold px-2 py-0.5 rounded-full",
                              item.status === "AVAILABLE" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                            )}>
                              {item.status === "AVAILABLE" ? "พร้อมขาย" : item.status === "SOLD" ? "ขายแล้ว" : "จอง"}
                            </span>
                            {item.order && (
                              <span className="text-xs text-muted-foreground">
                                Order #{item.order.id}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              onClick={() => copyToClipboard(formatStockLine(item))}
                              className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                              title="คัดลอก"
                            >
                              <Copy className="h-4 w-4" />
                            </button>
                            {item.status === "AVAILABLE" && (
                              <button
                                onClick={() => handleDeleteStock(item.id)}
                                className="rounded-lg p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                title="ลบ"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                        <pre className="rounded-lg bg-black px-3 py-2.5 font-mono text-xs leading-relaxed text-white whitespace-pre-wrap break-words">
                          {formatStockLine(item)}
                        </pre>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
