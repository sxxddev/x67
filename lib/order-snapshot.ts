/** MySQL VARCHAR default ~191 — เก็บเฉพาะ URL สั้น หรือ null (ไม่เก็บ base64) */
const ORDER_IMAGE_MAX = 512

/** ค่า image ที่เก็บใน Order.productImage */
export function orderProductImageSnapshot(
  image: string | null | undefined
): string | null {
  if (!image) return null
  const trimmed = image.trim()
  if (!trimmed || trimmed.startsWith("data:")) return null

  if (trimmed.startsWith("/uploads/products/")) {
    return trimmed.length <= ORDER_IMAGE_MAX ? trimmed : null
  }

  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    return null
  }

  if (trimmed.length <= ORDER_IMAGE_MAX) return trimmed
  return trimmed.slice(0, ORDER_IMAGE_MAX)
}
