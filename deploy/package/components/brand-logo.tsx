import Image from "next/image"
import { SITE_BRAND_NAME, SITE_LOGO_SRC } from "@/lib/brand"
import { cn } from "@/lib/utils"

type BrandLogoProps = {
  width: number
  height: number
  className?: string
  priority?: boolean
}

export function BrandLogo({
  width,
  height,
  className,
  priority = false,
}: BrandLogoProps) {
  return (
    <Image
      src={SITE_LOGO_SRC}
      alt={SITE_BRAND_NAME}
      width={width}
      height={height}
      priority={priority}
      className={cn("object-contain", className)}
    />
  )
}
