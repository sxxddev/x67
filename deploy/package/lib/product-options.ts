export type ProductOptionInput = {
  id?: string
  label: string
  days?: number | null
  price: number
  stockCount?: number
  sortOrder?: number
  isActive?: boolean
}

export type ProductOptionData = {
  id: string
  label: string
  days: number | null
  price: number
  stockCount: number
  sortOrder: number
  isActive: boolean
}

export function applyProductDiscount(price: number, discount: number | null | undefined) {
  const d = discount ?? 0
  return d > 0 ? price * (1 - d / 100) : price
}

export function computeOptionPriceRange(
  options: ProductOptionData[],
  discount: number | null | undefined
) {
  const active = options.filter((o) => o.isActive)
  if (active.length === 0) return null
  const prices = active.map((o) => applyProductDiscount(o.price, discount))
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  }
}

export function computeOptionsTotalStock(
  options: ProductOptionData[],
  isUnlimited: boolean
) {
  if (isUnlimited) return 999
  return options.filter((o) => o.isActive).reduce((sum, o) => sum + o.stockCount, 0)
}

export function serializeProductOption(o: {
  id: string
  label: string
  days: number | null
  price: number
  stockCount: number
  sortOrder: number
  isActive: boolean
}): ProductOptionData {
  return {
    id: o.id,
    label: o.label,
    days: o.days,
    price: o.price,
    stockCount: o.stockCount,
    sortOrder: o.sortOrder,
    isActive: o.isActive,
  }
}
