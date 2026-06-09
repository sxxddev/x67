"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

type AuthLinkProps = {
  mode: "login" | "register"
  children: React.ReactNode
  className?: string
}

export function AuthLink({ mode, children, className }: AuthLinkProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const params = new URLSearchParams(searchParams.toString())
  params.set("auth", mode)
  const href = `${pathname}?${params.toString()}`

  return (
    <Link href={href} scroll={false} className={cn(className)}>
      {children}
    </Link>
  )
}
