"use client"

import { cn } from "@/lib/utils"
import { SITE_LOGO_SRC } from "@/lib/brand"
import { AtomOrbitEffect } from "@/components/store/atom-orbit-effect"

type Props = {
  title?: string
  imageSrc?: string
  logoSrc?: string
  className?: string
}

/**
 * Preview card — hover แล้วเห็น atom orbit แบบ reference
 * เปิดดูที่ /preview/atom-card
 */
export function AtomHoverCardPreview({
  title = "PRIVATE AIMCOLOR",
  imageSrc = "https://placehold.jp/400x400/111111/333333.png?text=Product",
  logoSrc = SITE_LOGO_SRC,
  className,
}: Props) {
  return (
    <div className={cn("group/card mx-auto w-full max-w-sm", className)}>
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 shadow-xl">
        {/* Image + hover orbit */}
        <div className="relative aspect-square w-full overflow-hidden bg-gray-800">
          <img
            alt={title}
            src={imageSrc}
            className="absolute inset-0 h-full w-full object-cover transition-all duration-700 group-hover/card:scale-110 group-hover/card:brightness-[0.2] group-hover/card:blur-[2px]"
            loading="lazy"
          />
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-0 transition-all duration-500 group-hover/card:opacity-100">
            <AtomOrbitEffect logoSrc={logoSrc} />
          </div>
        </div>

        {/* Footer demo */}
        <div className="space-y-2 p-4 text-white">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="line-clamp-1 text-sm font-bold">{title}</h3>
              <p className="mt-1 text-lg font-bold tabular-nums">฿249 - ฿1,199</p>
            </div>
            <span className="shrink-0 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-black shadow-[0_2px_10px_rgba(255,255,255,0.25)]">
              ดูรายละเอียด →
            </span>
          </div>
          <p className="text-[11px] text-white/45">Hover รูปด้านบนเพื่อดู atom orbit</p>
        </div>
      </div>
    </div>
  )
}
