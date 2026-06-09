"use client"

import { usePathname } from "next/navigation"
import { useCallback, useEffect, useState } from "react"
import { X } from "lucide-react"
import {
  isAnnouncementSnoozed,
  snoozeAnnouncementForOneHour,
} from "@/lib/announcement-storage"

/** รูปต้นฉบับ: 666216964_..._n.png → public/announcement-discord.png */
const ANNOUNCEMENT_IMAGE = "/announcement-discord.png?v=official"
const DISCORD_TICKET_URL =
  process.env.NEXT_PUBLIC_DISCORD_TICKET_URL ?? "https://discord.com"

export function SiteAnnouncementModal() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [snooze, setSnooze] = useState(false)

  const isAdminRoute = pathname?.startsWith("/admin")

  useEffect(() => {
    if (isAdminRoute) return

    const timer = window.setTimeout(() => {
      if (!isAnnouncementSnoozed()) {
        setOpen(true)
      }
    }, 900)

    return () => window.clearTimeout(timer)
  }, [isAdminRoute, pathname])

  const closeAll = useCallback(() => {
    if (snooze) {
      snoozeAnnouncementForOneHour()
    }
    setOpen(false)
  }, [snooze])

  useEffect(() => {
    if (!open) return

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeAll()
    }
    window.addEventListener("keydown", onKey)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener("keydown", onKey)
    }
  }, [open, closeAll])

  if (!open || isAdminRoute) return null

  return (
    <div
      className="fixed inset-0 z-[100000]"
      role="presentation"
      aria-hidden={false}
    >
      {/* ชั้นบัง — คลิกพื้นหลังไม่ปิด ต้องกด X หรือปิดทั้งหมดเท่านั้น */}
      <div
        className="absolute inset-0 bg-black/65 backdrop-blur-sm"
        aria-hidden
      />

      <div
        className="absolute inset-0 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="announcement-title"
      >
        <div className="relative w-full max-w-[min(92vw,440px)]">
          <button
            type="button"
            onClick={closeAll}
            className="absolute -right-2 -top-2 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition hover:bg-white/90"
            aria-label="ปิด"
          >
            <X className="h-5 w-5" />
          </button>

          <a
            id="announcement-title"
            href={DISCORD_TICKET_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block overflow-hidden rounded-2xl shadow-2xl"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={ANNOUNCEMENT_IMAGE}
              alt="ติดต่อแอดมินสอบถาม / แจ้งปัญหาต่างๆ - เปิด Ticket บน Discord"
              className="block h-auto w-full"
              draggable={false}
            />
          </a>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 flex max-w-[calc(100%-40px)] -translate-x-1/2 flex-wrap items-center gap-3 rounded-xl border border-white/15 bg-black/80 px-4 py-2.5 text-[13px] text-white backdrop-blur-md">
        <label className="inline-flex cursor-pointer items-center gap-1.5 select-none">
          <input
            type="checkbox"
            checked={snooze}
            onChange={(e) => setSnooze(e.target.checked)}
            className="accent-white"
          />
          <span>ไม่แสดงอีก 1 ชั่วโมง</span>
        </label>
        <button
          type="button"
          onClick={closeAll}
          className="cursor-pointer rounded-lg border-0 bg-white px-3.5 py-1.5 text-[13px] font-medium text-black transition hover:bg-white/90"
        >
          ปิดทั้งหมด
        </button>
      </div>
    </div>
  )
}
