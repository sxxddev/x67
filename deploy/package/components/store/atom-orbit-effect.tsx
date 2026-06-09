"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { SITE_LOGO_SRC } from "@/lib/brand"

const SPARKLES = [
  { top: "20%", left: "30%", delay: "0s" },
  { top: "70%", left: "80%", delay: "0.5s" },
  { top: "40%", left: "10%", delay: "1.2s" },
  { top: "80%", left: "20%", delay: "0.8s" },
] as const

type Props = {
  className?: string
  logoSrc?: string
  accentColor?: string
  active?: boolean
}

/** Hover กลางการ์ด — จุดแสงวิ่ง + sparkle + โลโก้ (ไม่มีวงแหวน) */
export function AtomOrbitEffect({
  className,
  logoSrc: logoSrcProp,
  accentColor = "#00ff99",
  active,
}: Props) {
  const [logoSrc, setLogoSrc] = useState(logoSrcProp ?? SITE_LOGO_SRC)

  return (
    <div
      className={cn(
        "relative flex h-32 w-32 items-center justify-center",
        className
      )}
      style={{ ["--atom-color" as string]: accentColor }}
    >
      {/* จุดแสงวิ่งรอบกลาง — ขยับได้จริง */}
      <div className="product-orbit-loader" style={{ color: accentColor }} />

      {SPARKLES.map((s, i) => (
        <div
          key={i}
          className="sparkle-dot"
          style={{
            top: s.top,
            left: s.left,
            animationDelay: s.delay,
          }}
        />
      ))}

      <div
        className="atom-logo-pulse-glow pointer-events-none absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 rounded-full blur-2xl"
        aria-hidden
      />

      <div
        className={cn(
          "relative z-10 flex transform flex-col items-center justify-center transition-transform duration-500",
          active !== undefined
            ? active && "scale-125"
            : "group-hover/card:scale-125"
        )}
      >
        <div className="relative flex h-16 w-16 items-center justify-center">
          <img
            src={logoSrc}
            alt="Logo"
            className="h-full w-full object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.6)]"
            onError={() => setLogoSrc("/icon.svg")}
          />
        </div>
      </div>
    </div>
  )
}
