"use client"

import { Suspense } from "react"
import { AuthModal } from "@/components/auth-modal"

export function AuthModalHost() {
  return (
    <Suspense fallback={null}>
      <AuthModal />
    </Suspense>
  )
}
