"use client"

import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { usePathname, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Package,
  Users,
  ShoppingCart,
  Wallet,
  ChevronLeft,
  ChevronRight,
  Store,
  LogOut,
  Tags,
  Ticket,
  Gift,
  Settings,
  Key,
  KeyRound,
} from "lucide-react"
import { signOut } from "next-auth/react"
import { cn } from "@/lib/utils"
import { UserAvatar } from "@/components/user-avatar"
import { bw } from "@/lib/bw-theme"

const sidebarLinks = [
  { href: "/admin", label: "ภาพรวม", icon: LayoutDashboard },
  { href: "/admin/categories", label: "หมวดหมู่", icon: Tags },
  { href: "/admin/products", label: "สินค้า", icon: Package },
  { href: "/admin/users", label: "ผู้ใช้งาน", icon: Users },
  { href: "/admin/orders", label: "การสั่งซื้อ", icon: ShoppingCart },
  { href: "/admin/topups", label: "การเติมเงิน", icon: Wallet },
  { href: "/admin/hwid", label: "รีเซ็ต HWID", icon: Key },
  { href: "/admin/license-keys", label: "License Key", icon: KeyRound },
  { href: "/admin/coupons", label: "คูปอง", icon: Ticket },
  { href: "/admin/settings", label: "ตั้งค่าระบบ", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && ((session?.user as any)?.role || "").toLowerCase() !== "admin") {
      router.push("/")
    }
  }, [status, session, router])

  if (status === "loading") {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    )
  }

  if (status !== "authenticated" || ((session?.user as any)?.role || "").toLowerCase() !== "admin") {
    return null
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col border-r border-white/10 bg-black/90 backdrop-blur-xl transition-all duration-300",
          collapsed ? "w-[68px]" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2.5 border-b border-white/10 px-4">
          <BrandLogo width={36} height={36} className="h-9 w-9 shrink-0" />
          {!collapsed && (
            <span className="text-lg font-black tracking-tight text-white">ADMIN</span>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {sidebarLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href))
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(bw.adminNavItem, isActive && bw.adminNavItemActive)}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span>{link.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn("w-full", bw.adminNavItem)}
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5 flex-shrink-0" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5 flex-shrink-0" />
                <span>ย่อเมนู</span>
              </>
            )}
          </button>
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-white transition-all hover:bg-white/10",
              collapsed && "justify-center"
            )}
          >
            <Store className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>กลับหน้าร้านค้า</span>}
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className={cn(
              "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-bold text-red-400 transition-all hover:bg-red-500/10",
              collapsed && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {!collapsed && <span>ออกจากระบบ</span>}
          </button>

          {/* User Info */}
          {!collapsed && session?.user && (
            <div className="mt-2 flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2.5">
              <UserAvatar className="h-8 w-8" iconClassName="text-xs" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">
                  {(session.user as any).username || session.user.name}
                </p>
                <p className="text-xs text-white/55">Admin</p>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  )
}
