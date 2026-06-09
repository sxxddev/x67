"use client"

import { useEffect, useState } from "react"
import { ShoppingCart, Tag } from "lucide-react"
import { ProductCard } from "@/components/product-card"
import { TransitionLink } from "@/components/transition-link"
import { PageEnter } from "@/components/site-page-enter"

export function RecommendedProducts() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/products?isHot=true&limit=5")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data.map(p => ({
            ...p,
            id: p.id.toString(),
            category: p.category, // Map the included category object
            image: p.image || "https://placehold.jp/400x400.png"
          })))
        }
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="aspect-[3/4] animate-pulse rounded-xl bg-white/10"
          />
        ))}
      </div>
    )
  }

  if (products.length === 0) return null

  const recommendedProducts = products

  return (
    <section>
      <PageEnter>
        <div className="mb-6 flex items-center gap-3">
          <ShoppingCart className="h-6 w-6 text-white" />
          <div>
            <h2 className="text-lg font-bold text-white">สินค้าแนะนำ</h2>
            <p className="text-sm text-white/50">RECOMMENDED PRODUCTS</p>
          </div>
        </div>
      </PageEnter>

      <PageEnter delay={0.08}>
        <div className="grid grid-cols-2 items-stretch gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {recommendedProducts.map((product) => (
            <ProductCard key={product.id} product={product} className="h-full" />
          ))}
        </div>
      </PageEnter>

      <PageEnter delay={0.14} className="mt-6 text-center">
        <TransitionLink
          href="/store"
          className="inline-flex items-center gap-2 text-sm text-white/80 hover:text-white hover:underline"
        >
          <Tag className="h-4 w-4" />
          ดูสินค้าทั้งหมด
        </TransitionLink>
      </PageEnter>
    </section>
  )
}
