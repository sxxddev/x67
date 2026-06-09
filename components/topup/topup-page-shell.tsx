"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import {
  SitePageShell,
} from "@/components/site-page-shell"
import { TopupToast } from "@/components/topup/topup-toast"

export function TopupPageShell({
  backHref = "/topup",
  backLabel = "ย้อนกลับ",
  children,
  toast,
}: {
  backHref?: string
  backLabel?: string
  children: React.ReactNode
  toast?: { message: string; type: "success" | "error" } | null
}) {
  return (
    <SitePageShell>
      {toast && <TopupToast message={toast.message} type={toast.type} />}
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <Link
          href={backHref}
          className="mb-6 inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-normal">{backLabel}</span>
        </Link>
        {children}
      </div>
    </SitePageShell>
  )
}
