"use client"

import { use, useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { TransitionLink } from "@/components/transition-link"
import { CategoryZoneView } from "@/components/store/category-zone-view"
import { storeMotionEase } from "@/components/store/store-motion"
import type { StoreProductCardData } from "@/lib/store-product-serializer"
import type { CategoryZoneInfo } from "@/components/store/category-zone-view"
import { categoryZoneShellClass } from "@/lib/category-grid-layout"
import { bw } from "@/lib/bw-theme"
import { cn } from "@/lib/utils"

type Props = {
  params: Promise<{ categoryId: string }>
}

export function CategoryPageLoader({ params }: Props) {
  const { categoryId } = use(params)
  const [category, setCategory] = useState<CategoryZoneInfo | null>(null)
  const [products, setProducts] = useState<StoreProductCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [notFoundState, setNotFoundState] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setNotFoundState(false)
    setFetchError(null)

    fetch(`/api/store/category/${categoryId}`)
      .then(async (res) => {
        if (res.status === 404) {
          setNotFoundState(true)
          return null
        }
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(
            typeof body.error === "string" ? body.error : `HTTP ${res.status}`
          )
        }
        return res.json()
      })
      .then((data) => {
        if (cancelled || !data) return
        setCategory(data.category)
        setProducts(Array.isArray(data.products) ? data.products : [])
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setFetchError(err.message || "โหลดข้อมูลไม่สำเร็จ")
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [categoryId])

  if (fetchError) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 text-center">
        <p className="text-lg font-bold text-white">โหลดหมวดหมู่ไม่สำเร็จ</p>
        <p className="mt-2 text-sm text-white/50">{fetchError}</p>
        <p className="mt-2 text-xs text-white/40">
          ลองรีสตาร์ท dev server (Ctrl+C แล้วรันใหม่) หากเพิ่งอัปเดต schema
        </p>
        <TransitionLink
          href="/store"
          className={cn("mt-4 inline-block text-sm", bw.linkAccent)}
        >
          กลับหน้ารายการหมวดหมู่
        </TransitionLink>
      </div>
    )
  }

  if (notFoundState) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 text-center">
        <p className="text-lg font-bold text-white">ไม่พบหมวดหมู่นี้</p>
        <TransitionLink
          href="/store"
          className={cn("mt-4 inline-block text-sm", bw.linkAccent)}
        >
          กลับหน้ารายการหมวดหมู่
        </TransitionLink>
      </div>
    )
  }

  return (
    <div className={cn(categoryZoneShellClass(), "py-8 md:py-10")}>
      <AnimatePresence mode="wait">
        {loading || !category ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: storeMotionEase }}
          >
            <div
              className={cn(
                bw.panel,
                "flex min-h-[320px] items-center justify-center"
              )}
            >
              <div className={bw.storeSpinner} />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: storeMotionEase }}
          >
            <CategoryZoneView category={category} products={products} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
