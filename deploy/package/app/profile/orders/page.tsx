"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { type OrderHistory } from "@/lib/store"
import { Package, CheckCircle, Copy, Check, Eye, EyeOff, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"
import { formatStockLine, isFreeformStockItem } from "@/lib/parse-stock-input"

type OrderView = OrderHistory & {
  date: string
  accountCredentials?:
    | { mode: "raw"; text: string }
    | { mode: "pair"; email: string; password: string }
    | null
  licenseKeys?: OrderHistory["licenseKeys"]
}

function mapOrder(raw: OrderHistory & { stockItems?: OrderHistory["stockItems"] }): OrderView {
  const firstStock = raw.stockItems?.[0]
  let accountCredentials: OrderView["accountCredentials"] = null

  if (firstStock) {
    const displayText = formatStockLine({
      accountEmail: firstStock.accountEmail,
      accountPass: firstStock.accountPass,
      accountData: firstStock.accountData,
    })
    const useRaw =
      isFreeformStockItem(firstStock) ||
      (firstStock.accountData?.includes("\n") ?? false)

    if (useRaw && displayText) {
      accountCredentials = {
        mode: "raw",
        text: displayText,
      }
    } else {
      accountCredentials = {
        mode: "pair",
        email: firstStock.accountEmail,
        password: firstStock.accountPass,
      }
    }
  }

  return {
    ...raw,
    date: raw.createdAt,
    productImage: raw.productImage || "https://placehold.jp/400x400.png",
    accountCredentials,
    licenseKeys: raw.licenseKeys,
  }
}

function OrderCard({ order }: { order: OrderView }) {
  const [showCredentials, setShowCredentials] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className={cn(bw.panel, bw.panelHover, "overflow-hidden")}>
      {/* Header */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <img
              src={order.productImage}
              alt={order.productName}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-white truncate">{order.productName}</h3>
            <p className="text-sm text-white/55">
              {new Date(order.date).toLocaleDateString("th-TH", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-semibold text-white">{order.price.toLocaleString()} บาท</p>
            <span
              className={cn(
                "inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                order.status === "SUCCESS"
                  ? "bg-emerald-500/10 text-emerald-500"
                  : order.status === "PENDING"
                  ? "bg-yellow-500/10 text-yellow-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {order.status === "SUCCESS" ? "สำเร็จ" : order.status === "PENDING" ? "รอดำเนินการ" : "ยกเลิก/ล้มเหลว"}
            </span>
          </div>
          <ChevronDown className={cn(
            "h-5 w-5 text-white/55 transition-transform",
            isExpanded && "rotate-180"
          )} />
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (order.accountCredentials || (order.licenseKeys?.length ?? 0) > 0) && (
        <div className="border-t border-white/10 bg-white/5 p-4">
          {(order.licenseKeys?.length ?? 0) > 0 ? (
            <>
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">License Key</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCredentials(!showCredentials)}
                  className="h-8 px-2 text-white/55 hover:bg-white/10 hover:text-white"
                >
                  {showCredentials ? (
                    <>
                      <EyeOff className="h-4 w-4 mr-1" />
                      ซ่อน
                    </>
                  ) : (
                    <>
                      <Eye className="h-4 w-4 mr-1" />
                      แสดง
                    </>
                  )}
                </Button>
              </div>
              <div className="space-y-3">
                {order.licenseKeys!.map((lk) => (
                  <div
                    key={lk.id}
                    className={cn(bw.innerPanel, "flex items-center justify-between p-3")}
                  >
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="mb-1 text-xs text-white/55">
                        Key
                        {lk.expiresAt
                          ? ` · หมดอายุ ${new Date(lk.expiresAt).toLocaleDateString("th-TH")}`
                          : " · ไม่หมดอายุ"}
                      </p>
                      <p className="truncate font-mono text-sm text-white">
                        {showCredentials ? lk.key : "••••-••••-••••-••••"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(lk.key, `key-${lk.id}`)}
                      className="h-8 w-8 flex-shrink-0 p-0 text-white/55 hover:bg-white/10 hover:text-white"
                      disabled={!showCredentials}
                    >
                      {copiedField === `key-${lk.id}` ? (
                        <Check className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/55">
                * ใช้ Key นี้ในโปรแกรม — รีเซ็ต HWID ได้ที่เมนู รีเซ็ตHWID
              </p>
            </>
          ) : null}

          {order.accountCredentials ? (
            <>
              {(order.licenseKeys?.length ?? 0) > 0 ? (
                <div className="my-4 border-t border-white/10" />
              ) : null}
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-sm font-medium text-white">ข้อมูลบัญชี</h4>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCredentials(!showCredentials)}
              className="h-8 px-2 text-white/55 hover:bg-white/10 hover:text-white"
            >
              {showCredentials ? (
                <>
                  <EyeOff className="h-4 w-4 mr-1" />
                  ซ่อน
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  แสดง
                </>
              )}
            </Button>
          </div>

          <div className="space-y-3">
            {order.accountCredentials.mode === "raw" ? (
              <div className={cn(bw.innerPanel, "flex items-center justify-between p-3")}>
                <div className="min-w-0 flex-1 mr-3">
                  <p className="mb-1 text-xs text-white/55">ข้อมูลสินค้า</p>
                  <pre className="whitespace-pre-wrap break-words text-sm font-mono text-white">
                    {showCredentials
                      ? order.accountCredentials.text
                      : "••••••••••••••••••••"}
                  </pre>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() =>
                    handleCopy(order.accountCredentials!.text, `raw-${order.id}`)
                  }
                  className="h-8 w-8 flex-shrink-0 p-0 text-white/55 hover:bg-white/10 hover:text-white"
                  disabled={!showCredentials}
                >
                  {copiedField === `raw-${order.id}` ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <>
                <div className={cn(bw.innerPanel, "flex items-center justify-between p-3")}>
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="mb-1 text-xs text-white/55">อีเมล</p>
                    <p className="truncate font-mono text-sm text-white">
                      {showCredentials
                        ? order.accountCredentials.email
                        : "••••••••••••@••••.com"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        order.accountCredentials!.email,
                        `email-${order.id}`
                      )
                    }
                    className="h-8 w-8 flex-shrink-0 p-0 text-white/55 hover:bg-white/10 hover:text-white"
                    disabled={!showCredentials}
                  >
                    {copiedField === `email-${order.id}` ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                <div className={cn(bw.innerPanel, "flex items-center justify-between p-3")}>
                  <div className="min-w-0 flex-1 mr-3">
                    <p className="mb-1 text-xs text-white/55">รหัสผ่าน</p>
                    <p className="truncate font-mono text-sm text-white">
                      {showCredentials
                        ? order.accountCredentials.password
                        : "••••••••••••"}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      handleCopy(
                        order.accountCredentials!.password,
                        `password-${order.id}`
                      )
                    }
                    className="h-8 w-8 flex-shrink-0 p-0 text-white/55 hover:bg-white/10 hover:text-white"
                    disabled={!showCredentials}
                  >
                    {copiedField === `password-${order.id}` ? (
                      <Check className="h-4 w-4 text-emerald-500" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </>
            )}
          </div>

          <p className="mt-3 text-xs text-white/55">
            * กรุณาเปลี่ยนรหัสผ่านทันทีหลังจากเข้าสู่ระบบครั้งแรก
          </p>
            </>
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className={cn(bw.panel, "p-6")}>
          <div className="flex min-h-[200px] items-center justify-center text-white/55">
            กำลังโหลด...
          </div>
        </div>
      }
    >
      <OrdersPageContent />
    </Suspense>
  )
}

function OrdersPageContent() {
  const searchParams = useSearchParams()
  const [orders, setOrders] = useState<OrderView[]>([])
  const [loading, setLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    fetch("/api/orders")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        setOrders(Array.isArray(data) ? data.map(mapOrder) : [])
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (searchParams.get("success") === "true") {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    }
  }, [searchParams])

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {showSuccess && (
        <div className="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-lg bg-emerald-500 px-4 py-3 text-white shadow-lg animate-in slide-in-from-right">
          <CheckCircle className="h-5 w-5" />
          <span>สั่งซื้อสินค้าสำเร็จ!</span>
        </div>
      )}

      {/* Header */}
      <div className={cn(bw.panel, "p-6")}>
        <h1 className="text-xl font-bold text-white">ประวัติการสั่งซื้อ</h1>
        <p className="text-sm text-white/55">รายการสั่งซื้อทั้งหมดของคุณ</p>
      </div>

      {/* Orders List or Empty State */}
      {loading ? (
        <div className={cn(bw.panel, "p-6")}>
          <div className="flex min-h-[200px] items-center justify-center text-white/55">
            กำลังโหลด...
          </div>
        </div>
      ) : orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      ) : (
        <div className={cn(bw.panel, "p-6")}>
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package className="h-20 w-20 text-white/25" />
            <h3 className="mt-4 text-lg font-semibold text-white">ไม่มีประวัติการสั่งซื้อ</h3>
            <p className="mt-2 text-white/55">เลือกซื้อสินค้าที่ร้านค้าได้เลย</p>
          </div>
        </div>
      )}
    </div>
  )
}
