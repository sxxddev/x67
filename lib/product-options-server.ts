import { prisma } from "@/lib/prisma"
import type { ProductOptionInput } from "@/lib/product-options"

export async function syncProductOptions(
  productId: string,
  options: ProductOptionInput[]
) {
  const normalized = options
    .filter((o) => o.label.trim() && !Number.isNaN(o.price))
    .map((o, index) => ({
      id: o.id,
      label: o.label.trim(),
      days: o.days ?? null,
      price: Number(o.price),
      stockCount: Math.max(0, Math.floor(Number(o.stockCount ?? 0))),
      sortOrder: o.sortOrder ?? index,
      isActive: o.isActive !== false,
    }))

  const existing = await prisma.productOption.findMany({
    where: { productId },
    select: { id: true },
  })
  const keepIds = new Set(normalized.filter((o) => o.id).map((o) => o.id!))
  const deleteIds = existing.filter((e) => !keepIds.has(e.id)).map((e) => e.id)

  if (deleteIds.length > 0) {
    await prisma.productOption.deleteMany({ where: { id: { in: deleteIds } } })
  }

  for (const opt of normalized) {
    if (opt.id) {
      await prisma.productOption.update({
        where: { id: opt.id },
        data: {
          label: opt.label,
          days: opt.days,
          price: opt.price,
          stockCount: opt.stockCount,
          sortOrder: opt.sortOrder,
          isActive: opt.isActive,
        },
      })
    } else {
      await prisma.productOption.create({
        data: {
          productId,
          label: opt.label,
          days: opt.days,
          price: opt.price,
          stockCount: opt.stockCount,
          sortOrder: opt.sortOrder,
          isActive: opt.isActive,
        },
      })
    }
  }
}
