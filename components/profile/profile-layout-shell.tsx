"use client"

import { usePathname } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import {
  SitePageShell,
  siteMainSpacerClass,
} from "@/components/site-page-shell"
import { ProfileSidebar } from "@/components/profile/profile-sidebar"
import { ProfileSessionSync } from "@/components/profile/profile-session-sync"
import { Breadcrumb } from "@/components/breadcrumb"
import { PAGE_ENTER_EASE } from "@/components/site-page-enter"

const profileEnter = {
  duration: 0.48,
  ease: PAGE_ENTER_EASE,
} as const

const profileContentEnter = {
  duration: 0.38,
  ease: PAGE_ENTER_EASE,
} as const

export function ProfileLayoutShell({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname() ?? "/profile"

  return (
    <>
      <ProfileSessionSync />
      <SitePageShell
        footerSpacer={false}
        mainClassName="!flex !min-h-0 flex-1 flex-col"
      >
        <motion.div
          className="mx-auto w-full max-w-7xl shrink-0 px-4 py-8"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={profileEnter}
        >
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...profileEnter, delay: 0.06 }}
          >
            <Breadcrumb
              items={[
                { label: "หน้าแรก", href: "/" },
                { label: "บัญชีของฉัน", href: "/profile" },
              ]}
            />
          </motion.div>

          <div className="mt-6 grid grid-cols-1 items-start gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
            <motion.div
              className="w-full shrink-0 lg:w-[300px]"
              initial={{ opacity: 0, x: -18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ ...profileEnter, delay: 0.1 }}
            >
              <ProfileSidebar />
            </motion.div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={pathname}
                className="min-w-0 w-full"
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={profileContentEnter}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>

        <div className={siteMainSpacerClass} aria-hidden />
      </SitePageShell>
    </>
  )
}
