"use client"

import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { Clock, Gift, Link2 } from "lucide-react"
import { useTopupPending } from "@/components/topup/topup-history-panel"
import {
  TOPUP_MAX_AMOUNT,
  TOPUP_MIN_AMOUNT,
  getAngpaoMinTopup,
  isValidTopupAmount,
  topupAmountError,
} from "@/lib/topup-limits"

type TopupConfig = {
  angpaoMinTopup: number
  maxTopup: number
  angpaoEnabled: boolean
  angpaoAutoApprove: boolean
}

export function AngpaoTopupForm({ onSuccess }: { onSuccess?: () => void }) {
  const { hasPending, loading: pendingLoading } = useTopupPending()
  const [config, setConfig] = useState<TopupConfig | null>(null)
  const [angpaoLink, setAngpaoLink] = useState("")
  const [amount, setAmount] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  useEffect(() => {
    fetch("/api/topup/config")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setConfig({
            angpaoMinTopup:
              data.angpaoMinTopup ?? getAngpaoMinTopup(data.minTopup),
            maxTopup: data.maxTopup ?? TOPUP_MAX_AMOUNT,
            angpaoEnabled: data.angpaoEnabled ?? true,
            angpaoAutoApprove: data.angpaoAutoApprove ?? false,
          })
        }
      })
      .catch(() => {})
  }, [])

  const minTopup = config?.angpaoMinTopup ?? TOPUP_MIN_AMOUNT
  const maxTopup = config?.maxTopup ?? TOPUP_MAX_AMOUNT
  const autoApprove = config?.angpaoAutoApprove ?? false

  const handleSubmit = async () => {
    setError("")
    setSuccessMsg("")
    if (!angpaoLink.trim()) {
      setError("กรุณาวางลิงก์ซองอังเปา")
      return
    }

    const parsedAmount = autoApprove ? 0 : parseFloat(amount)
    if (!autoApprove) {
      if (!amount.trim()) {
        setError("กรุณาระบุจำนวนเงินในซอง")
        return
      }
      if (!isValidTopupAmount(parsedAmount, minTopup, maxTopup)) {
        setError(topupAmountError(minTopup, maxTopup))
        return
      }
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parsedAmount,
          method: "ANGPAO",
          angpaoLink: angpaoLink.trim(),
        }),
      })

      const data = await res.json().catch(() => ({}))

      if (res.ok) {
        setAngpaoLink("")
        setAmount("")
        setSuccessMsg(
          data.message ||
            (data.autoApproved
              ? "เติมเงินสำเร็จ"
              : "ส่งคำขอแล้ว รอแอดมินตรวจสอบ")
        )
        onSuccess?.()
      } else {
        setError(data.error || "เกิดข้อผิดพลาด")
      }
    } catch {
      setError("เกิดข้อผิดพลาด")
    } finally {
      setSubmitting(false)
    }
  }

  if (pendingLoading || config === null) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
      </div>
    )
  }

  if (!config.angpaoEnabled) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
        <p className="text-center text-sm text-white/70">
          ช่องทางซองอังเปาปิดใช้งานชั่วคราว กรุณาเลือกช่องทางอื่น
        </p>
      </div>
    )
  }

  if (hasPending) {
    return (
      <div className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-white/80" />
          <div>
            <h3 className="font-medium text-white">มีคำขอรอดำเนินการ</h3>
            <p className="text-sm font-normal text-white/60">
              กรุณารอการอนุมัติก่อนทำรายการใหม่
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <h1 className="text-2xl font-medium text-white">ซองอังเปา</h1>
        <p className="mt-1 text-sm font-normal text-white/60">
          วางลิงก์ซองอังเปา TrueMoney Wallet เพื่อเติมเงิน
        </p>
      </div>

      {successMsg && (
        <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-center text-xs font-normal text-emerald-200">
          {successMsg}
        </p>
      )}

      {error && (
        <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-normal text-white/80">
          {error}
        </p>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
        <div className="mb-4 flex items-center gap-2 text-white">
          <Gift className="h-5 w-5" />
          <span className="font-medium">ลิงก์ซองอังเปา</span>
        </div>
        <label className="mb-4 block text-sm font-normal text-white/80">
          ลิงก์ซองอังเปา (TrueMoney)
        </label>
        <div className="relative">
          <Link2 className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/35" />
          <input
            type="url"
            value={angpaoLink}
            onChange={(e) => setAngpaoLink(e.target.value)}
            placeholder="https://gift.truemoney.com/..."
            className="h-11 w-full rounded-[10px] border border-white/10 bg-black/40 py-0 pr-4 pl-10 text-sm font-normal text-white outline-none placeholder:text-white/40 focus:border-white/25"
          />
        </div>
        <p className="mt-2 text-xs font-normal text-white/45">
          คัดลอกลิงก์จากแอป TrueMoney แล้ววางที่นี่
          {autoApprove ? " — ระบบดึงยอดจากซองอัตโนมัติ" : ""}
        </p>
      </div>

      {!autoApprove ? (
        <div className="space-y-2">
          <label className="text-sm font-normal text-white/80">จำนวนเงินในซอง (บาท)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 font-normal text-white/50">
              ฿
            </span>
            <input
              type="number"
              min={minTopup}
              max={maxTopup}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`ระบุจำนวนเงิน (${minTopup}-${maxTopup.toLocaleString()}) ${minTopup} บาทขึ้นไป`}
              className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pr-4 pl-8 text-sm font-normal text-white outline-none placeholder:text-white/40 focus:border-white/25"
            />
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !angpaoLink.trim() || (!autoApprove && !amount)}
        className="w-full rounded-xl border border-white/20 bg-white py-4 text-sm font-normal text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting
          ? "กำลังดำเนินการ..."
          : autoApprove
            ? "เติมเงินทันที"
            : "ส่งคำขอเติมเงิน"}
      </button>
    </motion.div>
  )
}
