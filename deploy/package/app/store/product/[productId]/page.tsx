"use client"

import { useEffect, useState, use } from "react"
import Link from "next/link"
import { notFound, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { SitePageShell } from "@/components/site-page-shell"
import { TransitionLink } from "@/components/transition-link"
import { CategoryProductCard } from "@/components/store/category-product-card"
import { ProductOptionGrid } from "@/components/store/product-option-grid"
import { 
  ArrowLeft, ShoppingBag, Minus, Plus, 
  Check, AlertCircle, Copy, X, Sparkles, Gift, ShieldCheck, ChevronRight
} from "lucide-react"
import { bw } from "@/lib/bw-theme"
import { ProductImage } from "@/components/product-image"
import { cn } from "@/lib/utils"
import { formatStockDeliveryItem } from "@/lib/parse-stock-input"
import { productGridLayoutClass } from "@/lib/product-card-layout"
import {
  productDetailShellClass,
  productDetailWindowClass,
  productDetailWindowBodyClass,
  productDetailImageClass,
  productDetailSecurityClass,
  productDetailPanelClass,
} from "@/lib/product-detail-layout"
import { stripHtmlToText } from "@/lib/strip-html"
import type { StoreProductCardData } from "@/lib/store-product-serializer"
import type { ProductOptionData } from "@/lib/product-options"
import {
  applyProductDiscount,
  computeOptionPriceRange,
  computeOptionsTotalStock,
} from "@/lib/product-options"

const panel = cn(
  bw.panel,
  "shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)]"
)

interface Product {
  id: string
  name: string
  description: string
  price: number
  discount?: number | null
  image: string | null
  categoryId: string
  category?: { id: string; name: string }
  stockCount: number
  soldCount?: number
  options?: ProductOptionData[]
  isUnlimited: boolean
  pointsEarn: number
  isHot: boolean
}

interface StockItem {
  email: string
  password: string
  data?: string | null
}

interface ProductPageProps {
  params: Promise<{ productId: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const { productId } = use(params)
  const { data: session, status, update: updateSession } = useSession()
  const router = useRouter()
  
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<StoreProductCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null)
  
  // Purchase state
  const [quantity, setQuantity] = useState(1)
  const [couponCode, setCouponCode] = useState("")
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [couponValid, setCouponValid] = useState<boolean | null>(null)
  const [validatingCoupon, setValidatingCoupon] = useState(false)
  
  // Modal state
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [purchasing, setPurchasing] = useState(false)
  const [purchaseResult, setPurchaseResult] = useState<{
    order: any
    stockItems: StockItem[]
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const isAuthenticated = status === "authenticated"
  const user = session?.user

  useEffect(() => {
    fetch(`/api/products/${productId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found")
        return res.json()
      })
      .then((data) => setProduct(data))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false))
  }, [productId])

  useEffect(() => {
    if (!product?.categoryId) return
    fetch(`/api/store/category/${product.categoryId}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data?.products) return
        setRelatedProducts(
          data.products.filter((p: StoreProductCardData) => p.id !== product.id).slice(0, 8)
        )
      })
      .catch(() => setRelatedProducts([]))
  }, [product?.categoryId, product?.id])

  if (loading) {
    return (
      <SitePageShell mainClassName="items-center justify-center">
        <div className={bw.adminSpinner} />
      </SitePageShell>
    )
  }

  if (!product) {
    notFound()
  }

  const category = product.category
  const activeOptions = (product.options ?? []).filter((o) => o.isActive)
  const hasOptions = activeOptions.length > 0
  const selectedOption = activeOptions.find((o) => o.id === selectedOptionId) ?? null
  const priceRange = hasOptions
    ? computeOptionPriceRange(activeOptions, product.discount)
    : null

  const unitPrice = selectedOption
    ? applyProductDiscount(selectedOption.price, product.discount)
    : product.discount && product.discount > 0
      ? product.price * (1 - product.discount / 100)
      : product.price

  const optionStock = hasOptions
    ? computeOptionsTotalStock(activeOptions, product.isUnlimited)
    : product.stockCount

  const availableStock = selectedOption
    ? product.isUnlimited
      ? selectedOption.stockCount
      : Math.min(selectedOption.stockCount, product.stockCount)
    : product.isUnlimited
      ? 999
      : hasOptions
        ? optionStock
        : product.stockCount

  const subtotal = unitPrice * quantity
  const totalPrice = subtotal - couponDiscount
  const pointsEarned = product.pointsEarn * quantity
  const maxQuantity = product.isUnlimited
    ? selectedOption
      ? Math.min(5, Math.max(1, selectedOption.stockCount))
      : 5
    : Math.min(5, Math.max(0, availableStock))
  const allOptionsOut =
    hasOptions && activeOptions.every((o) => o.stockCount <= 0)
  const isOutOfStock = hasOptions
    ? allOptionsOut && (!product.isUnlimited && product.stockCount === 0)
    : !product.isUnlimited && product.stockCount === 0
  const needsOption = hasOptions && !selectedOptionId
  const selectedOptionOut = selectedOption != null && selectedOption.stockCount <= 0
  const canPurchase = !isOutOfStock && !needsOption && !selectedOptionOut && maxQuantity > 0
  const soldCount = product.soldCount ?? 0
  const descriptionText = stripHtmlToText(product.description || "", 2000)
  const descriptionPreview = stripHtmlToText(product.description || "", 180)
  const hasLongDescription = descriptionText.length > 180

  const handleSelectOption = (id: string) => {
    setSelectedOptionId(id)
    setQuantity(1)
    setCouponValid(null)
    setCouponDiscount(0)
  }

  const handleQuantityChange = (delta: number) => {
    const newQty = quantity + delta
    if (newQty >= 1 && newQty <= maxQuantity) {
      setQuantity(newQty)
      if (couponValid) {
        validateCoupon()
      }
    }
  }

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponDiscount(0)
      setCouponValid(null)
      return
    }

    setValidatingCoupon(true)
    try {
      const res = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, totalPrice: subtotal }),
      })

      const data = await res.json()
      if (res.ok && data.isValid) {
        setCouponDiscount(data.discount)
        setCouponValid(true)
      } else {
        setCouponDiscount(0)
        setCouponValid(false)
        setError(data.error || "คูปองไม่ถูกต้อง")
        setTimeout(() => setError(null), 3000)
      }
    } catch {
      setCouponDiscount(0)
      setCouponValid(false)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const handlePurchase = () => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }
    setShowConfirmModal(true)
  }

  const confirmPurchase = async () => {
    setPurchasing(true)
    setError(null)

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          couponCode: couponValid ? couponCode : undefined,
          optionId: selectedOptionId ?? undefined,
        }),
      })

      const data = await res.json()
      
      if (res.ok && data.success) {
        setPurchaseResult(data)
        setShowConfirmModal(false)
        setShowSuccessModal(true)
        await updateSession()
      } else {
        setError(data.error || "เกิดข้อผิดพลาดในการสั่งซื้อ")
      }
    } catch {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ")
    } finally {
      setPurchasing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <SitePageShell>
        {error && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/15 px-4 py-3 text-red-200 shadow-xl backdrop-blur-md animate-in slide-in-from-right">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}

        <div className={cn(productDetailShellClass(), "py-6 sm:py-8")}>
          <TransitionLink
            href={`/store/category/${product.categoryId}`}
            className="mb-4 inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 transition-colors hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            ย้อนกลับ
          </TransitionLink>

          <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-sm text-white/45">
            <Link href="/" className="transition-colors hover:text-white">
              หน้าแรก
            </Link>
            <span>/</span>
            <Link
              href={`/store/category/${product.categoryId}`}
              className="transition-colors hover:text-white"
            >
              {category?.name || "ทั่วไป"}
            </Link>
            <span>/</span>
            <span className="text-white/80">{product.name}</span>
          </nav>

          <div className={productDetailWindowClass()}>
            <div className={productDetailWindowBodyClass()}>
            {/* Left: image + security */}
            <div className="flex w-[584px] max-w-full shrink-0 flex-col items-center gap-4">
              <div className={productDetailImageClass()}>
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="eager"
                />
                {product.isHot && (
                  <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-white px-2.5 py-1 text-xs font-bold text-black">
                    <Sparkles className="h-3 w-3" />
                    HOT
                  </div>
                )}
                {(product.discount ?? 0) > 0 && (
                  <div className="absolute left-3 top-3 rounded-full bg-emerald-500 px-2.5 py-1 text-xs font-bold text-white">
                    -{product.discount}%
                  </div>
                )}
              </div>

              <div className={productDetailSecurityClass()}>
                <div className="mb-2 flex items-center gap-2 text-sm text-white/60">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  ระบบความปลอดภัย
                </div>
                <div className="flex h-10 items-center justify-center rounded-xl border border-emerald-500/30 bg-emerald-500/15 text-sm font-semibold text-emerald-400">
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  ปลอดภัย
                </div>
              </div>
            </div>

            {/* Right: info + purchase */}
            <div className={productDetailPanelClass()}>
              <div>
                <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
                  {product.name}
                </h1>
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {!isOutOfStock ? (
                    <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-400">
                      เปิดขาย
                    </span>
                  ) : (
                    <span className="rounded-full border border-red-500/30 bg-red-500/15 px-3 py-1 text-xs font-medium text-red-400">
                      สินค้าหมด
                    </span>
                  )}
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    {product.isUnlimited
                      ? "คงเหลือ ไม่จำกัด"
                      : hasOptions
                        ? `คงเหลือ ${optionStock} ชิ้น`
                        : `คงเหลือ ${product.stockCount} ชิ้น`}
                  </span>
                  <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/70">
                    ขายแล้ว {soldCount} ชิ้น
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline gap-2">
                {selectedOption ? (
                  <>
                    {(product.discount ?? 0) > 0 && (
                      <span className="text-lg text-white/40 line-through">
                        ฿{Math.floor(selectedOption.price).toLocaleString()}
                      </span>
                    )}
                    <span className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
                      ฿{Math.floor(unitPrice).toLocaleString()}
                    </span>
                  </>
                ) : hasOptions && priceRange ? (
                  <span className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
                    ฿{Math.floor(priceRange.min).toLocaleString()}
                    {priceRange.min !== priceRange.max && (
                      <> - ฿{Math.floor(priceRange.max).toLocaleString()}</>
                    )}
                  </span>
                ) : (
                  <>
                    {(product.discount ?? 0) > 0 && (
                      <span className="text-lg text-white/40 line-through">
                        ฿{Math.floor(product.price).toLocaleString()}
                      </span>
                    )}
                    <span className="text-3xl font-bold tabular-nums text-white sm:text-4xl">
                      ฿{Math.floor(unitPrice).toLocaleString()}
                    </span>
                  </>
                )}
              </div>

              {hasOptions && (
                <ProductOptionGrid
                  options={activeOptions}
                  discount={product.discount}
                  selectedId={selectedOptionId}
                  onSelect={handleSelectOption}
                  isUnlimited={product.isUnlimited}
                />
              )}

              {descriptionText && (
                <div className={cn(panel, "p-4 sm:p-5")}>
                  <h2 className="mb-2 text-sm font-semibold text-white/80">
                    รายละเอียดสินค้า
                  </h2>
                  <p
                    className={cn(
                      "whitespace-pre-line text-sm leading-relaxed text-white/55",
                      !descriptionExpanded && hasLongDescription && "line-clamp-4"
                    )}
                  >
                    {descriptionExpanded || !hasLongDescription
                      ? descriptionText
                      : descriptionPreview}
                  </p>
                  {hasLongDescription && (
                    <button
                      type="button"
                      onClick={() => setDescriptionExpanded((v) => !v)}
                      className="mt-3 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-xs text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                    >
                      {descriptionExpanded ? "ย่อลง" : "อ่านเพิ่มเติม"}
                    </button>
                  )}
                </div>
              )}

              <div className={cn(panel, "space-y-4 p-4 sm:p-5")}>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-sm font-medium text-white">จำนวน</span>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center rounded-xl border border-white/15 bg-white/5">
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(-1)}
                        disabled={quantity <= 1}
                        className="p-2.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-white">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleQuantityChange(1)}
                        disabled={quantity >= maxQuantity}
                        className="p-2.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <span className="text-xs text-white/45">สูงสุด {maxQuantity}</span>
                  </div>
                </div>

                <div>
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => {
                      setCouponCode(e.target.value.toUpperCase())
                      setCouponValid(null)
                      setCouponDiscount(0)
                    }}
                    placeholder="โค้ดส่วนลด (ถ้ามี)"
                    className={cn(bw.adminInputPlain, "w-full py-2.5 font-mono text-sm")}
                  />
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={validateCoupon}
                      disabled={validatingCoupon || !couponCode.trim()}
                      className={cn(
                        bw.adminBtnGhost,
                        "shrink-0 px-4 py-2 text-xs disabled:opacity-40"
                      )}
                    >
                      {validatingCoupon ? "..." : "ใช้โค้ด"}
                    </button>
                    {couponValid === true && (
                      <span className="flex items-center gap-1 text-xs text-emerald-400">
                        <Check className="h-3.5 w-3.5" />
                        ลด ฿{couponDiscount.toLocaleString()}
                      </span>
                    )}
                    {couponValid === false && (
                      <span className="flex items-center gap-1 text-xs text-red-400">
                        <X className="h-3.5 w-3.5" />
                        โค้ดไม่ถูกต้อง
                      </span>
                    )}
                  </div>
                </div>

                {product.pointsEarn > 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/60">
                    <Gift className="h-4 w-4 shrink-0 text-white/45" />
                    รับ +{product.pointsEarn} พอยท์ / ชิ้น
                    {pointsEarned > 0 && quantity > 1 && (
                      <span className="text-white/45">(รวม +{pointsEarned})</span>
                    )}
                  </div>
                )}

                <div className="flex items-end justify-between border-t border-white/10 pt-3">
                  <div className="space-y-1 text-sm text-white/55">
                    <div className="flex gap-4">
                      <span>สินค้า × {quantity}</span>
                      <span>฿{Math.floor(subtotal).toLocaleString()}</span>
                    </div>
                    {couponDiscount > 0 && (
                      <div className="flex gap-4 text-emerald-400">
                        <span>คูปอง</span>
                        <span>-฿{couponDiscount.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/45">ราคารวม</p>
                    <p className="text-2xl font-bold tabular-nums text-white">
                      ฿{Math.floor(totalPrice).toLocaleString()}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className={cn(
                    "h-12 w-full rounded-xl text-base font-semibold transition-all",
                    !canPurchase
                      ? "cursor-not-allowed bg-white/10 text-white/40"
                      : bw.adminBtnPrimary
                  )}
                  onClick={handlePurchase}
                  disabled={!canPurchase || purchasing}
                >
                  <ShoppingBag className="mr-2 inline h-4 w-4" />
                  {isOutOfStock
                    ? "สินค้าหมด"
                    : needsOption
                      ? "กรุณาเลือกตัวเลือก"
                      : selectedOptionOut
                        ? "ตัวเลือกนี้หมดแล้ว"
                        : isAuthenticated
                          ? "สั่งซื้อเลย"
                          : "เข้าสู่ระบบเพื่อซื้อ"}
                </button>
              </div>
            </div>
            </div>
          </div>

          {relatedProducts.length > 0 && (
            <section className="mt-12 border-t border-white/10 pt-10">
              <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-white sm:text-xl">
                    สินค้าอื่นในหมวด {category?.name}
                  </h2>
                  <p className="mt-1 text-sm text-white/45">
                    สินค้าแนะนำในหมวดเดียวกัน
                  </p>
                </div>
                <TransitionLink
                  href={`/store/category/${product.categoryId}`}
                  className="inline-flex items-center gap-1 text-sm text-white/60 transition-colors hover:text-white"
                >
                  ดูทั้งหมด
                  <ChevronRight className="h-4 w-4" />
                </TransitionLink>
              </div>
              <div className={productGridLayoutClass()}>
                {relatedProducts.map((item) => (
                  <CategoryProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          )}
        </div>
      </SitePageShell>

      {/* Confirm Purchase Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowConfirmModal(false)}
            aria-hidden
          />

          <div
            className={cn(
              panel,
              "relative w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95"
            )}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-3.5">
              <h2 className="font-bold text-white">ยืนยันการสั่งซื้อ</h2>
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="rounded-full p-1.5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4 p-5">
              <div className="flex gap-3">
                <ProductImage
                  src={product.image}
                  alt={product.name}
                  className="h-16 w-16 rounded-lg border border-white/10 object-cover"
                  showSkeleton={false}
                />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-white">
                    {product.name}
                  </h3>
                  <p className="text-xs text-white/50">
                    จำนวน {quantity} ชิ้น
                    {selectedOption ? ` · ${selectedOption.label}` : ""}
                  </p>
                  <p className="mt-0.5 text-lg font-bold text-white">
                    ฿{Math.floor(totalPrice).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5">
                <p className="text-xs font-medium text-amber-200">
                  ยอดเงินจะถูกหักจากบัญชีของคุณทันที
                </p>
                <p className="mt-0.5 text-[11px] text-white/45">
                  คงเหลือ: ฿{((user as { balance?: number })?.balance || 0).toLocaleString()}
                </p>
              </div>

              {error && (
                <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2.5">
                  <p className="text-xs font-medium text-red-300">{error}</p>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  className={cn(bw.adminBtnGhost, "flex-1 py-2.5 text-sm")}
                  onClick={() => setShowConfirmModal(false)}
                  disabled={purchasing}
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  className={cn(
                    bw.adminBtnPrimary,
                    "flex-1 py-2.5 text-sm disabled:opacity-50"
                  )}
                  onClick={confirmPurchase}
                  disabled={purchasing}
                >
                  {purchasing ? "กำลังดำเนินการ..." : "ยืนยันซื้อ"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && purchaseResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" aria-hidden />

          <div
            className={cn(
              panel,
              "relative max-h-[90vh] w-full max-w-sm overflow-y-auto animate-in fade-in zoom-in-95"
            )}
          >
            <div className="p-5 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/15">
                <Check className="h-6 w-6 text-emerald-400" />
              </div>
              <h2 className="mb-1 text-lg font-bold text-white">สั่งซื้อสำเร็จ!</h2>
              <p className="text-xs text-white/50">
                Order #{purchaseResult.order.id}
              </p>
            </div>

            {purchaseResult.stockItems.length > 0 && (
              <div className="border-t border-white/10 px-5 py-4">
                <h3 className="mb-2 text-sm font-semibold text-white">
                  ข้อมูลบัญชีของคุณ
                </h3>
                <div className="space-y-2">
                  {purchaseResult.stockItems.map((item, index) => {
                    const fullLine = formatStockDeliveryItem(item)
                    const isFreeform =
                      item.email === "—" && item.password === "—" && !!item.data

                    if (isFreeform) {
                      return (
                        <div
                          key={index}
                          className="space-y-1.5 rounded-lg border border-white/10 bg-white/5 p-3 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-white/45">ข้อมูลสินค้า</span>
                            <button
                              type="button"
                              onClick={() => copyToClipboard(fullLine)}
                              className="flex items-center gap-1 text-white/80 hover:text-white hover:underline"
                            >
                              <Copy className="h-3 w-3" />
                              คัดลอก
                            </button>
                          </div>
                          <p className="break-all font-mono text-sm text-white">
                            {fullLine}
                          </p>
                        </div>
                      )
                    }

                    return (
                      <div
                        key={index}
                        className="space-y-1.5 rounded-lg border border-white/10 bg-white/5 p-3 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-white/45">อีเมล/ชื่อผู้ใช้</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.email)}
                            className="flex items-center gap-1 text-white/80 hover:text-white hover:underline"
                          >
                            <Copy className="h-3 w-3" />
                            คัดลอก
                          </button>
                        </div>
                        <p className="break-all font-mono text-sm text-white">
                          {item.email}
                        </p>

                        <div className="flex items-center justify-between">
                          <span className="text-white/45">รหัสผ่าน</span>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(item.password)}
                            className="flex items-center gap-1 text-white/80 hover:text-white hover:underline"
                          >
                            <Copy className="h-3 w-3" />
                            คัดลอก
                          </button>
                        </div>
                        <p className="break-all font-mono text-sm text-white">
                          {item.password}
                        </p>
                      </div>
                    )
                  })}
                </div>
                <p className="mt-2 text-[11px] text-white/40">
                  * ดูข้อมูลนี้ได้อีกครั้งในประวัติการสั่งซื้อ
                </p>
              </div>
            )}

            <div className="border-t border-white/10 px-5 py-3">
              <button
                type="button"
                className={cn(bw.adminBtnPrimary, "h-9 w-full text-sm")}
                onClick={() => {
                  setShowSuccessModal(false)
                  router.push("/profile/orders")
                }}
              >
                ไปยังประวัติการสั่งซื้อ
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
