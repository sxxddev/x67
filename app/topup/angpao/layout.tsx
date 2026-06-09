"use client"

import { TopupAuthGuard } from "@/components/topup/topup-auth-guard"

export default function TopupAngpaoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <TopupAuthGuard>{children}</TopupAuthGuard>
}
