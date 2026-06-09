"use client"

import { useCallback, useEffect, useState, type ReactNode } from "react"
import {
  ArrowRight,
  Package,
  ShoppingBag,
  TrendingUp,
} from "lucide-react"
import { TransitionLink } from "@/components/transition-link"
import { ProductImage } from "@/components/product-image"
import { cn } from "@/lib/utils"
import { formatStoreProductPrice } from "@/lib/format-store-product-price"
import type { StoreProductCardData } from "@/lib/store-product-serializer"

type Props = {
  className?: string
}

const AUTO_ROTATE_MS = 6000

function CarouselDots({
  count,
  activeIndex,
  onSelect,
  className,
}: {
  count: number
  activeIndex: number
  onSelect: (index: number) => void
  className?: string
}) {
  if (count <= 1) return null

  return (
    <div className={cn("flex items-center gap-1.5", className)}>
      {Array.from({ length: count }, (_, index) => (
        <button
          key={index}
          type="button"
          aria-label={`สินค้ายอดนิยม ${index + 1}`}
          aria-current={index === activeIndex ? "true" : undefined}
          onClick={() => onSelect(index)}
          className={cn(
            "h-1.5 rounded-full transition-all duration-300",
            index === activeIndex ? "w-[18px] bg-white" : "w-1.5 bg-white/35"
          )}
        />
      ))}
    </div>
  )
}

function BestSellerPanel({
  className,
  children,
}: {
  className?: string
  children?: ReactNode
}) {
  return (
    <div
      className={cn(
        "relative flex flex-1 flex-col justify-center overflow-hidden rounded-xl border border-white/10 bg-white/5 px-6 py-5",
        className
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <TrendingUp className="h-4 w-4 text-white" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-white/50">
          Best Seller
        </span>
      </div>
      <h2 className="text-xl font-bold text-white lg:text-2xl">สินค้ายอดนิยม</h2>
      <p className="mt-1.5 text-xs text-white/40">
        สินค้าขายดีที่คัดสรรมาเพื่อคุณ
      </p>
      {children}
    </div>
  )
}

function BestSellerCard({ product }: { product: StoreProductCardData }) {
  const priceLabel = formatStoreProductPrice(product)
  const stockLabel = product.isUnlimited ? "∞" : product.stockCount.toLocaleString()

  return (
    <TransitionLink
      href={`/store/product/${product.id}`}
      className="group flex flex-1"
    >
      <div className="flex w-full items-stretch">
        <div className="relative h-[100px] w-[100px] shrink-0 overflow-hidden md:h-auto md:w-[130px]">
          <ProductImage
            src={product.image}
            alt={product.name}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
            showSkeleton={false}
          />
        </div>

        <div className="flex min-w-0 flex-1 items-center px-3.5 py-3 md:px-4 md:py-3.5">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 line-clamp-1 text-sm font-bold leading-snug text-white md:text-[15px]">
              {product.name}
            </h3>
            <div className="hidden items-center gap-2.5 text-[11px] text-white/50 md:flex">
              <span className="flex items-center gap-1">
                <ShoppingBag className="h-3 w-3 shrink-0" aria-hidden />
                ขายแล้ว {(product.soldCount ?? 0).toLocaleString()}
              </span>
              <span className="text-white/25" aria-hidden>
                ·
              </span>
              <span className="flex items-center gap-1">
                <Package className="h-3 w-3 shrink-0" aria-hidden />
                คงเหลือ {stockLabel}
              </span>
            </div>
          </div>

          <div className="ml-3 flex shrink-0 flex-col items-end gap-2">
            <span className="text-lg font-bold text-white md:text-xl">
              {priceLabel}
            </span>
            <div className="hidden items-center gap-1.5 rounded-lg bg-white px-3.5 py-1.5 text-xs font-medium text-black transition-all duration-300 group-hover:shadow-[0_2px_10px_rgba(255,255,255,0.35)] md:inline-flex">
              ดูรายละเอียด
              <ArrowRight
                className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
                aria-hidden
              />
            </div>
          </div>
        </div>
      </div>
    </TransitionLink>
  )
}

export function BestSellerSection({ className }: Props) {
  const [items, setItems] = useState<StoreProductCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    fetch("/api/best-sellers?limit=3")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items)) setItems(data.items)
      })
      .finally(() => setLoading(false))
  }, [])

  const goTo = useCallback((index: number) => {
    setActiveIndex(index)
  }, [])

  useEffect(() => {
    if (items.length <= 1) return

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, AUTO_ROTATE_MS)

    return () => window.clearInterval(timer)
  }, [items.length])

  useEffect(() => {
    if (activeIndex >= items.length) setActiveIndex(0)
  }, [activeIndex, items.length])

  if (loading) {
    return (
      <section className={cn("flex justify-center px-4 py-3", className)}>
        <div className="mx-auto w-full max-w-[1000px] space-y-3">
          <div className="flex items-stretch gap-3 md:gap-4">
            <div className="hidden h-[140px] flex-1 animate-pulse rounded-xl bg-white/5 md:block" />
            <div className="h-[100px] flex-1 animate-pulse rounded-xl bg-white/5 md:max-w-[55%]" />
          </div>
        </div>
      </section>
    )
  }

  if (items.length === 0) return null

  const activeProduct = items[activeIndex] ?? items[0]

  return (
    <section
      className={cn("flex justify-center px-4 py-3", className)}
      aria-label="สินค้ายอดนิยม"
    >
      <div className="mx-auto w-full max-w-[1000px] space-y-3">
        <div className="flex items-stretch gap-3 md:gap-4">
          <BestSellerPanel className="hidden md:flex">
            <CarouselDots
              count={items.length}
              activeIndex={activeIndex}
              onSelect={goTo}
              className="mt-3"
            />
          </BestSellerPanel>

          <div className="flex flex-1 flex-col md:max-w-[55%]">
            <div className="flex flex-1 overflow-hidden rounded-xl border border-white/10 bg-white/5">
              <BestSellerCard product={activeProduct} />
            </div>

            <CarouselDots
              count={items.length}
              activeIndex={activeIndex}
              onSelect={goTo}
              className="mt-2 justify-center md:hidden"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
