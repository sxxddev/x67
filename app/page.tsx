import { SitePageShell } from "@/components/site-page-shell"
import { HomeHeroLanding } from "@/components/home/home-hero-landing"
import { RecommendedProducts } from "@/components/home/recommended-products"

export default function HomePage() {
  return (
    <SitePageShell footerSpacer={false}>
      <HomeHeroLanding />
      <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-4">
        <RecommendedProducts />
      </div>
    </SitePageShell>
  )
}
