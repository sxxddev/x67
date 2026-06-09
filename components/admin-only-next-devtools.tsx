"use client"

import { useSession } from "next-auth/react"
import { useEffect } from "react"

const STYLE_ID = "x67-hide-next-devtools"

function isAdminSession(session: ReturnType<typeof useSession>["data"]) {
  return (
    ((session?.user as { role?: string } | undefined)?.role ?? "").toLowerCase() ===
    "admin"
  )
}

/** ซ่อน Next.js Dev Tools (ปุ่ม N) จากผู้ใช้ทั่วไป — เฉพาะ admin เห็นในโหมด dev */
export function AdminOnlyNextDevTools() {
  const { data: session, status } = useSession()

  useEffect(() => {
    if (process.env.NODE_ENV === "production") return

    const shouldHide = status !== "authenticated" || !isAdminSession(session)

    const apply = () => {
      const existing = document.getElementById(STYLE_ID)
      if (shouldHide) {
        if (!existing) {
          const style = document.createElement("style")
          style.id = STYLE_ID
          style.textContent = `
            #devtools-indicator,
            #next-logo,
            [data-nextjs-dev-tools-button],
            [data-nextjs-dev-tools-menu] {
              display: none !important;
              visibility: hidden !important;
              pointer-events: none !important;
            }
          `
          document.head.appendChild(style)
        }
      } else {
        existing?.remove()
      }
    }

    apply()

    const observer = new MutationObserver(apply)
    observer.observe(document.documentElement, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      document.getElementById(STYLE_ID)?.remove()
    }
  }, [session, status])

  return null
}
