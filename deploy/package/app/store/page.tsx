import { Suspense } from "react"
import { SitePageShell } from "@/components/site-page-shell"
import { CategoryGrid } from "@/components/store/category-grid"
import { categoryGridLayoutClass, categoryBannerSizeClass, categoryStoreShellClass } from "@/lib/category-grid-layout"
import { PageEnter, PageEnterHeader } from "@/components/site-page-enter"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"

export default function StorePage() {
  return (
    <SitePageShell>
      <div className={cn(categoryStoreShellClass(), "py-8 md:py-10")}>
        <PageEnterHeader className="mb-8 text-center md:mb-10">
          <h1 className={bw.pageTitle}>เลือกหมวดหมู่สินค้า</h1>
          <p className={cn("mx-auto mt-2 max-w-lg", bw.pageSubtitle)}>
            ค้นหาหรือเลือกหมวดหมู่ที่ต้องการด้านล่าง
          </p>
        </PageEnterHeader>

        <PageEnter delay={0.06}>
          <Suspense
            fallback={
              <div className="space-y-4">
                <div className={cn(bw.panel, "h-12 animate-pulse")} />
                <div className={cn(bw.panel, "h-20 animate-pulse")} />
                <div className={categoryGridLayoutClass()}>
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        bw.storeCard,
                        categoryBannerSizeClass,
                        "overflow-hidden"
                      )}
                    >
                      <div className="h-full w-full animate-pulse bg-white/5" />
                    </div>
                  ))}
                </div>
              </div>
            }
          >
            <CategoryGrid />
          </Suspense>
        </PageEnter>
      </div>
    </SitePageShell>
  )
}
