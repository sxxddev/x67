import { cn } from "@/lib/utils"

/** หน้ารายละเอียดสินค้า — INFICOZ-style (ขนาดคงที่) */
export const PRODUCT_DETAIL_IMAGE_SIZE = 576
export const PRODUCT_DETAIL_SECURITY_WIDTH = 584
export const PRODUCT_DETAIL_SECURITY_HEIGHT = 120
export const PRODUCT_DETAIL_PANEL_WIDTH = 584
export const PRODUCT_DETAIL_PANEL_HEIGHT = 720

/** 584 + 584 + gap ≈ 1200 */
export const PRODUCT_DETAIL_WINDOW_WIDTH = 1200
export const PRODUCT_DETAIL_WINDOW_HEIGHT = 720

export function productDetailShellClass() {
  return cn("mx-auto w-full max-w-[1248px] px-4 md:px-6")
}

export function productDetailWindowClass() {
  return cn(
    "product-detail-window mx-auto w-[1200px] max-w-full",
    "h-[720px] max-h-[min(720px,90dvh)]"
  )
}

export function productDetailWindowBodyClass() {
  return cn(
    "flex h-full min-h-0 flex-col items-center justify-center gap-6",
    "lg:flex-row lg:items-start lg:justify-center lg:gap-8"
  )
}

/** รูปสินค้า 576×576 */
export function productDetailImageClass() {
  return cn(
    "relative shrink-0 overflow-hidden rounded-2xl border border-white/10 bg-black/60",
    "h-[576px] w-[576px] max-w-full"
  )
}

/** กรอบระบบความปลอดภัย 584×120 */
export function productDetailSecurityClass() {
  return cn(
    "flex shrink-0 flex-col justify-center rounded-2xl border border-white/10 bg-black/50 px-5",
    "h-[120px] w-[584px] max-w-full"
  )
}

/** กรอบรายละเอียด + สั่งซื้อ 584×720 */
export function productDetailPanelClass() {
  return cn(
    "min-h-0 shrink-0 overflow-y-auto rounded-2xl border border-white/10 bg-black/35",
    "h-[720px] w-[584px] max-w-full",
    "space-y-5 p-4 sm:p-5"
  )
}
