"use client"

import { Users, UserCheck, Layers, ShoppingCart } from "lucide-react"

const stats = [
  {
    label: "จำนวนผู้เล่น",
    value: "487",
    icon: Users,
  },
  {
    label: "ผู้ใช้งาน",
    value: "7,217",
    icon: UserCheck,
  },
  {
    label: "หมวดหมู่",
    value: "11",
    icon: Layers,
  },
  {
    label: "การสั่งซื้อ",
    value: "17,418",
    icon: ShoppingCart,
  },
]

export function StatsSection() {
  return (
    <section className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="group flex items-center justify-between rounded-xl border border-border bg-white p-4 shadow-sm transition-all hover:shadow-md hover:border-primary/30"
          >
            <div>
              <p className="text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
              <p className="text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
            </div>
            <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-primary opacity-70 group-hover:opacity-100 transition-opacity" />
          </div>
        )
      })}
    </section>
  )
}
