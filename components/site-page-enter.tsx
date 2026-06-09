"use client"

import { motion } from "motion/react"
import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

export const PAGE_ENTER_EASE = [0.22, 1, 0.36, 1] as const

type PageEnterProps = {
  children: ReactNode
  delay?: number
  className?: string
}

/** Staggered block — same feel as topup payment cards */
export function PageEnter({ children, delay = 0, className }: PageEnterProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay,
        ease: PAGE_ENTER_EASE,
      }}
    >
      {children}
    </motion.div>
  )
}

/** Centered page title block — same as topup header */
export function PageEnterHeader({ children, className }: PageEnterProps) {
  return (
    <motion.div
      className={cn(className)}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: PAGE_ENTER_EASE }}
    >
      {children}
    </motion.div>
  )
}
