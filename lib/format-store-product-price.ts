import type { StoreProductCardData } from "@/lib/store-product-serializer"

export function formatStoreProductPrice(product: StoreProductCardData): string {
  const discount = product.discount ?? 0
  if (product.hasOptions && product.priceMin != null && product.priceMax != null) {
    const min = Math.floor(product.priceMin)
    const max = Math.floor(product.priceMax)
    if (min === max) return `฿${min.toLocaleString()}`
    return `฿${min.toLocaleString()} - ฿${max.toLocaleString()}`
  }
  const finalPrice =
    discount > 0 ? product.price * (1 - discount / 100) : product.price
  return `฿${Math.floor(finalPrice).toLocaleString()}`
}
