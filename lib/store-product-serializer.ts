import { stripHtmlToText } from "@/lib/strip-html"
import {
  computeOptionPriceRange,
  computeOptionsTotalStock,
  serializeProductOption,
  type ProductOptionData,
} from "@/lib/product-options"
import { resolveProductImageUrl } from "@/lib/product-image"

/** ข้อมูลสินค้าที่ส่งจาก Server → Client ได้ปลอดภัย (ไม่มี HTML/script ใน tree) */
export type StoreProductCardData = {
  id: string
  name: string
  descriptionExcerpt: string
  price: number
  discount: number | null
  image: string
  isUnlimited: boolean
  isHot: boolean
  badge: string | null
  stockCount: number
  soldCount?: number
  hasOptions?: boolean
  priceMin?: number
  priceMax?: number
}

export function toStoreProductCardData(
  p: {
    id: string
    name: string
    description: string
    price: number
    discount: number | null
    image: string | null
    isUnlimited: boolean
    isHot: boolean
    badge: string | null
    productStock?: { length: number }[]
    options?: {
      id: string
      label: string
      days: number | null
      price: number
      stockCount: number
      sortOrder: number
      isActive: boolean
    }[]
  },
  stockCount: number,
  soldCount = 0
): StoreProductCardData {
  const optionRows = (p.options ?? []).map(serializeProductOption)
  const activeOptions = optionRows.filter((o) => o.isActive)
  const hasOptions = activeOptions.length > 0
  const range = hasOptions ? computeOptionPriceRange(activeOptions, p.discount) : null
  const displayStock = hasOptions
    ? computeOptionsTotalStock(activeOptions, p.isUnlimited)
    : stockCount

  return {
    id: p.id,
    name: p.name,
    descriptionExcerpt: stripHtmlToText(p.description || "", 80),
    price: p.price,
    discount: p.discount,
    image: resolveProductImageUrl(p.image),
    isUnlimited: p.isUnlimited,
    isHot: p.isHot,
    badge: p.badge,
    stockCount: displayStock,
    soldCount,
    hasOptions,
    priceMin: range?.min,
    priceMax: range?.max,
  }
}

export type { ProductOptionData }
