import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const target = path.join(__dirname, "..", "components", "navbar.tsx")

const content = `"use client"

import Image from "next/image"
import { TransitionLink } from "@/components/transition-link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { useSession, signOut as nextAuthSignOut } from "next-auth/react"
import {
  Home,
  DollarSign,
  Store,
  History,
  Menu,
  X,
  User,
  Wallet,
  LogOut,
  LayoutDashboard,
} from "lucide-react"
import { SITE_BRAND_NAME } from "@/lib/brand"
import { AuthLinkButton } from "@/components/auth-link-button"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const DISCORD_URL =
  process.env.NEXT_PUBLIC_DISCORD_TICKET_URL ?? "https://discord.com"

const navLinks = [
  { href: "/", label: "หน้าหลัก", icon: Home },
  { href: "/store", label: "ร้านค้า", icon: Store },
  { href: "/topup", label: "เติมเงิน", icon: DollarSign },
  { href: "/profile/orders", label: "ประวัติ", icon: History },
  { href: DISCORD_URL, label: "ติดต่อเรา", icon: null, external: true },
] as const

const mobileBottomLinks = navLinks.filter((link) => !("external" in link && link.external))

const userMenuContentClass =
  "w-[280px] overflow-hidden rounded-xl border-0 p-0 text-white bg-[rgba(15,15,16,0.85)] backdrop-blur-[16px] shadow-[rgba(248,248,248,0.06)_2px_4px_16px_0px_inset,rgba(0,0,0,0.7)_0px_20px_40px_-10px]"

const userMenuItemClass =
  "cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-normal text-white/85 focus:bg-white/[0.06] focus:text-white data-[highlighted]:bg-white/[0.06] data-[highlighted]:text-white [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:shrink-0 [&_svg]:text-white/70"

const userDropdownLinks = [
  { href: "/store", label: "ร้านค้า", icon: Store },
  { href: "/topup", label: "เติมเงิน", icon: DollarSign },
  { href: "/profile/orders", label: "ประวัติการซื้อสินค้า", icon: History },
  { href: "/profile/topup-history", label: "ประวัติการเติมเงิน", icon: Wallet },
  { href: "/profile", label: "โปรไฟล์", icon: User },
] as const

type SessionUser = {
  name?: string | null
  image?: string | null
  username?: string
  balance?: number
  role?: string
}

function UserAvatar({
  user,
  className,
  letterClassName,
}: {
  user: SessionUser
  className?: string
  letterClassName?: string
}) {
  const initial = (user.username || user.name || "U").charAt(0).toUpperCase()

  if (user.image) {
    return (
      <img
        src={user.image}
        alt=""
        className={cn("rounded-full object-cover", className)}
      />
    )
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full bg-white/15 font-semibold text-white",
        className
      )}
    >
      <span className={letterClassName}>{initial}</span>
    </div>
  )
}

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(\`\${href}/\`)
}

function renderUserMenuContent(
  user: SessionUser,
  onNavigate?: () => void
) {
  const balance = typeof user.balance === "number" ? user.balance : 0
  const displayName = user.username || user.name || "ผู้ใช้"
  const isAdminRole = (user.role || "").toLowerCase() === "admin"

  return (
    <div className="p-1">
      <div className="border-b border-white/10 px-3 py-3">
        <div className="flex items-center gap-3">
          <UserAvatar user={user} className="h-10 w-10" letterClassName="text-sm" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{displayName}</p>
            <p className="text-xs text-white/55">ยอดเงินคงเหลือ</p>
            <p className="text-sm font-medium text-white">
              {balance.toLocaleString("th-TH")} <span className="text-xs text-white/45">บาท</span>
            </p>
          </div>
        </div>
      </div>

      <div className="p-1">
        {userDropdownLinks.map((link) => {
          const Icon = link.icon
          return (
            <DropdownMenuItem key={link.href} className={userMenuItemClass} asChild>
              <TransitionLink href={link.href} onClick={onNavigate}>
                <Icon />
                {link.label}
              </TransitionLink>
            </DropdownMenuItem>
          )
        })}

        {isAdminRole ? (
          <DropdownMenuItem className={userMenuItemClass} asChild>
            <TransitionLink href="/admin" onClick={onNavigate}>
              <LayoutDashboard />
              แดชบอร์ดแอดมิน
            </TransitionLink>
          </DropdownMenuItem>
        ) : null}

        <DropdownMenuItem
          className={cn(userMenuItemClass, "text-red-300 focus:text-red-200")}
          onSelect={(e) => {
            e.preventDefault()
            onNavigate?.()
            void nextAuthSignOut({ callbackUrl: "/" })
          }}
        >
          <LogOut />
          ออกจากระบบ
        </DropdownMenuItem>
      </div>
    </div>
  )
}

export function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileGuestOpen, setMobileGuestOpen] = useState(false)

  const isAdmin = pathname?.startsWith("/admin")
  if (isAdmin) return null

  const user = session?.user as SessionUser | undefined
  const isAuthenticated = status === "authenticated" && !!user
  const balance = typeof user?.balance === "number" ? user.balance : 0

  const desktopLinkClass = (href: string) =>
    cn(
      "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isLinkActive(pathname, href)
        ? "bg-white/15 text-white"
        : "text-white/70 hover:bg-white/10 hover:text-white"
    )

  const mobileBottomItemClass = (href: string) =>
    cn(
      "flex flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
      isLinkActive(pathname, href) ? "text-white" : "text-white/45"
    )

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[10001] flex w-full justify-center">
        {/* Desktop */}
        <nav
          className="hidden w-[min(68rem,calc(100vw-16px))] items-center justify-between rounded-xl bg-[rgba(23,23,23,0)] px-7 py-4 md:flex"
          aria-label="หลัก"
        >
          <div className="flex items-center gap-8">
            <TransitionLink href="/" className="flex shrink-0 items-center gap-2.5">
              <Image src="/icon.svg" alt={SITE_BRAND_NAME} width={34} height={34} className="rounded" />
              <span className="text-sm font-semibold text-white">{SITE_BRAND_NAME}</span>
            </TransitionLink>

            <div className="flex items-center gap-1">
              {navLinks.map((link) => {
                if ("external" in link && link.external) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={desktopLinkClass(link.href)}
                    >
                      {link.label}
                    </a>
                  )
                }
                return (
                  <TransitionLink
                    key={link.href}
                    href={link.href}
                    className={desktopLinkClass(link.href)}
                  >
                    {link.label}
                  </TransitionLink>
                )
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/5 py-1.5 pl-1.5 pr-4 text-left transition-colors hover:bg-white/10"
                  >
                    <UserAvatar user={user} className="h-8 w-8" letterClassName="text-xs" />
                    <span className="max-w-[120px] truncate text-sm font-medium text-white">
                      {user.username || user.name}
                    </span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className={userMenuContentClass}>
                  {renderUserMenuContent(user)}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <AuthLinkButton
                  mode="login"
                  className="rounded-lg border border-white/15 px-4 py-2 text-sm font-medium text-white/85 transition-colors hover:bg-white/10 hover:text-white"
                >
                  เข้าสู่ระบบ
                </AuthLinkButton>
                <AuthLinkButton
                  mode="register"
                  className="rounded-lg bg-white px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-white/90"
                >
                  สมัครสมาชิก
                </AuthLinkButton>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile top bar */}
        <div className="pointer-events-none fixed inset-x-0 top-3 z-[10001] flex justify-center px-2 md:hidden">
          <div className="pointer-events-auto flex w-full max-w-lg items-center justify-between rounded-full border border-white/10 bg-black/50 px-3 py-2 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.65)] backdrop-blur-xl">
            <TransitionLink href="/" className="flex items-center gap-2">
              <Image src="/icon.svg" alt={SITE_BRAND_NAME} width={30} height={30} className="rounded" />
            </TransitionLink>

            {isAuthenticated ? (
              <TransitionLink
                href="/topup"
                className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-medium text-white"
              >
                <Wallet className="h-3.5 w-3.5 text-white/70" />
                {balance.toLocaleString("th-TH")} บาท
              </TransitionLink>
            ) : (
              <AuthLinkButton
                mode="login"
                className="rounded-full bg-white px-4 py-1.5 text-xs font-bold text-black"
              >
                เข้าสู่ระบบ
              </AuthLinkButton>
            )}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-[10001] border-t border-white/10 bg-black/60 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur-xl md:hidden"
        aria-label="มือถือ"
      >
        <div className="mx-auto flex max-w-lg items-stretch justify-between">
          {mobileBottomLinks.map((link) => {
            const Icon = link.icon
            if (!Icon) return null
            return (
              <TransitionLink
                key={link.href}
                href={link.href}
                className={mobileBottomItemClass(link.href)}
              >
                <Icon className="h-5 w-5" strokeWidth={1.75} />
                <span>{link.label}</span>
              </TransitionLink>
            )
          })}
        </div>
      </nav>

      {/* Mobile FAB — authenticated */}
      {isAuthenticated && user ? (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-[10002] md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-base font-bold text-black shadow-lg"
                aria-label="เมนูผู้ใช้"
              >
                {(user.username || user.name || "U").charAt(0).toUpperCase()}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className={userMenuContentClass}>
              {renderUserMenuContent(user)}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
        <div className="fixed bottom-[calc(4.5rem+env(safe-area-inset-bottom))] right-4 z-[10002] md:hidden">
          <button
            type="button"
            onClick={() => setMobileGuestOpen(true)}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg"
            aria-label="เปิดเมนู"
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Guest mobile menu overlay */}
      {mobileGuestOpen ? (
        <div className="fixed inset-0 z-[10003] md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="ปิดเมนู"
            onClick={() => setMobileGuestOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] overflow-y-auto rounded-t-2xl border border-white/10 bg-[rgba(15,15,16,0.95)] p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-white">เมนู</p>
              <button
                type="button"
                onClick={() => setMobileGuestOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              {navLinks.map((link) => {
                if ("external" in link && link.external) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg px-3 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
                      onClick={() => setMobileGuestOpen(false)}
                    >
                      {link.label}
                    </a>
                  )
                }
                return (
                  <TransitionLink
                    key={link.href}
                    href={link.href}
                    className="rounded-lg px-3 py-3 text-sm font-medium text-white/85 hover:bg-white/10"
                    onClick={() => setMobileGuestOpen(false)}
                  >
                    {link.label}
                  </TransitionLink>
                )
              })}
            </div>

            <div className="mt-4 flex flex-col gap-2 border-t border-white/10 pt-4">
              <AuthLinkButton
                mode="login"
                className="w-full rounded-xl border border-white/15 py-3 text-center text-sm font-medium text-white"
              >
                เข้าสู่ระบบ
              </AuthLinkButton>
              <AuthLinkButton
                mode="register"
                className="w-full rounded-xl bg-white py-3 text-center text-sm font-bold text-black"
              >
                สมัครสมาชิก
              </AuthLinkButton>
            </div>
          </div>
        </div>
      ) : null}

      {/* Spacers */}
      <div className="hidden h-[72px] shrink-0 md:block" aria-hidden />
      <div className="h-[64px] shrink-0 md:hidden" aria-hidden />
      <div className="h-[74px] shrink-0 md:hidden" aria-hidden />
    </>
  )
}
`

fs.writeFileSync(target, content, "utf8")
console.log("Wrote", target, "bytes:", fs.statSync(target).size)
