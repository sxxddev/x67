"use client"

import { TransitionLink } from "@/components/transition-link"
import { useState } from "react"
import { ArrowRight, Package, ShoppingBag } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  productCardImageAspectClass,
  productCardWrapperClass,
} from "@/lib/product-card-layout"
import { ProductImage } from "@/components/product-image"
import type { StoreProductCardData } from "@/lib/store-product-serializer"

type Props = {
  product: StoreProductCardData
  layout?: "fixed" | "fluid"
}

function formatCardPrice(product: StoreProductCardData) {
  const discount = product.discount ?? 0
  if (product.hasOptions && product.priceMin != null && product.priceMax != null) {
    const min = Math.floor(product.priceMin)
    const max = Math.floor(product.priceMax)
    if (min === max) return `฿${min.toLocaleString()}`
    return `฿${min.toLocaleString()} - ฿${max.toLocaleString()}`
  }
  const finalPrice =
    discount > 0 ? product.price * (1 - discount / 100) : product.price
  return `฿${Math.floor(finalPrice).toLocaleString()}`
}

export function CategoryProductCard({ product, layout = "fixed" }: Props) {
  const [hovered, setHovered] = useState(false)

  const discount = product.discount ?? 0
  const stockNum = product.isUnlimited ? null : product.stockCount
  const isOutOfStock = !product.isUnlimited && product.stockCount === 0
  const soldCount = product.soldCount ?? 0
  const priceLabel = formatCardPrice(product)
  const showBadgeOverlay = Boolean(product.badge?.trim())

  return (
    <div
      className={cn(
        layout === "fluid" ? "h-full w-full" : productCardWrapperClass()
      )}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <TransitionLink
        href={`/store/product/${product.id}`}
        className={cn("block h-full", isOutOfStock && "opacity-85")}
      >
        <div
          className={cn(
            "product-card-inner hover-card flex h-full w-full flex-col overflow-hidden rounded-xl border border-white/10 bg-black/55 shadow-[0_12px_32px_-12px_rgba(0,0,0,0.65)] transition-all duration-300 hover:border-white/20",
            isOutOfStock && "hover-card--disabled"
          )}
        >
          <div
            className={cn(
              "relative w-full shrink-0 overflow-hidden bg-zinc-900",
              productCardImageAspectClass
            )}
          >
            <ProductImage
              src={product.image}
              alt={product.name}
              className={cn(
                "product-card-image absolute inset-0 h-full w-full object-cover transition-all duration-500 ease-out",
                hovered && !isOutOfStock && "product-card-image--hovered"
              )}
            />
            {product.isHot ? (
              <span className="absolute right-2 top-2 z-[3] rounded-full bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase text-black">
                Hot
              </span>
            ) : null}
            {isOutOfStock ? (
              <div className="absolute inset-0 z-[3] flex items-center justify-center bg-black/75 text-xs font-bold text-white/70 backdrop-blur-[2px]">
                สินค้าหมด
              </div>
            ) : null}
            {showBadgeOverlay ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/50">
                <span className="rounded-full bg-yellow-500/80 px-3 py-1 text-xs font-semibold text-white">
                  {product.badge}
                </span>
              </div>
            ) : null}
          </div>

          <div className="relative z-10 flex min-h-0 flex-1 flex-col justify-between space-y-2 p-3.5 text-white">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="line-clamp-1 text-sm font-bold leading-snug">
                  {product.name}
                </h3>
                {!product.hasOptions && discount > 0 ? (
                  <p className="mt-0.5 text-[11px] text-white/40 line-through">
                    ฿{Math.floor(product.price).toLocaleString()}
                  </p>
                ) : null}
                <p className="mt-1 text-lg font-bold tabular-nums leading-tight">
                  {priceLabel}
                </p>
              </div>
              <span
                className={cn(
                  "hidden shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium sm:inline-flex",
                  isOutOfStock
                    ? "bg-white/10 text-white/40"
                    : "bg-white text-black shadow-[0_2px_10px_rgba(255,255,255,0.25)]"
                )}
              >
                ดูรายละเอียด
                <ArrowRight className="h-3 w-3" />
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[11px] text-white/45">
              <span className="inline-flex items-center gap-1">
                <ShoppingBag className="h-3 w-3 shrink-0" />
                ขายแล้ว {soldCount}
              </span>
              <span className="text-white/25">·</span>
              <span className="inline-flex items-center gap-1">
                <Package className="h-3 w-3 shrink-0" />
                คงเหลือ {product.isUnlimited ? "∞" : stockNum}
              </span>
            </div>
          </div>
        </div>
      </TransitionLink>
    </div>
  )
}
