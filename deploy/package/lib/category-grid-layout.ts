import { cn } from "@/lib/utils"

/** แบนเนอร์การ์ดหมวดหมู่ — หน้าเลือกหมวด (/store) */
export const CATEGORY_BANNER_WIDTH = 588
export const CATEGORY_BANNER_HEIGHT = 179.27

/** แบนเนอร์หน้ารายละเอียดหมวด — category zone */
export const CATEGORY_ZONE_BANNER_WIDTH = 1198
export const CATEGORY_ZONE_BANNER_HEIGHT = 365.23

/** 588×2 + gap-5 (20px) */
export const CATEGORY_GRID_MIN_WIDTH =
  CATEGORY_BANNER_WIDTH * 2 + 20

export const categoryBannerSizeClass = "h-[179.27px] w-[588px] max-w-full"

export const categoryZoneBannerSizeClass =
  "h-[365.23px] w-[1198px] max-w-full"

/** @deprecated ใช้ categoryBannerSizeClass */
export const categoryBannerAspectClass = "aspect-[588/179.27]"

export function categoryBannerWrapperClass() {
  return cn("mx-auto shrink-0", categoryBannerSizeClass)
}

export function categoryZoneBannerWrapperClass() {
  return cn("mx-auto shrink-0", categoryZoneBannerSizeClass)
}

/** หน้าเลือกหมวด — 2 การ์ด 588px */
export function categoryStoreShellClass() {
  return cn("mx-auto w-full max-w-[1248px] px-4 md:px-6")
}

/** หน้ารายละเอียดหมวด — แบนเนอร์ 1198px */
export function categoryZoneShellClass() {
  return cn("mx-auto w-full max-w-[1246px] px-4 md:px-6")
}

/** 2 คอลัมน์ 588px ไม่ชนกัน (เหมือน reference) */
export function categoryGridLayoutClass() {
  return cn(
    "mx-auto grid w-full grid-cols-1 justify-items-center gap-y-5",
    "min-[1216px]:grid-cols-[repeat(2,588px)] min-[1216px]:justify-center min-[1216px]:gap-x-5 min-[1216px]:gap-y-5"
  )
}
