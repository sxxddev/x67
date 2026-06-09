"use client"

import { usePathname, useRouter } from "next/navigation"
import type { ComponentProps, MouseEvent } from "react"
import { usePageTransition } from "@/components/page-transition"
import { isAnimatedInternalPath } from "@/lib/page-transition-nav"

type TransitionLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string
}

function normalizeHref(href: string) {
  if (href.startsWith("/")) return href
  return `/${href}`
}

function isModifiedClick(e: MouseEvent<HTMLAnchorElement>) {
  return (
    e.defaultPrevented ||
    e.metaKey ||
    e.ctrlKey ||
    e.shiftKey ||
    e.altKey ||
    e.button !== 0
  )
}

export function TransitionLink({
  href,
  onClick,
  onMouseEnter,
  children,
  ...props
}: TransitionLinkProps) {
  const pathname = usePathname()
  const router = useRouter()
  const ctx = usePageTransition()
  const target = normalizeHref(href)

  const pathOnly = target.split("?")[0].split("#")[0] || "/"
  const useTransition = isAnimatedInternalPath(pathOnly)

  const current =
    pathname +
    (typeof window !== "undefined" ? window.location.search : "") +
    (typeof window !== "undefined" ? window.location.hash : "")

  return (
    <a
      href={target}
      onMouseEnter={(e) => {
        onMouseEnter?.(e)
        if (useTransition) router.prefetch(target)
      }}
      onClick={(e) => {
        onClick?.(e)
        if (isModifiedClick(e)) return
        if (!useTransition) return

        if (target === current || target === pathname) {
          e.preventDefault()
          return
        }

        e.preventDefault()
        const go = ctx?.navigate
        if (go) go(target)
        else router.push(target)
      }}
      {...props}
    >
      {children}
    </a>
  )
}
