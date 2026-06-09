import { Suspense } from "react"
import { SitePageShell } from "@/components/site-page-shell"
import { StoreProductsPanel } from "@/components/store/store-products-panel"

export default function AllProductsPage() {
  return (
    <SitePageShell>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <Suspense
          fallback={
            <div className="premium-glass min-h-[400px] animate-pulse" />
          }
        >
          <StoreProductsPanel />
        </Suspense>
      </div>
    </SitePageShell>
  )
}
