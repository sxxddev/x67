"use client"

import { useEffect, useMemo, useState, type CSSProperties } from "react"
import { Clock, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProductImage } from "@/components/product-image"
import { formatRelativeTimeTh } from "@/lib/format-relative-time-th"

type RecentPurchaseItem = {
  id: number
  productName: string
  productImage: string | null
  buyerMasked: string
  purchasedAt: string
}

type Props = {
  className?: string
}

function RecentPurchaseCard({ item }: { item: RecentPurchaseItem }) {
  const timeLabel = formatRelativeTimeTh(new Date(item.purchasedAt))

  return (
    <div className="mx-1.5 flex h-[60px] min-w-[220px] shrink-0 items-center gap-2.5 whitespace-nowrap rounded-lg border border-white/10 bg-white/5 px-3.5 py-2.5">
      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md bg-white/5">
        <ProductImage
          src={item.productImage}
          alt={item.productName}
          className="absolute inset-0 h-full w-full object-cover"
          showSkeleton={false}
        />
      </div>
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="max-w-[120px] truncate text-xs font-semibold text-white/85">
          {item.productName}
        </span>
        <div className="flex items-center gap-2 text-[10px] text-white/25">
          <span className="flex items-center gap-1">
            <User className="h-2.5 w-2.5 shrink-0" aria-hidden />
            {item.buyerMasked}
          </span>
          <span aria-hidden>·</span>
          <span>{timeLabel}</span>
        </div>
      </div>
    </div>
  )
}

export function RecentPurchasesMarquee({ className }: Props) {
  const [items, setItems] = useState<RecentPurchaseItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/recent-purchases?limit=20")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.items)) setItems(data.items)
      })
      .finally(() => setLoading(false))
  }, [])

  const durationSec = useMemo(() => {
    const count = Math.max(items.length, 1)
    return Math.max(40, count * 5)
  }, [items.length])

  if (loading) {
    return (
      <div className={cn("relative z-20 px-1 py-3", className)}>
        <div className="mx-auto w-full max-w-[1000px]">
          <div className="mb-2 flex items-center gap-2 px-1">
            <Clock className="h-3.5 w-3.5 text-white/50" aria-hidden />
            <span className="text-xs font-medium text-white/50">
              สินค้าที่ซื้อล่าสุด
            </span>
          </div>
          <div className="h-[72px] animate-pulse rounded-lg bg-white/5" />
        </div>
      </div>
    )
  }

  if (items.length === 0) return null

  const loopItems = [...items, ...items]

  return (
    <section
      className={cn("relative z-20 flex justify-center px-4 py-3", className)}
      aria-label="สินค้าที่ซื้อล่าสุด"
    >
      <div className="mx-auto w-full max-w-[1000px]">
        <div className="mb-2 flex items-center gap-2 px-1">
          <Clock className="h-3.5 w-3.5 text-white/50" aria-hidden />
          <span className="text-xs font-medium text-white/50">
            สินค้าที่ซื้อล่าสุด
          </span>
        </div>

        <div className="recent-purchases-mask relative overflow-hidden">
          <div
            className="recent-purchases-track py-1"
            style={
              {
                "--recent-purchases-duration": `${durationSec}s`,
              } as CSSProperties
            }
          >
            {loopItems.map((item, index) => (
              <RecentPurchaseCard
                key={`${item.id}-${index}`}
                item={item}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
