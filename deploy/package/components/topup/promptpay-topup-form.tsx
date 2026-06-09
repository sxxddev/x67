"use client"

import { useState, useEffect, useMemo } from "react"
import { motion } from "motion/react"
import {
  Upload,
  Clock,
  QrCode,
  Copy,
  Check,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useTopupPending } from "@/components/topup/topup-history-panel"
import {
  TOPUP_AMOUNT_PLACEHOLDER,
  TOPUP_MAX_AMOUNT,
  TOPUP_MIN_AMOUNT,
  isValidTopupAmount,
  topupAmountError,
} from "@/lib/topup-limits"

const PRESET_AMOUNTS = [50, 100, 200, 300, 500, 1000]
const PROMPTPAY_NUMBER = "0812345678"

export function PromptpayTopupForm({
  onSuccess,
}: {
  onSuccess?: () => void
}) {
  const { hasPending, loading: pendingLoading } = useTopupPending()
  const [amount, setAmount] = useState(100)
  const [customAmount, setCustomAmount] = useState("")
  const [slipImage, setSlipImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)
  const [error, setError] = useState("")

  const finalAmount = useMemo(
    () => (customAmount ? parseInt(customAmount, 10) : amount) || 0,
    [customAmount, amount]
  )

  const qrImageUrl = useMemo(
    () => `https://promptpay.io/${PROMPTPAY_NUMBER}/${finalAmount}.png`,
    [finalAmount]
  )

  useEffect(() => {
    setShowQr(false)
  }, [finalAmount])

  const handleCopyPromptPay = () => {
    navigator.clipboard.writeText(PROMPTPAY_NUMBER)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError("ไฟล์ต้องมีขนาดไม่เกิน 5MB")
      return
    }
    setError("")
    setUploading(true)
    const reader = new FileReader()
    reader.onloadend = () => {
      setSlipImage(reader.result as string)
      setUploading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    setError("")
    if (!isValidTopupAmount(finalAmount)) {
      setError(topupAmountError())
      return
    }
    if (!slipImage) {
      setError("กรุณาอัปโหลดสลิปการโอนเงิน")
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch("/api/topup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          slipImage,
          method: "PROMPTPAY",
        }),
      })

      if (res.ok) {
        setSlipImage(null)
        setCustomAmount("")
        setAmount(100)
        setShowQr(false)
        onSuccess?.()
      } else {
        const err = await res.json()
        setError(err.error || "เกิดข้อผิดพลาด")
      }
    } catch {
      setError("เกิดข้อผิดพลาด")
    } finally {
      setSubmitting(false)
    }
  }

  if (pendingLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white" />
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
        <h1 className="text-2xl font-medium text-white">พร้อมเพย์</h1>
        <p className="mt-1 text-sm font-normal text-white/60">
          โอนเงินผ่าน PromptPay แล้วอัปโหลดสลิป
        </p>
      </div>

      {error && (
        <p className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-center text-xs font-normal text-white/80">
          {error}
        </p>
      )}

      <div className="space-y-3">
        <label className="text-sm font-normal text-white/80">เลือกจำนวนเงิน</label>
        <div className="grid grid-cols-3 gap-3">
          {PRESET_AMOUNTS.map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => {
                setAmount(a)
                setCustomAmount("")
              }}
              className={cn(
                "rounded-xl py-3 text-sm font-normal transition-all",
                amount === a && !customAmount
                  ? "border border-white/30 bg-white text-black"
                  : "border border-white/10 bg-black/40 text-white hover:border-white/20"
              )}
            >
              ฿{a}
            </button>
          ))}
        </div>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 font-normal text-white/50">
            ฿
          </span>
          <input
            type="number"
            min={TOPUP_MIN_AMOUNT}
            max={TOPUP_MAX_AMOUNT}
            value={customAmount}
            onChange={(e) => {
              setCustomAmount(e.target.value)
              setAmount(0)
            }}
            placeholder={TOPUP_AMOUNT_PLACEHOLDER}
            className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pr-4 pl-8 text-sm font-normal text-white outline-none placeholder:text-white/40 focus:border-white/25"
          />
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-white/10 bg-black/40 p-6 backdrop-blur-xl">
        <div className="flex items-center gap-2 text-white">
          <QrCode className="h-5 w-5" />
          <span className="font-medium">PromptPay QR Code</span>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
          <div>
            <p className="text-xs font-normal text-white/50">เลขพร้อมเพย์</p>
            <p className="font-mono font-medium text-white">{PROMPTPAY_NUMBER}</p>
          </div>
          <button
            type="button"
            onClick={handleCopyPromptPay}
            className="flex items-center gap-1 rounded-lg border border-white/15 bg-white/10 px-3 py-1.5 text-sm font-normal text-white transition-colors hover:bg-white/15"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? "คัดลอกแล้ว" : "คัดลอก"}
          </button>
        </div>

        <p className="text-center text-xs font-normal text-white/50">
          จำนวนเงิน:{" "}
          <span className="font-medium text-white">฿{finalAmount.toLocaleString()}</span>
        </p>

        {!showQr ? (
          <button
            type="button"
            onClick={() => setShowQr(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 py-3 text-sm font-normal text-white transition hover:bg-white/15"
          >
            <QrCode className="h-4 w-4" />
            แสดง QR Code
          </button>
        ) : (
          <div className="mx-auto flex max-w-[200px] flex-col items-center gap-3">
            <div className="aspect-square w-full rounded-xl border border-white/15 bg-white p-3">
              <img
                src={qrImageUrl}
                alt="PromptPay QR"
                loading="lazy"
                className="h-full w-full object-contain"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowQr(false)}
              className="text-xs font-normal text-white/50 transition hover:text-white/80"
            >
              ซ่อน QR Code
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        <label className="text-sm font-normal text-white/80">อัปโหลดสลิปการโอนเงิน</label>
        {slipImage ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/10">
            <img
              src={slipImage}
              alt="Slip"
              className="max-h-[300px] w-full bg-black/50 object-contain"
            />
            <button
              type="button"
              onClick={() => setSlipImage(null)}
              className="absolute top-2 right-2 rounded-full bg-black/80 p-2 text-white transition-colors hover:bg-black"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-black/30 p-8 transition-colors hover:border-white/25 hover:bg-black/40">
            <Upload
              className={cn("mb-3 h-10 w-10 text-white/40", uploading && "animate-pulse")}
            />
            <p className="text-sm font-normal text-white">
              {uploading ? "กำลังอัปโหลด..." : "คลิกเพื่ออัปโหลดสลิป"}
            </p>
            <p className="mt-1 text-xs font-normal text-white/50">PNG, JPG (สูงสุด 5MB)</p>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        )}
      </div>

      <button
        type="button"
        onClick={handleSubmit}
        disabled={submitting || !slipImage}
        className="w-full rounded-xl border border-white/20 bg-white py-4 text-sm font-normal text-black transition-all hover:bg-white/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {submitting ? "กำลังดำเนินการ..." : "ส่งคำขอเติมเงิน"}
      </button>
    </motion.div>
  )
}
