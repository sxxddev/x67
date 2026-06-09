"use client"

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
  className?: string
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav className={cn("mb-6 flex items-center gap-2 text-sm", className)}>
      {items.map((item, index) => (
        <div key={item.href} className="flex items-center gap-2">
          {index > 0 && <ChevronRight className="h-4 w-4 text-white/40" />}
          <Link
            href={item.href}
            className={cn(
              "rounded-md px-3 py-1 transition-colors",
              index === items.length - 1
                ? "bg-white text-black"
                : "bg-white/10 text-white/70 hover:bg-white/15 hover:text-white"
            )}
          >
            {item.label.toUpperCase()}
          </Link>
        </div>
      ))}
    </nav>
  )
}
