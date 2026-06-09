"use client"

import { useState } from "react"
import { Lock, Eye, EyeOff, Save } from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"

function PasswordField({
  placeholder,
  value,
  onChange,
  autoComplete,
  show,
  onToggle,
}: {
  placeholder: string
  value: string
  onChange: (v: string) => void
  autoComplete?: string
  show: boolean
  onToggle: () => void
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-white/45">
        <Lock className="h-[15px] w-[15px]" strokeWidth={2} />
      </span>
      <input
        type={show ? "text" : "password"}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        className={cn(bw.adminInput, "h-11 pr-10")}
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/35 transition hover:text-white/70"
        aria-label={show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  )
}

export default function ChangePasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (newPassword.length < 6) {
      setError("รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร")
      return
    }
    if (newPassword !== confirmPassword) {
      setError("รหัสผ่านใหม่ไม่ตรงกัน")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/profile/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.message || "เปลี่ยนรหัสผ่านไม่สำเร็จ")
        return
      }
      setSuccess(data.message || "บันทึกรหัสผ่านใหม่สำเร็จ")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className={cn(bw.panel, "p-6")}>
        <div className="mb-4 flex items-center gap-2">
          <Lock className="h-[18px] w-[18px] text-white/70" strokeWidth={2} />
          <h1 className="text-base font-bold text-white">เปลี่ยนรหัสผ่าน</h1>
        </div>

        {success && (
          <p className="mb-4 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-400">
            {success}
          </p>
        )}
        {error && (
          <p className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5" autoComplete="off">
          <PasswordField
            placeholder="รหัสผ่านปัจจุบัน"
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            show={showCurrent}
            onToggle={() => setShowCurrent(!showCurrent)}
          />
          <PasswordField
            placeholder="รหัสผ่านใหม่ (6+ ตัวอักษร)"
            value={newPassword}
            onChange={setNewPassword}
            autoComplete="new-password"
            show={showNew}
            onToggle={() => setShowNew(!showNew)}
          />
          <PasswordField
            placeholder="ยืนยันรหัสผ่านใหม่"
            value={confirmPassword}
            onChange={setConfirmPassword}
            autoComplete="new-password"
            show={showConfirm}
            onToggle={() => setShowConfirm(!showConfirm)}
          />

          <button
            type="submit"
            disabled={loading}
            className={cn(bw.adminBtnPrimary, "mt-2 h-11 w-full")}
          >
            <Save className="h-4 w-4" />
            {loading ? "กำลังบันทึก..." : "บันทึกรหัสผ่านใหม่"}
          </button>
        </form>
      </div>
    </div>
  )
}
