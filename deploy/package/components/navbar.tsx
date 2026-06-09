"use client"

import { BrandLogo } from "@/components/brand-logo"
import { TransitionLink } from "@/components/transition-link"
import { UserAvatar } from "@/components/user-avatar"
import { usePathname } from "next/navigation"
import { useState, useEffect, type ReactNode } from "react"
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
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  LayoutGrid,
  Signal,
  Book,
  Key,
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
  { href: "/reset-hwid", label: "รีเซ็ตHWID", icon: Key },
  { href: "/profile/orders", label: "ประวัติ", icon: History },
  { href: DISCORD_URL, label: "ติดต่อเรา", icon: null, external: true },
] as const

const mobileBottomLinks = navLinks.filter((link) => !("external" in link && link.external))

/** รอ URL จากผู้ใช้ — ใส่ href เมื่อพร้อม */
const moreMenuLinks = [
  {
    key: "antibot",
    href: "/program-status" as string | null,
    title: "สถานะโปรแกรม",
    desc: "ตรวจสอบสถานะระบบ",
    icon: Signal,
  },
  {
    key: "api-docs",
    href: "/api-docs" as string | null,
    title: "โปรเต็มระบบ API",
    desc: "Native Hook API",
    icon: Book,
  },
] as const

const moreMenuContentClass =
  "w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-white/10 p-0 text-white bg-[rgba(15,15,16,0.92)] backdrop-blur-[16px] shadow-[rgba(0,0,0,0.7)_0px_20px_40px_-10px]"

const moreMenuTriggerClass =
  "flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-2 text-[15px] font-normal leading-none text-white opacity-[0.85] outline-none ring-0 transition-all duration-200 hover:bg-white/[0.08] hover:opacity-100 focus:outline-none focus-visible:ring-0 data-[state=open]:bg-white/[0.08] data-[state=open]:opacity-100"

const userMenuContentClass =
  "w-[280px] overflow-hidden rounded-xl border-0 p-0 text-white bg-[rgba(15,15,16,0.85)] backdrop-blur-[16px] shadow-[rgba(248,248,248,0.06)_2px_4px_16px_0px_inset,rgba(0,0,0,0.7)_0px_20px_40px_-10px]"

const userMenuItemClass =
  "cursor-pointer gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-normal text-white/85 focus:bg-white/[0.06] focus:text-white data-[highlighted]:bg-white/[0.06] data-[highlighted]:text-white [&_svg]:h-[15px] [&_svg]:w-[15px] [&_svg]:shrink-0 [&_svg]:text-white/70"

const userDropdownLinks = [
  { href: "/store", label: "ร้านค้า", icon: Store },
  { href: "/topup", label: "เติมเงิน", icon: DollarSign },
  { href: "/reset-hwid", label: "รีเซ็ต HWID", icon: Key },
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

function isLinkActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/"
  return pathname === href || pathname.startsWith(`${href}/`)
}

function desktopNavLinkClass(pathname: string, href: string) {
  const active = isLinkActive(pathname, href)
  return cn(
    "shrink-0 whitespace-nowrap rounded-md px-3 py-2 text-[15px] font-normal leading-none text-white transition-all duration-200",
    "hover:bg-white/[0.08] hover:opacity-100",
    active ? "opacity-100" : "opacity-[0.85]"
  )
}

const userProfileTriggerClass =
  "flex h-10 shrink-0 items-center gap-2 rounded-full bg-white/[0.08] py-1 pl-1 pr-4 outline-none ring-0 transition-[background-color] duration-150 hover:bg-white/[0.12] focus:outline-none focus-visible:outline-none focus-visible:ring-0 data-[state=open]:bg-white/[0.08] data-[state=open]:hover:bg-white/[0.12]"

function MoreFunctionsMenu() {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <button type="button" className={moreMenuTriggerClass}>
          <MoreHorizontal className="h-4 w-4 shrink-0" strokeWidth={2} />
          <span>ฟังก์ชันเพิ่มเติม</span>
          <ChevronDown className="ml-0.5 h-2.5 w-2.5 shrink-0 opacity-60" strokeWidth={2} />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        sideOffset={8}
        className={moreMenuContentClass}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
          <LayoutGrid className="h-4 w-4 shrink-0 text-white/70" strokeWidth={2} />
          <span className="text-sm font-medium text-white">ฟังก์ชันเพิ่มเติม</span>
        </div>
        <div className="p-1.5">
          {moreMenuLinks.map(({ key, href, title, desc, icon: Icon }) => {
            const itemClass =
              "flex w-full items-center gap-3 rounded-lg px-2 py-2.5 text-left transition-[transform,background-color] duration-200 hover:bg-white/[0.06] active:scale-[0.98]"

            const inner = (
              <>
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5">
                  <Icon className="h-4 w-4 text-white/80" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-medium text-white">{title}</div>
                  <div className="text-[11px] text-white/45">{desc}</div>
                </div>
                <ChevronRight className="h-3.5 w-3.5 shrink-0 text-white/35" strokeWidth={2} />
              </>
            )

            if (href) {
              return (
                <TransitionLink key={key} href={href} className={itemClass}>
                  {inner}
                </TransitionLink>
              )
            }

            return (
              <button
                key={key}
                type="button"
                className={cn(itemClass, "cursor-default opacity-90")}
                disabled
                title="ลิงก์จะเปิดใช้เร็วๆ นี้"
              >
                {inner}
              </button>
            )
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const SCROLL_THRESHOLD = 20

function UserProfileMenu({
  user,
  trigger,
  contentSide = "bottom",
}: {
  user: SessionUser
  trigger: ReactNode
  contentSide?: "top" | "bottom"
}) {
  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={contentSide}
        sideOffset={8}
        className={userMenuContentClass}
        onCloseAutoFocus={(e) => e.preventDefault()}
      >
        {renderUserMenuContent(user)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
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
          <UserAvatar className="h-10 w-10" iconClassName="text-sm" />
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
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const isAdmin = pathname?.startsWith("/admin")
  if (isAdmin) return null

  const user = session?.user as SessionUser | undefined
  const isAuthenticated = status === "authenticated" && !!user
  const balance = typeof user?.balance === "number" ? user.balance : 0

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-[10001] flex w-full justify-center pt-3">
        {/* Desktop */}
        <nav
          className={cn(
            "hidden w-[min(68rem,calc(100vw-32px))] items-center justify-between gap-3 rounded-xl px-5 text-white md:flex",
            "transition-all duration-300 ease-out",
            scrolled
              ? "py-3 shadow-[0_6px_20px_-8px_rgba(0,0,0,0.45),inset_0_1px_0_0_rgba(255,255,255,0.05)] backdrop-blur-md"
              : "py-4 shadow-none backdrop-blur-none"
          )}
          style={{
            backgroundColor: scrolled ? "rgba(23, 23, 23, 0.75)" : "rgba(23, 23, 23, 0)",
          }}
          aria-label="หลัก"
        >
          <TransitionLink href="/" className="flex shrink-0 items-center gap-2.5">
            <BrandLogo width={34} height={34} className="h-[34px] w-[34px] shrink-0" priority />
          </TransitionLink>

          <div className="flex min-w-0 flex-1 items-center justify-center gap-0.5">
            {navLinks.map((link) => {
              if ("external" in link && link.external) {
                return (
                  <button
                    key={link.href}
                    type="button"
                    onClick={() => window.open(link.href, "_blank", "noopener,noreferrer")}
                    className={desktopNavLinkClass(pathname, link.href)}
                    style={{ border: "none" }}
                  >
                    {link.label}
                  </button>
                )
              }
              return (
                <TransitionLink
                  key={link.href}
                  href={link.href}
                  className={desktopNavLinkClass(pathname, link.href)}
                >
                  {link.label}
                </TransitionLink>
              )
            })}
            <MoreFunctionsMenu />
          </div>

          <div className="flex min-w-[140px] shrink-0 items-center justify-end">
            {isAuthenticated && user ? (
              <UserProfileMenu
                user={user}
                trigger={
                  <button type="button" className={userProfileTriggerClass}>
                    <UserAvatar className="h-8 w-8" iconClassName="text-xs" />
                    <span className="max-w-[110px] truncate text-[14px] font-normal text-white">
                      {user.username || user.name}
                    </span>
                  </button>
                }
              />
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
        <div
          className={cn(
            "md:hidden flex items-center justify-between transition-all duration-300 ease-out",
            scrolled && "backdrop-blur-[16px]"
          )}
          style={{
            position: "fixed",
            left: 12,
            right: 12,
            top: 12,
            zIndex: 10001,
            height: 52,
            padding: "0 14px 0 12px",
            borderRadius: 14,
            background: scrolled ? "rgba(18, 19, 20, 0.78)" : "rgba(18, 19, 20, 0)",
            backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
            WebkitBackdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
            boxShadow: scrolled
              ? "rgba(0, 0, 0, 0.45) 0px 6px 20px -8px, rgba(255, 255, 255, 0.05) 0px 1px 0px 0px inset"
              : "none",
          }}
        >
          <TransitionLink href="/" className="flex min-w-0 items-center gap-2">
            <BrandLogo width={28} height={28} className="h-7 w-7 shrink-0" priority />
          </TransitionLink>

          {isAuthenticated ? (
            <TransitionLink
              href="/topup"
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/25 bg-white/10 px-[11px] py-1.5 no-underline"
            >
              <DollarSign className="h-3 w-3 text-white" strokeWidth={2} />
              <span className="text-xs font-medium tracking-wide text-white">
                ฿{balance.toLocaleString("th-TH")}
              </span>
            </TransitionLink>
          ) : (
            <AuthLinkButton
              mode="login"
              className="shrink-0 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-medium text-white"
            >
              เข้าสู่ระบบ
            </AuthLinkButton>
          )}
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden flex items-center justify-around"
        style={{
          position: "fixed",
          left: 16,
          right: 88,
          bottom: 16,
          zIndex: 10001,
          height: 58,
          padding: "0 4px",
          background: "rgba(18, 19, 20, 0.78)",
          backdropFilter: "blur(18px) saturate(140%)",
          WebkitBackdropFilter: "blur(18px) saturate(140%)",
          borderRadius: 20,
          boxShadow:
            "0 8px 24px -8px rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.05)",
        }}
        aria-label="มือถือ"
      >
        {mobileBottomLinks.map((link) => {
          const Icon = link.icon
          if (!Icon) return null
          const active = isLinkActive(pathname, link.href)
          return (
            <TransitionLink
              key={link.href}
              href={link.href}
              className="flex h-full flex-1 flex-col items-center justify-center gap-0.5 no-underline transition-colors"
              style={{ color: active ? "#fff" : "rgba(255,255,255,0.5)" }}
            >
              <Icon className="h-[19px] w-[19px]" strokeWidth={2} />
              <span
                className="text-[10px] leading-none tracking-wide"
                style={{
                  fontWeight: active ? 500 : 400,
                  opacity: active ? 1 : 0.85,
                }}
              >
                {link.label}
              </span>
            </TransitionLink>
          )
        })}
      </nav>

      {/* Mobile FAB */}
      {isAuthenticated && user ? (
        <UserProfileMenu
          user={user}
          contentSide="top"
          trigger={
            <button
              type="button"
              aria-label="menu"
              className="md:hidden flex items-center justify-center focus:outline-none focus-visible:outline-none focus-visible:ring-0 data-[state=open]:opacity-100"
              style={{
                position: "fixed",
                right: 16,
                bottom: 16,
                zIndex: 10003,
                width: 58,
                height: 58,
                borderRadius: "50%",
                border: "none",
                background: "#fff",
                color: "#000",
                boxShadow:
                  "0 8px 22px -4px rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.35)",
                cursor: "pointer",
              }}
            >
              <UserAvatar className="h-10 w-10" iconClassName="text-base" />
            </button>
          }
        />
      ) : (
        <button
          type="button"
          aria-label="menu"
          className="md:hidden flex items-center justify-center"
          style={{
            position: "fixed",
            right: 16,
            bottom: 16,
            zIndex: 10003,
            width: 58,
            height: 58,
            borderRadius: "50%",
            border: "none",
            background: "#fff",
            color: "#000",
            boxShadow:
              "0 8px 22px -4px rgba(0,0,0,0.45), inset 0 1px 0 0 rgba(255,255,255,0.35)",
            cursor: "pointer",
          }}
          onClick={() => setMobileGuestOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
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

      {/* Spacers — pt-3 header + nav height */}
      <div className="hidden h-[84px] shrink-0 md:block" aria-hidden />
      <div className="h-[64px] shrink-0 md:hidden" aria-hidden />
      <div className="h-[74px] shrink-0 md:hidden" aria-hidden />
    </>
  )
}
