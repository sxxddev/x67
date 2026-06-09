"use client"

import { motion, type Variants } from "motion/react"
import type { ReactNode } from "react"
import { PAGE_ENTER_EASE } from "@/components/site-page-enter"
import { cn } from "@/lib/utils"

export const storeMotionEase = PAGE_ENTER_EASE

export const storeFadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: storeMotionEase },
  },
}

export const storeStaggerContainer: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.08, delayChildren: 0.14 },
  },
}

export const storeStaggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: storeMotionEase },
  },
}

type StoreMotionSectionProps = {
  children: ReactNode
  className?: string
  delay?: number
}

/** เฟดอินบล็อกหัวข้อ / เนื้อหาหลังเปลี่ยนหน้าร้าน */
export function StoreMotionSection({
  children,
  className,
  delay = 0,
}: StoreMotionSectionProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay, ease: storeMotionEase }}
    >
      {children}
    </motion.div>
  )
}

type StoreStaggerGridProps = {
  children: ReactNode
  className?: string
}

/** กริดการ์ด — ไล่เข้าทีละใบ */
export function StoreStaggerGrid({ children, className }: StoreStaggerGridProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="show"
      variants={storeStaggerContainer}
    >
      {children}
    </motion.div>
  )
}

type StoreStaggerItemProps = {
  children: ReactNode
  className?: string
}

export function StoreStaggerItem({ children, className }: StoreStaggerItemProps) {
  return (
    <motion.div className={cn("h-full", className)} variants={storeStaggerItem}>
      {children}
    </motion.div>
  )
}
