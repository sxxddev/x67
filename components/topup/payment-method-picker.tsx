"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import {
  ArrowRight,
  Gift,
  QrCode,
  Wallet,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

type TopupConfig = {
  angpaoEnabled: boolean
  angpaoAutoApprove: boolean
}

function MethodCard({
  method,
  index,
  disabled,
}: {
  method: {
    id: string
    href: string
    title: string
    badge: string
    description: string
    hint: string
    hintIcon: typeof Gift
    status: string
    statusIcon: typeof Gift
    icon: React.ReactNode
  }
  index: number
  disabled?: boolean
}) {
  const HintIcon = method.hintIcon
  const StatusIcon = method.statusIcon

  const inner = (
    <div
      className={cn(
        "group block rounded-2xl border border-white/[0.125] bg-black p-5 transition duration-300",
        disabled
          ? "cursor-not-allowed opacity-50"
          : "cursor-pointer hover:border-white/25 hover:bg-white/[0.03]"
      )}
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/[0.125] bg-white/[0.04] p-1">
            {method.icon}
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-medium text-white">{method.title}</h3>
              <span className="rounded-full border border-white/15 bg-white/[0.08] px-2 py-0.5 text-[10px] font-normal tracking-wide text-white/70 uppercase">
                {method.badge}
              </span>
            </div>
            <p className="text-sm font-normal text-white/80">{method.description}</p>
            <p className="mt-1 flex items-center gap-1 text-xs font-normal text-white/50">
              <HintIcon className="h-3 w-3 shrink-0" />
              {method.hint}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 lg:items-end lg:text-right">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] text-white/80">
              <StatusIcon className="h-4 w-4" />
            </div>
            <div>
              <div className="text-sm font-medium text-white">{method.status}</div>
              <div className="text-xs font-normal text-white/50">
                {disabled ? "ปิดใช้งานชั่วคราว" : "คลิกเพื่อเริ่มเติมเงิน"}
              </div>
            </div>
          </div>
          {!disabled && (
            <span className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/20 bg-white px-4 py-2 text-sm font-normal text-black transition-all duration-200 group-hover:bg-white/90">
              เลือก
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </div>
      </div>
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      {disabled ? inner : <Link href={method.href}>{inner}</Link>}
    </motion.div>
  )
}

export function PaymentMethodPicker() {
  const [config, setConfig] = useState<TopupConfig>({
    angpaoEnabled: true,
    angpaoAutoApprove: false,
  })

  useEffect(() => {
    fetch("/api/topup/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setConfig({
            angpaoEnabled: data.angpaoEnabled ?? true,
            angpaoAutoApprove: data.angpaoAutoApprove ?? false,
          })
        }
      })
      .catch(() => {})
  }, [])

  const methods = [
    {
      id: "promptpay",
      href: "/topup/promptpay",
      title: "พร้อมเพย์",
      badge: "อัปโหลดสลิป",
      description: "PromptPay QR Code • สแกน QR Code เพื่อชำระเงินทันที",
      hint: "รองรับทุกธนาคารและ Mobile Banking",
      hintIcon: Zap,
      status: "พร้อมใช้งาน",
      statusIcon: QrCode,
      icon: (
        <div className="flex h-full w-full items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <svg className="h-8 w-8 text-white" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
          </svg>
        </div>
      ),
      disabled: false,
    },
    {
      id: "angpao",
      href: "/topup/angpao",
      title: "ซองอังเปา",
      badge: config.angpaoAutoApprove ? "รับซองอัตโนมัติ" : "รอแอดมินตรวจ",
      description: "True Money Wallet • ใช้ลิงค์ซองอังเปาเพื่อเติมเงิน",
      hint: "เหมาะสำหรับผู้ใช้ TrueMoney Wallet",
      hintIcon: Gift,
      status: config.angpaoEnabled ? "พร้อมใช้งาน" : "ปิดใช้งาน",
      statusIcon: Gift,
      icon: (
        <div className="relative h-full w-full overflow-hidden rounded-lg bg-red-500">
          <div className="absolute top-2 left-1/2 h-6 w-6 -translate-x-1/2 rounded-full border-2 border-yellow-300 bg-yellow-400" />
          <div className="absolute right-2 bottom-2 left-2 h-3 rounded-sm bg-red-400" />
        </div>
      ),
      disabled: !config.angpaoEnabled,
    },
  ]

  return (
    <main className="container mx-auto max-w-3xl px-4 py-10 md:py-14">
      <motion.div
        className="mb-10 text-center"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.06]">
          <Wallet className="h-6 w-6 text-white/90" strokeWidth={1.5} />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-white md:text-3xl">
          ช่องทางการชำระเงิน
        </h1>
        <p className="mx-auto mt-2 max-w-md text-sm font-normal text-white/50">
          เลือกช่องทางที่ต้องการเพื่อเติมเงินเข้าบัญชีของคุณ
        </p>
      </motion.div>

      <div className="space-y-4">
        {methods.map((method, index) => (
          <MethodCard
            key={method.id}
            method={method}
            index={index}
            disabled={method.disabled}
          />
        ))}
      </div>
    </main>
  )
}
