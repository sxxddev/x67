"use client"

import dynamic from "next/dynamic"
import { usePathname } from "next/navigation"

const SpaceStarBackground = dynamic(
  () =>
    import("@/components/space-star-background").then((m) => ({
      default: m.SpaceStarBackground,
    })),
  { ssr: false }
)

export function SiteBackground() {
  const pathname = usePathname()
  const isAdmin = pathname?.startsWith("/admin")

  if (isAdmin) {
    return (
      <div className="pointer-events-none fixed inset-0 z-0 bg-zinc-100" aria-hidden />
    )
  }

  return <SpaceStarBackground />
}
