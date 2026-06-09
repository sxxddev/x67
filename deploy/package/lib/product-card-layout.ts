import { cn } from "@/lib/utils"

/** ขนาดการ์ดสินค้าคงที่ (px) */
export const PRODUCT_CARD_WIDTH = 285
export const PRODUCT_CARD_HEIGHT = 394.13

/** รูปด้านบน — สquare 285×285 */
export const PRODUCT_CARD_IMAGE_SIZE = PRODUCT_CARD_WIDTH

export const productCardSizeClass = "h-[394.13px] w-[285px]"
export const productCardImageAspectClass = "aspect-square"

/** wrapper การ์ดในกริด */
export function productCardWrapperClass() {
  return cn("mx-auto shrink-0", productCardSizeClass)
}

/** รูปสินค้าหน้า detail — 285×285 */
export function productCardImageClass() {
  return cn("mx-auto w-[285px] shrink-0", productCardImageAspectClass)
}

/** INFICOZ-style — up to 4 columns */
export function productGridLayoutClass() {
  return cn(
    "grid grid-cols-1 place-items-center gap-4 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 xl:gap-5"
  )
}
