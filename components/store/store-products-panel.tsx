"use client"

import { useEffect, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ChevronDown, ShoppingCart, SlidersHorizontal, Store } from "lucide-react"
import { PageEnter, PageEnterHeader } from "@/components/site-page-enter"
import { ProductCard } from "@/components/product-card"
import { TransitionLink } from "@/components/transition-link"
import { bw } from "@/lib/bw-theme"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type Category = { id: string; name: string }
type Product = {
  id: string
  name: string
  description: string
  price: number
  discount?: number | null
  image: string | null
  categoryId: string
  isUnlimited: boolean
  pointsEarn: number
  isHot: boolean
  badge?: string | null
  stockCount?: number
  category?: { id: string; name: string }
}

export function StoreProductsPanel() {
  const searchParams = useSearchParams()
  const searchQuery = (searchParams.get("search") || "").trim().toLowerCase()

  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
    ])
      .then(([cats, prods]) => {
        if (Array.isArray(cats)) setCategories(cats)
        if (Array.isArray(prods)) {
          setProducts(
            prods.map((p: Product) => ({
              ...p,
              id: String(p.id),
              image: p.image || "https://placehold.jp/400x400.png",
            }))
          )
        }
      })
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchCategory =
        categoryFilter === "all" || p.categoryId === categoryFilter
      const matchSearch =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery) ||
        p.category?.name?.toLowerCase().includes(searchQuery) ||
        p.description?.toLowerCase().includes(searchQuery)
      return matchCategory && matchSearch
    })
  }, [products, categoryFilter, searchQuery])

  const selectedCategoryName =
    categoryFilter === "all"
      ? "สินค้าทั้งหมด"
      : categories.find((c) => c.id === categoryFilter)?.name ?? "สินค้าทั้งหมด"

  return (
    <>
      <PageEnterHeader className="mb-8 text-center md:mb-10">
        <div className={bw.iconRing}>
          <Store className="h-6 w-6 text-white/90" strokeWidth={1.5} />
        </div>
        <h1 className={bw.pageTitle}>สินค้าทั้งหมด</h1>
        <p className={cn("mx-auto mt-2 max-w-md", bw.pageSubtitle)}>
          กรองตามหมวดหมู่หรือค้นหาสินค้า —{" "}
          <TransitionLink href="/store" className={bw.linkAccent}>
            กลับหน้าหมวดหมู่
          </TransitionLink>
        </p>
      </PageEnterHeader>

      <PageEnter delay={0.08}>
        <div className={cn(bw.panel, "p-5 sm:p-6")}>
      <div className="mb-6 grid min-h-10 grid-cols-1 items-center gap-3 border-b border-white/10 pb-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-4">
        <div
          className={cn(
            "flex min-h-9 shrink-0 items-center gap-2 border-l-2 border-white/30 pl-3"
          )}
        >
          <span className={cn("text-sm font-medium", bw.muted)}>หมวดหมู่</span>
        </div>
        <div className="flex shrink-0 items-center justify-end gap-2 sm:justify-self-end">
          <SlidersHorizontal
            className="h-4 w-4 shrink-0 text-white/50"
            aria-hidden
          />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="กรองหมวดหมู่"
                className={cn(
                  "flex h-9 w-[220px] min-w-[220px] max-w-[220px] shrink-0 items-center justify-between gap-2 rounded-md border border-white/15 bg-black/50 px-3 text-sm text-white outline-none transition-colors",
                  "hover:border-white/25 focus-visible:border-white/30 focus-visible:ring-[3px] focus-visible:ring-white/15"
                )}
              >
                <span className="min-w-0 truncate">{selectedCategoryName}</span>
                <ChevronDown className="size-4 shrink-0 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              sideOffset={6}
              className="z-[60] min-w-[220px] border-white/10 bg-zinc-900 text-white"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuItem
                className={cn(
                  "cursor-pointer focus:bg-white/10",
                  categoryFilter === "all" && "bg-white/10"
                )}
                onClick={() => setCategoryFilter("all")}
              >
                สินค้าทั้งหมด
              </DropdownMenuItem>
              {categories.map((c) => (
                <DropdownMenuItem
                  key={c.id}
                  className={cn(
                    "cursor-pointer focus:bg-white/10",
                    categoryFilter === c.id && "bg-white/10"
                  )}
                  onClick={() => setCategoryFilter(c.id)}
                >
                  {c.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className={cn("mb-5 flex min-h-7 items-center gap-2", bw.body)}>
        <ShoppingCart className="h-5 w-5 shrink-0 text-white/70" />
        <h2 className={cn("shrink-0 font-semibold text-white")}>สินค้าทั้งหมด</h2>
        <span
          className={cn(
            bw.pageSubtitle,
            "min-w-[6.5rem] tabular-nums",
            loading && "invisible"
          )}
        >
          ({filtered.length} รายการ)
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[3/4] animate-pulse rounded-xl bg-white/10"
            />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} className="h-full" />
          ))}
        </div>
      ) : (
        <div
          className={cn(
            bw.panel,
            "flex min-h-[280px] flex-col items-center justify-center border-dashed py-16 text-center"
          )}
        >
          <ShoppingCart className={cn("mb-3 h-12 w-12", bw.iconMuted)} />
          <p className={cn("text-lg font-medium", bw.body)}>ไม่พบสินค้า</p>
          <p className={cn("mt-1 text-sm", bw.pageSubtitle)}>
            {searchQuery
              ? `ไม่พบผลลัพธ์สำหรับ "${searchParams.get("search")}"`
              : "ยังไม่มีสินค้าในระบบ หรือหมวดหมู่ที่เลือกว่าง"}
          </p>
        </div>
      )}
        </div>
      </PageEnter>
    </>
  )
}
