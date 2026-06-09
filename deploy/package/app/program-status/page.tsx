import type { Metadata } from "next"
import { SitePageShell } from "@/components/site-page-shell"
import { FeaturePageEnter } from "@/components/feature-page-enter"
import { FivemServersDashboard } from "@/components/program-status/fivem-servers-dashboard"
import { SITE_BRAND_NAME } from "@/lib/brand"

export const metadata: Metadata = {
  title: `สถานะโปรแกรม | ${SITE_BRAND_NAME}`,
  description:
    "FiveM Servers — รายชื่อเซิร์ฟเวอร์ FiveM ไทย ตรวจสอบผู้เล่นและระบบ Anti-Cheat แบบเรียลไทม์",
}

export default function ProgramStatusPage() {
  return (
    <SitePageShell>
      <FeaturePageEnter className="mx-auto max-w-7xl px-4 py-8">
        <FivemServersDashboard />
      </FeaturePageEnter>
    </SitePageShell>
  )
}
