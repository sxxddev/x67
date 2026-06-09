"use client"

import { TransitionLink } from "@/components/transition-link"
import { usePageTransition } from "@/components/page-transition"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { motion } from "motion/react"
import { Search, ArrowRight, Info } from "lucide-react"
import { StatsCards } from "@/components/stats-cards"
import { RecentPurchasesMarquee } from "@/components/home/recent-purchases-marquee"
import { BestSellerSection } from "@/components/home/best-seller-section"
import { HomeAllProductsSection } from "@/components/home/home-all-products-section"
import { PageEnter, PageEnterHeader } from "@/components/site-page-enter"
import { SITE_HOME_HEADLINE } from "@/lib/brand"
import { cn } from "@/lib/utils"

export function HomeHeroLanding() {
  const router = useRouter()
  const pageNav = usePageTransition()
  const [search, setSearch] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const q = search.trim()
    const href = q ? `/store?search=${encodeURIComponent(q)}` : "/store"
    const go = pageNav?.navigate
    if (go) go(href)
    else router.push(href)
  }

  return (
    <section className="flex min-h-[calc(100dvh-4.5rem)] flex-col px-4 pb-8 pt-6 sm:min-h-[calc(100dvh-4rem)] sm:pt-10">
      <PageEnterHeader className="mx-auto max-w-4xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          ติดต่อได้ที่ {SITE_HOME_HEADLINE}
        </h1>
        <p className="mt-2 text-sm text-white/60 sm:text-base">
          ติดต่อได้ที่ : x67SECRETME.COM
        </p>
      </PageEnterHeader>

      <PageEnter delay={0.06} className="mx-auto max-w-4xl text-center">
        <form
          onSubmit={handleSearch}
          className="hero2-search relative z-10 mx-auto mb-4 mt-8 block h-12 w-[520px] max-w-full"
        >
          <Search
            className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-white/40"
            strokeWidth={2}
            aria-hidden
          />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ค้นหาสินค้า หมวดหมู่..."
            className={cn(
              "hero-search-input box-border h-12 w-[520px] max-w-full cursor-text rounded-[10px]",
              "border border-white/[0.06] bg-white/[0.024] pl-11 pr-4",
              "text-left text-sm text-white/90 placeholder:text-white/50",
              "backdrop-blur-[8px] transition-[background,border-color] duration-[180ms]",
              "hover:border-white/10 hover:bg-white/[0.04]",
              "focus:border-white/[0.12] focus:bg-white/[0.04] focus:outline-none focus:ring-0"
            )}
          />
        </form>

        <motion.div
          className="mt-5 inline-block"
          whileHover={{ y: -6 }}
          whileTap={{ y: 0, scale: 0.97 }}
          transition={{
            type: "spring",
            stiffness: 520,
            damping: 16,
            mass: 0.65,
          }}
        >
          <TransitionLink
            href="/store"
            className="group inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white px-8 text-base font-normal text-black shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] transition-[box-shadow,filter] duration-200 hover:bg-white/95 hover:shadow-[0_12px_28px_-8px_rgba(255,255,255,0.35)]"
          >
            <span>เริ่มต้นเลย!</span>
            <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out group-hover:translate-x-1" />
          </TransitionLink>
        </motion.div>
      </PageEnter>

      <PageEnter delay={0.12}>
        <StatsCards className="mx-auto mt-10 max-w-5xl" />
        <RecentPurchasesMarquee />
        <BestSellerSection />
        <HomeAllProductsSection />
      </PageEnter>

      <PageEnter delay={0.18} className="mx-auto mt-8 max-w-5xl rounded-xl border border-white/10 bg-black/45 p-5 backdrop-blur-md">
        <div className="mb-3 flex items-center gap-2 text-white">
          <Info className="h-5 w-5" />
          <h2 className="font-semibold">ประกาศ</h2>
        </div>
        <div className="space-y-2 text-left text-sm leading-relaxed text-white/75">
          <p>ยินดีต้อนรับสู่ เว็บไซต์ หากพบปัญหาการใช้งาน หรือมีข้อสงสัยเพิ่มเติม สามารถติดต่อทีมงานผ่าน Discord ได้ตลอดเวลา กรุณาอ่านก่อนสั่งซื้อ • ซื้อสินค้าแล้ว จะไม่มีการคืนเงิน ทุกกรณี • โปรแกรมเสริมหรือโปรแกรมช่วยเล่น อาจมีความเสี่ยงในการใช้งาน • กรุณาศึกษารายละเอียดสินค้าให้ครบถ้วนก่อนตัดสินใจสั่งซื้อ</p>
        </div>
      </PageEnter>

      {/* พื้นที่ว่างก่อนฟุตเตอร์ — ต้องเลื่อนลงถึงจะเห็นส่วนล่าง */}
      <div className="min-h-[22vh] flex-1 sm:min-h-[28vh]" aria-hidden />
    </section>
  )
}
