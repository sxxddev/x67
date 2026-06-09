"use client"

import { Suspense } from "react"
import { AuthLink } from "@/components/auth-link"

type Props = {
  mode: "login" | "register"
  children: React.ReactNode
  className?: string
}

function AuthLinkInner({ mode, children, className }: Props) {
  return (
    <AuthLink mode={mode} className={className}>
      {children}
    </AuthLink>
  )
}

export function AuthLinkButton(props: Props) {
  return (
    <Suspense fallback={props.children}>
      <AuthLinkInner {...props} />
    </Suspense>
  )
}
