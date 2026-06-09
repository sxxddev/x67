"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"
import { PAGE_ENTER_EASE } from "@/components/site-page-enter"

/** เข้าหน้าฟีเจอร์จากเมนู ฟังก์ชันเพิ่มเติม — fade + เลื่อนขึ้น */
export function FeaturePageEnter({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: PAGE_ENTER_EASE }}
    >
      {children}
    </motion.div>
  )
}
