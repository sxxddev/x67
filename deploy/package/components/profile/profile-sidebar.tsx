"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"
import {
  LayoutGrid,
  ShoppingBag,
  Wallet,
  Lock,
  LogOut,
  ChevronRight,
} from "lucide-react"
import { UserAvatar } from "@/components/user-avatar"

const menuItems = [
  { href: "/profile", label: "ภาพรวมบัญชี", icon: LayoutGrid },
  { href: "/profile/orders", label: "ประวัติการสั่งซื้อ", icon: ShoppingBag },
  { href: "/profile/topup-history", label: "ประวัติการเติมเงิน", icon: Wallet },
  { href: "/profile/change-password", label: "เปลี่ยนรหัสผ่าน", icon: Lock },
]

type SessionUser = {
  userId?: number
  username?: string | null
  email?: string | null
  image?: string | null
  balance?: number
  role?: string
}

export function ProfileSidebar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const storeUser = useStore((s) => s.user)

  const su = (session?.user ?? {}) as SessionUser
  const isAuthed = status === "authenticated"

  const username =
    storeUser?.username || su.username || su.email?.split("@")[0] || "ผู้ใช้"
  const email = storeUser?.email || su.email || "—"
  const balance =
    typeof storeUser?.balance === "number"
      ? storeUser.balance
      : typeof su.balance === "number"
        ? su.balance
        : 0
  const role = storeUser?.role || su.role || "USER"
  const userId =
    storeUser?.id ||
    (typeof su.userId === "number" ? su.userId : null)
  return (
    <aside
      className={cn(
        bw.panel,
        "w-full shrink-0 self-start p-6 lg:w-[300px] lg:max-w-[300px]"
      )}
    >
      <div className="flex flex-col items-center text-center">
        <UserAvatar
          className="h-24 w-24"
          iconClassName="text-3xl"
          showOnlineDot={isAuthed}
        />
        <h2 className="mt-4 text-lg font-bold text-white">{username}</h2>
        <p className={bw.subtitle}>{email}</p>
        {userId ? (
          <p className="text-xs text-white/45">ID: {userId}</p>
        ) : null}
        <p className="mt-2 text-lg font-semibold tabular-nums text-white">
          {balance.toLocaleString("th-TH")} บาท
        </p>
        <span className="mt-2 rounded-md border border-white/15 px-3 py-1 text-xs font-medium uppercase tracking-wide text-white/70">
          {role}
        </span>
      </div>

      <nav className="mt-8 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(bw.navItem, isActive && bw.navItemActive)}
            >
              <div className="flex items-center gap-3">
                <Icon className="h-5 w-5" />
                {item.label}
              </div>
              {isActive && <ChevronRight className="h-4 w-4" />}
            </Link>
          )
        })}

        <button
          type="button"
          onClick={() => void signOut({ callbackUrl: "/" })}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut className="h-5 w-5" />
          ออกจากระบบ
        </button>
      </nav>
    </aside>
  )
}
