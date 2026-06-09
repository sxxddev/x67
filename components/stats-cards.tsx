"use client"

import { useEffect, useState, type ComponentType, type SVGProps } from "react"
import { Users } from "lucide-react"
import { cn } from "@/lib/utils"

type StatKey = "users" | "products" | "stock" | "sold"

type StatsData = Record<StatKey, number>

type StatIconProps = SVGProps<SVGSVGElement> & { strokeWidth?: number }

function ProductsIcon({ className, strokeWidth = 2, ...props }: StatIconProps) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  )
}

function StockIcon({ className, strokeWidth = 2, ...props }: StatIconProps) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}

function SoldIcon({ className, strokeWidth = 2, ...props }: StatIconProps) {
  return (
    <svg
      stroke="currentColor"
      fill="none"
      strokeWidth={strokeWidth}
      viewBox="0 0 24 24"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

const statConfig: {
  key: StatKey
  label: string
  suffix: string
  Icon: ComponentType<StatIconProps>
}[] = [
  { key: "users", label: "ผู้ใช้งาน", suffix: "คน", Icon: Users },
  { key: "products", label: "สินค้า", suffix: "รายการ", Icon: ProductsIcon },
  { key: "stock", label: "คลังสินค้า", suffix: "ชิ้น", Icon: StockIcon },
  { key: "sold", label: "ขายแล้ว", suffix: "ชิ้น", Icon: SoldIcon },
]

type StatsCardsProps = {
  className?: string
}

export function StatsCards({ className }: StatsCardsProps) {
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.users !== undefined) {
          setStats({
            users: data.users,
            products: data.products,
            stock: data.stock,
            sold: data.sold,
          })
        }
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4",
        className
      )}
    >
      {statConfig.map(({ key, label, suffix, Icon }) => (
        <div
          key={key}
          className="relative flex min-h-[72px] items-center gap-3 overflow-hidden rounded-xl border border-white/10 bg-black/50 px-[18px] py-4 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        >
          <div
            className="pointer-events-none absolute -bottom-1.5 -right-1.5 opacity-[0.06]"
            aria-hidden
          >
            <Icon className="h-[52px] w-[52px] text-white" strokeWidth={2} />
          </div>

          <div className="relative z-[1] flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] border border-white/15 bg-white/10">
            <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2} />
          </div>

          <div className="relative z-[1] min-w-0">
            <p className="mb-0.5 text-[11px] text-white/55">{label}</p>
            <p className="whitespace-nowrap text-lg font-normal text-white">
              {loading || !stats ? (
                <span className="inline-block h-6 w-16 animate-pulse rounded bg-white/10" />
              ) : (
                <>
                  {stats[key].toLocaleString("th-TH")}
                  <span className="ml-1 text-[11px] text-white/45">{suffix}</span>
                </>
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
