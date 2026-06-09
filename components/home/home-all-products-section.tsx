"use client"

import { useEffect, useState } from "react"
import { CategoryProductCard } from "@/components/store/category-product-card"
import { cn } from "@/lib/utils"
import type { StoreProductCardData } from "@/lib/store-product-serializer"

type Props = {
  className?: string
}

export function HomeAllProductsSection({ className }: Props) {
  const [products, setProducts] = useState<StoreProductCardData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/store/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.products)) setProducts(data.products)
      })
      .finally(() => setLoading(false))
  }, [])

  if (!loading && products.length === 0) return null

  return (
    <section
      className={cn("mx-auto w-full max-w-7xl overflow-x-clip px-4 pb-8 pt-4", className)}
      aria-label="สินค้าทั้งหมด"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-base font-bold text-white md:text-lg">สินค้าทั้งหมด</h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, index) => (
            <div
              key={index}
              className="aspect-[3/4] animate-pulse rounded-xl bg-white/5"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <CategoryProductCard
              key={product.id}
              product={product}
              layout="fluid"
            />
          ))}
        </div>
      )}
    </section>
  )
}
