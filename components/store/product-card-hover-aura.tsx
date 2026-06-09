"use client"

import { cn } from "@/lib/utils"
import { AtomOrbitEffect } from "@/components/store/atom-orbit-effect"

type Props = {
  className?: string
  accentColor?: string
  /** ถ้าไม่ส่ง — ใช้ group-hover/card แทน */
  active?: boolean
}

/** Overlay hover — ใช้ AtomOrbitEffect แบบเดียวกับ preview card */
export function ProductCardHoverAura({
  className,
  accentColor = "#00ff99",
  active,
}: Props) {
  return (
    <div
      className={cn(
        "atom-orbit-overlay pointer-events-none absolute inset-0 z-[15] flex items-center justify-center transition-all duration-500",
        active === undefined
          ? "opacity-0 group-hover/card:opacity-100"
          : active
            ? "opacity-100"
            : "opacity-0",
        className
      )}
      aria-hidden
    >
      <AtomOrbitEffect
        active={active}
        accentColor={accentColor}
      />
    </div>
  )
}
