"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, Star } from "lucide-react"
import { TransitionLink } from "@/components/transition-link"
import {
  StoreStaggerGrid,
  StoreStaggerItem,
} from "@/components/store/store-motion"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"
import {
  categoryGridLayoutClass,
  categoryBannerSizeClass,
  CATEGORY_BANNER_WIDTH,
  CATEGORY_BANNER_HEIGHT,
} from "@/lib/category-grid-layout"

export interface StoreCategory {
  id: string
  name: string
  image: string | null
  isFeatured?: boolean
  order?: number
  _count?: { products: number }
}

const categoryCardSkeletonClass = cn(
  bw.storeCard,
  categoryBannerSizeClass,
  "overflow-hidden"
)

export function CategoryGrid() {
  const [categories, setCategories] = useState<StoreCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setCategories(data)
      })
      .finally(() => setLoading(false))
  }, [])

  const totalProducts = useMemo(
    () =>
      categories.reduce(
        (sum, category) => sum + (category._count?.products ?? 0),
        0
      ),
    [categories]
  )

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return categories
    return categories.filter((category) =>
      category.name.toLowerCase().includes(q)
    )
  }, [categories, search])

  if (loading) {
    return (
      <div className="space-y-4">
        <div className={cn(bw.panel, "h-12 animate-pulse")} />
        <div className={cn(bw.panel, "h-20 animate-pulse")} />
        <div className={categoryGridLayoutClass()}>
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className={categoryCardSkeletonClass}>
              <div className="h-full w-full animate-pulse bg-white/5" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className={cn(bw.panel, "py-16 text-center")}>
        <p className={bw.muted}>ยังไม่มีหมวดหมู่ — สร้างได้ที่แอดมิน</p>
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-5">
      <div className={cn(bw.panel, "relative overflow-hidden px-4 py-3 sm:px-5")}>
        <Search
          className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 sm:left-8"
          aria-hidden
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ค้นหาหมวดหมู่..."
          className="w-full bg-transparent pl-9 text-sm text-white placeholder:text-white/35 outline-none sm:text-base"
        />
      </div>

      <TransitionLink
        href="/store/products"
        className={cn(
          bw.panel,
          bw.panelHover,
          "block px-5 py-4 transition-all active:scale-[0.99] sm:px-6 sm:py-5"
        )}
      >
        <h2 className="text-lg font-bold text-white sm:text-xl">สินค้าทั้งหมด</h2>
        <p className="mt-1 text-sm text-white/50">{totalProducts} สินค้า</p>
      </TransitionLink>

      {filtered.length === 0 ? (
        <div className={cn(bw.panel, "py-12 text-center")}>
          <p className={bw.muted}>ไม่พบหมวดหมู่ที่ค้นหา</p>
        </div>
      ) : (
        <StoreStaggerGrid className={categoryGridLayoutClass()}>
          {filtered.map((category) => {
            const productCount = category._count?.products ?? 0
            const bannerSrc =
              category.image ||
              `https://placehold.jp/${CATEGORY_BANNER_WIDTH}x${Math.round(CATEGORY_BANNER_HEIGHT)}/111111/444444.png?text=${encodeURIComponent(category.name)}`

            return (
              <StoreStaggerItem key={category.id} className="shrink-0">
                <TransitionLink
                  href={`/store/category/${category.id}`}
                  className={cn(
                    "group relative block overflow-hidden rounded-2xl border border-white/10 bg-black/60 shadow-[0_16px_40px_-12px_rgba(0,0,0,0.7)] transition-all duration-300 hover:border-white/25 hover:shadow-[0_0_28px_rgba(255,255,255,0.08)] active:scale-[0.99]",
                    categoryBannerSizeClass,
                    "[&:hover_.category-banner-img]:scale-105"
                  )}
                >
                  <img
                    src={bannerSrc}
                    alt={category.name}
                    className="category-banner-img absolute inset-0 h-full w-full object-cover object-center transition-transform duration-700 ease-out"
                  />

                  <div
                    className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/20"
                    aria-hidden
                  />

                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center px-6"
                    aria-hidden
                  >
                    <span
                      className={cn(
                        bw.productWatermark,
                        "max-w-full truncate text-center text-2xl sm:text-3xl md:text-4xl"
                      )}
                    >
                      {category.name}
                    </span>
                  </div>

                  {category.isFeatured ? (
                    <span className="absolute right-4 top-4 z-[2] inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white/90 backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-white/90 text-white/90" />
                      แนะนำ
                    </span>
                  ) : null}

                  <div className="absolute bottom-0 left-0 z-[2] p-4 sm:p-5">
                    <p className="text-base font-bold uppercase tracking-wide text-white sm:text-lg">
                      {category.name}
                    </p>
                    <p className="mt-0.5 text-xs text-white/60 sm:text-sm">
                      {productCount} สินค้า
                    </p>
                  </div>
                </TransitionLink>
              </StoreStaggerItem>
            )
          })}
        </StoreStaggerGrid>
      )}
    </div>
  )
}
