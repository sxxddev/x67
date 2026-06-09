"use client"

export type PageTransitionNavigate = (href: string) => void

let navigateHandler: PageTransitionNavigate | null = null

export function registerPageTransitionNavigate(handler: PageTransitionNavigate | null) {
  navigateHandler = handler
}

export function getPageTransitionNavigate() {
  return navigateHandler
}

export function isAnimatedInternalPath(pathname: string) {
  return !pathname.startsWith("/admin")
}

/** กลุ่มเส้นทางที่ใช้ key เดียว — ไม่รีเมานต์ layout ย่อย (เช่น profile sidebar) */
export function getPageTransitionKey(pathname: string) {
  if (pathname.startsWith("/profile")) return "/profile"
  return pathname
}

/** เส้นทางร้านค้า — transition ช้ากว่าเล็กน้อยให้รู้สึก premium */
export function isStorePath(pathname: string) {
  return pathname === "/store" || pathname.startsWith("/store/")
}

export function isProfilePath(pathname: string) {
  return pathname.startsWith("/profile")
}

export function isFeatureMenuPath(pathname: string) {
  return (
    pathname === "/api-docs" ||
    pathname.startsWith("/program-status") ||
    pathname === "/reset-hwid"
  )
}

export function getPageTransitionTiming(pathname: string) {
  if (isStorePath(pathname)) {
    return { exitMs: 480, enterMs: 680 }
  }
  if (isProfilePath(pathname) || isFeatureMenuPath(pathname)) {
    return { exitMs: 360, enterMs: 520 }
  }
  return { exitMs: 380, enterMs: 480 }
}
