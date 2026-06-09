"use client"

import { useMemo, useState } from "react"
import { ArrowLeft, Search, ShoppingCart, Star } from "lucide-react"
import { TransitionLink } from "@/components/transition-link"
import { CategoryProductCard } from "@/components/store/category-product-card"
import {
  StoreMotionSection,
  StoreStaggerGrid,
  StoreStaggerItem,
} from "@/components/store/store-motion"
import type { StoreProductCardData } from "@/lib/store-product-serializer"
import {
  categoryZoneBannerWrapperClass,
  CATEGORY_ZONE_BANNER_HEIGHT,
  CATEGORY_ZONE_BANNER_WIDTH,
} from "@/lib/category-grid-layout"
import { productGridLayoutClass } from "@/lib/product-card-layout"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"

export type CategoryZoneInfo = {
  id: string
  name: string
  image: string | null
  isFeatured: boolean
  productCount: number
}

type Props = {
  category: CategoryZoneInfo
  products: StoreProductCardData[]
}

export function CategoryZoneView({ category, products }: Props) {
  const [search, setSearch] = useState("")

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter(
      (product) =>
        product.name.toLowerCase().includes(q) ||
        product.descriptionExcerpt.toLowerCase().includes(q)
    )
  }, [products, search])

  const bannerSrc =
    category.image ||
    `https://placehold.jp/${CATEGORY_ZONE_BANNER_WIDTH}x${Math.round(CATEGORY_ZONE_BANNER_HEIGHT)}/111111/444444.png?text=${encodeURIComponent(category.name)}`

  return (
    <div className="w-full space-y-5 sm:space-y-6">
      <StoreMotionSection delay={0.05}>
        <TransitionLink
          href="/store"
          className="inline-flex items-center gap-2 text-sm text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปยังหน้าหมวดหมู่
        </TransitionLink>
      </StoreMotionSection>

      <StoreMotionSection delay={0.08}>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-tight text-white md:text-3xl">
              {category.name}
            </h1>
            <p className="mt-1 text-sm text-white/50">
              {category.productCount} สินค้า
            </p>
          </div>
          {category.isFeatured ? (
            <span className={bw.featuredBadge}>
              <Star className="h-4 w-4 fill-white/80 text-white/80" />
              แนะนำ
            </span>
          ) : null}
        </div>
      </StoreMotionSection>

      <StoreMotionSection delay={0.1}>
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/10 bg-black/50",
            categoryZoneBannerWrapperClass()
          )}
        >
          <img
            src={bannerSrc}
            alt={category.name}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20" />
        </div>
      </StoreMotionSection>

      <StoreMotionSection delay={0.12}>
        <div className={cn(bw.panel, "relative overflow-hidden px-4 py-3 sm:px-5")}>
          <Search
            className="pointer-events-none absolute left-7 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35 sm:left-8"
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้าในหมวดหมู่นี้..."
            className="w-full bg-transparent pl-9 text-sm text-white placeholder:text-white/35 outline-none sm:text-base"
          />
        </div>
      </StoreMotionSection>

      {filtered.length > 0 ? (
        <StoreStaggerGrid className={productGridLayoutClass()}>
          {filtered.map((product) => (
            <StoreStaggerItem key={product.id} className="h-full">
              <CategoryProductCard product={product} />
            </StoreStaggerItem>
          ))}
        </StoreStaggerGrid>
      ) : products.length > 0 ? (
        <StoreMotionSection delay={0.16}>
          <div className={cn(bw.panel, "py-12 text-center")}>
            <p className={bw.muted}>ไม่พบสินค้าที่ค้นหา</p>
          </div>
        </StoreMotionSection>
      ) : (
        <StoreMotionSection delay={0.16}>
          <div
            className={cn(
              bw.panel,
              "flex flex-col items-center justify-center border-dashed py-20"
            )}
          >
            <p className={cn("text-lg font-semibold", bw.body)}>
              ยังไม่มีสินค้าในหมวดหมู่นี้
            </p>
            <TransitionLink
              href="/store"
              className={cn("mt-4 text-sm", bw.linkAccent)}
            >
              กลับหน้ารายการหมวดหมู่
            </TransitionLink>
          </div>
        </StoreMotionSection>
      )}
    </div>
  )
}
