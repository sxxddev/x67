"use client"

import { TransitionLink } from "@/components/transition-link"
import { cn } from "@/lib/utils"
import { Sparkles } from "lucide-react"
import { ProductImage } from "@/components/product-image"

interface Product {
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

interface ProductCardProps {
  product: Product
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const finalPrice = product.discount && product.discount > 0
    ? product.price * (1 - product.discount / 100)
    : product.price

  const stockDisplay = product.isUnlimited
    ? "สินค้าพร้อมส่ง"
    : (product.stockCount || 0) > 0
    ? `คงเหลือ ${product.stockCount} ชิ้น`
    : "สินค้าหมด"

  const isOutOfStock = !product.isUnlimited && (product.stockCount || 0) === 0

  return (
    <TransitionLink
      href={`/store/product/${product.id}`}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-white/10 bg-card shadow-sm transition-all hover:border-white/25 hover:shadow-lg hover:shadow-black/20 active:scale-[0.98]",
        isOutOfStock && "opacity-60",
        className
      )}
    >
      {/* HOT Badge */}
      {product.isHot && (
        <div className="absolute right-3 top-3 z-10 flex items-center gap-1 rounded-full bg-destructive px-2.5 py-1 text-xs font-bold text-destructive-foreground badge-hot">
          <Sparkles className="h-3 w-3" />
          HOT
        </div>
      )}

      {/* Discount Badge */}
      {(product.discount ?? 0) > 0 && (
        <div className="absolute left-3 top-3 z-10 rounded-full bg-success px-2.5 py-1 text-xs font-bold text-success-foreground">
          -{product.discount}%
        </div>
      )}

      {/* Image Container */}
      <div className="relative aspect-square shrink-0 overflow-hidden bg-muted">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
        />
        
        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <span className="text-sm font-bold text-muted-foreground">สินค้าหมด</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex min-h-0 flex-1 flex-col p-4">
        <div className="min-h-[2.5rem] shrink-0">
          <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-foreground transition-colors group-hover:text-primary">
            {product.name}
          </h3>
        </div>
        <p className="mt-1 line-clamp-1 h-4 shrink-0 text-xs leading-4 text-muted-foreground">
          หมวดหมู่: {product.category?.name || "ไม่ระบุ"}
        </p>

        <div className="mt-auto flex items-center justify-between pt-3">
          <span className={cn(
            "text-xs",
            isOutOfStock ? "text-destructive" : "text-muted-foreground"
          )}>
            {stockDisplay}
          </span>
          <div className="flex flex-col items-end">
            {(product.discount ?? 0) > 0 && (
              <span className="text-xs text-muted-foreground line-through">
                {product.price.toLocaleString()}฿
              </span>
            )}
            <span className="flex items-center gap-0.5 text-lg font-bold text-primary">
              {Math.floor(finalPrice).toLocaleString()}
              <span className="text-sm">฿</span>
            </span>
          </div>
        </div>
      </div>
    </TransitionLink>
  )
}
