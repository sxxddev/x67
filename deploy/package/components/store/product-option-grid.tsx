"use client"

import { cn } from "@/lib/utils"
import type { ProductOptionData } from "@/lib/product-options"
import { applyProductDiscount } from "@/lib/product-options"

type Props = {
  options: ProductOptionData[]
  discount?: number | null
  selectedId: string | null
  onSelect: (id: string) => void
  isUnlimited: boolean
  className?: string
}

export function ProductOptionGrid({
  options,
  discount,
  selectedId,
  onSelect,
  isUnlimited,
  className,
}: Props) {
  const active = options.filter((o) => o.isActive).sort((a, b) => a.sortOrder - b.sortOrder)

  if (active.length === 0) return null

  return (
    <div className={cn("space-y-2", className)}>
      <p className="text-sm font-medium text-white/80">เลือกตัวเลือก</p>
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {active.map((opt, index) => {
          const isSelected = selectedId === opt.id
          const isLastOdd = active.length % 2 === 1 && index === active.length - 1
          const outOfStock = !isUnlimited && opt.stockCount <= 0
          const finalPrice = applyProductDiscount(opt.price, discount)

          return (
            <button
              key={opt.id}
              type="button"
              disabled={outOfStock}
              onClick={() => onSelect(opt.id)}
              className={cn(
                "rounded-xl border px-3 py-3 text-left transition-all sm:px-4 sm:py-3.5",
                isLastOdd && "col-span-2",
                isSelected
                  ? "border-emerald-400/60 bg-emerald-500/15 shadow-[0_0_20px_-4px_rgba(52,211,153,0.35)]"
                  : "border-white/10 bg-white/[0.04] hover:border-white/25 hover:bg-white/[0.07]",
                outOfStock && "cursor-not-allowed opacity-45"
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-bold text-white sm:text-base">{opt.label}</span>
                <span className="shrink-0 text-sm font-bold tabular-nums text-white sm:text-base">
                  ฿{Math.floor(finalPrice).toLocaleString()}
                </span>
              </div>
              <p className="mt-1.5 text-[11px] text-white/45 sm:text-xs">
                {isUnlimited
                  ? "ไม่จำกัด"
                  : outOfStock
                    ? "หมดแล้ว"
                    : `เหลือ ${opt.stockCount} ชิ้น`}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}
