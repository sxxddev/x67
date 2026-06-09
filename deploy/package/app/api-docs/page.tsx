import type { Metadata } from "next"
import { SitePageShell } from "@/components/site-page-shell"
import { FeaturePageEnter } from "@/components/feature-page-enter"
import { NativeHookApiDoc } from "@/components/api-docs/native-hook-api-doc"
import { SITE_BRAND_NAME } from "@/lib/brand"

export const metadata: Metadata = {
  title: `Native Hook API | ${SITE_BRAND_NAME}`,
  description:
    "x67SECRETME Native Hook API — ดักจับ แก้ไข และควบคุม Native Calls แบบ Real-time",
}

export default function ApiDocsPage() {
  return (
    <SitePageShell>
      <FeaturePageEnter className="mx-auto max-w-7xl px-4 py-8">
        <NativeHookApiDoc />
      </FeaturePageEnter>
    </SitePageShell>
  )
}
