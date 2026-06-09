"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, Gift, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { bw } from "@/lib/bw-theme"
import { Switch } from "@/components/ui/switch"

interface SiteSettingsData {
  siteName: string
  siteDescription: string | null
  promptPayNumber: string | null
  promptPayName: string | null
  pointsPerBaht: number
  pointsValue: number
  minTopup: number
  maxTopup: number
  angpaoEnabled: boolean
  angpaoAutoApprove: boolean
  angpaoReceiverPhone: string
  angpaoApiEndpoint: string
  angpaoApiKey: string
  angpaoAllowedHosts: string
}

const emptyForm: SiteSettingsData = {
  siteName: "",
  siteDescription: "",
  promptPayNumber: "",
  promptPayName: "",
  pointsPerBaht: 1,
  pointsValue: 0.1,
  minTopup: 10,
  maxTopup: 10000,
  angpaoEnabled: true,
  angpaoAutoApprove: false,
  angpaoReceiverPhone: "",
  angpaoApiEndpoint: "",
  angpaoApiKey: "",
  angpaoAllowedHosts: "gift.truemoney.com,tmn.app",
}

function Field({
  label,
  hint,
  children,
}: {
  label: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <label className={bw.adminLabel}>{label}</label>
      {hint && <p className="text-xs text-white/45">{hint}</p>}
      {children}
    </div>
  )
}

function ToggleRow({
  label,
  description,
  checked,
  onCheckedChange,
}: {
  label: string
  description: string
  checked: boolean
  onCheckedChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-4">
      <div>
        <p className="font-medium text-white">{label}</p>
        <p className="mt-1 text-sm text-white/50">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
    </div>
  )
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SiteSettingsData>(emptyForm)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSettings = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/settings")
      if (res.ok) {
        const data = await res.json()
        setForm({
          siteName: data.siteName ?? "",
          siteDescription: data.siteDescription ?? "",
          promptPayNumber: data.promptPayNumber ?? "",
          promptPayName: data.promptPayName ?? "",
          pointsPerBaht: data.pointsPerBaht ?? 1,
          pointsValue: data.pointsValue ?? 0.1,
          minTopup: data.minTopup ?? 10,
          maxTopup: data.maxTopup ?? 10000,
          angpaoEnabled: data.angpaoEnabled ?? true,
          angpaoAutoApprove: data.angpaoAutoApprove ?? false,
          angpaoReceiverPhone: data.angpaoReceiverPhone ?? "",
          angpaoApiEndpoint: data.angpaoApiEndpoint ?? "",
          angpaoApiKey: data.angpaoApiKey ?? "",
          angpaoAllowedHosts:
            data.angpaoAllowedHosts ?? "gift.truemoney.com,tmn.app",
        })
      }
    } catch (error) {
      console.error("Failed to fetch settings:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        showToast("บันทึกการตั้งค่าสำเร็จ")
        fetchSettings()
      } else {
        const data = await res.json()
        showToast(data.error || "เกิดข้อผิดพลาด")
      }
    } catch {
      showToast("เกิดข้อผิดพลาด")
    } finally {
      setSaving(false)
    }
  }

  const setField = <K extends keyof SiteSettingsData>(
    key: K,
    value: SiteSettingsData[K]
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className={bw.adminSpinner} />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {toast && (
        <div className="fixed right-6 top-20 z-50 animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-black/90 px-4 py-3 text-sm font-medium text-white shadow-2xl backdrop-blur-xl">
            <Check className="h-4 w-4 text-emerald-400" />
            {toast}
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className={bw.adminIconBox}>
          <Settings className="h-6 w-6" />
        </div>
        <div>
          <h1 className={bw.adminPageTitle}>ตั้งค่าระบบ</h1>
          <p className={bw.adminPageSubtitle}>จัดการข้อมูลร้านค้าและการชำระเงิน</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className={cn(bw.adminCard, "space-y-4 p-6")}>
          <h2 className="text-lg font-semibold text-white">ข้อมูลเว็บไซต์</h2>
          <Field label="ชื่อเว็บไซต์">
            <input
              type="text"
              required
              value={form.siteName}
              onChange={(e) => setField("siteName", e.target.value)}
              className={bw.adminInputPlain}
            />
          </Field>
          <Field label="คำอธิบาย">
            <textarea
              rows={3}
              value={form.siteDescription ?? ""}
              onChange={(e) => setField("siteDescription", e.target.value)}
              className={cn(bw.adminInputPlain, "resize-none")}
            />
          </Field>
        </section>

        <section className={cn(bw.adminCard, "space-y-4 p-6")}>
          <h2 className="text-lg font-semibold text-white">พร้อมเพย์</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="หมายเลขพร้อมเพย์">
              <input
                type="text"
                value={form.promptPayNumber ?? ""}
                onChange={(e) => setField("promptPayNumber", e.target.value)}
                className={bw.adminInputPlain}
                placeholder="0XX-XXX-XXXX"
              />
            </Field>
            <Field label="ชื่อบัญชี">
              <input
                type="text"
                value={form.promptPayName ?? ""}
                onChange={(e) => setField("promptPayName", e.target.value)}
                className={bw.adminInputPlain}
              />
            </Field>
          </div>
        </section>

        <section className={cn(bw.adminCard, "space-y-4 p-6")}>
          <div className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-red-400" />
            <h2 className="text-lg font-semibold text-white">เติมเงินซองอังเปา</h2>
          </div>
          <p className="text-sm text-white/50">
            เปิด/ปิดช่องทางซองอังเปา และตั้งค่ารับซองอัตโนมัติเมื่อผู้ใช้ส่งลิงก์
          </p>

          <div className="space-y-3">
            <ToggleRow
              label="เปิดช่องทางซองอังเปา"
              description="ผู้ใช้จะเห็นตัวเลือกเติมเงินด้วยซองอังเปาในหน้าเติมเงิน"
              checked={form.angpaoEnabled}
              onCheckedChange={(v) => setField("angpaoEnabled", v)}
            />
            <ToggleRow
              label="รับซองอังเปาอัตโนมัติ"
              description="สมาชิกส่งลิงก์ → ระบบรับซองเข้าเบอร์ด้านล่าง → เติมเครดิตในเว็บทันที"
              checked={form.angpaoAutoApprove}
              onCheckedChange={(v) => setField("angpaoAutoApprove", v)}
            />
          </div>

          <Field
            label="เบอร์ผู้รับซองอังเปา (TrueMoney)"
            hint={
              form.angpaoAutoApprove
                ? "บังคับเมื่อเปิดรับอัตโนมัติ — เงินจากซองจะเข้าเบอร์นี้ สมาชิกได้เครดิตในเว็บ"
                : "เบอร์ TrueMoney Wallet ที่ใช้รับเงินจากซอง (เช่น 0812345678)"
            }
          >
            <input
              type="tel"
              inputMode="numeric"
              value={form.angpaoReceiverPhone}
              onChange={(e) => setField("angpaoReceiverPhone", e.target.value)}
              className={bw.adminInputPlain}
              placeholder="0812345678"
              required={form.angpaoAutoApprove}
            />
          </Field>

          <Field
            label="โดเมนลิงก์ที่อนุญาต"
            hint="คั่นด้วย comma เช่น gift.truemoney.com,tmn.app"
          >
            <input
              type="text"
              value={form.angpaoAllowedHosts}
              onChange={(e) => setField("angpaoAllowedHosts", e.target.value)}
              className={bw.adminInputPlain}
            />
          </Field>

          <Field
            label="API รับซอง (Vornyx TrueMoney)"
            hint={
              form.angpaoAutoApprove
                ? "ค่าเริ่มต้น: http://apitrue.vornyx.pro/truemoney — ส่ง { phone, voucher } ตาม docs vornyx.pro"
                : "URL บริการรับซองภายนอก (ถ้ามี)"
            }
          >
            <input
              type="url"
              value={form.angpaoApiEndpoint}
              onChange={(e) => setField("angpaoApiEndpoint", e.target.value)}
              className={bw.adminInputPlain}
              placeholder="http://apitrue.vornyx.pro/truemoney"
            />
          </Field>

          <Field
            label="API Key (ไม่จำเป็นสำหรับ Vornyx)"
            hint="Vornyx ไม่ต้องใช้ Key — เว้นว่างได้"
          >
            <input
              type="password"
              value={form.angpaoApiKey}
              onChange={(e) => setField("angpaoApiKey", e.target.value)}
              className={bw.adminInputPlain}
              placeholder="Bearer token สำหรับ API รับซอง"
              autoComplete="new-password"
            />
          </Field>
        </section>

        <section className={cn(bw.adminCard, "space-y-4 p-6")}>
          <h2 className="text-lg font-semibold text-white">เติมเงิน &amp; พอยท์</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Field label="พอยท์ต่อ 1 บาท">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pointsPerBaht}
                onChange={(e) => setField("pointsPerBaht", Number(e.target.value))}
                className={bw.adminInputPlain}
              />
            </Field>
            <Field label="มูลค่าพอยท์ (บาท)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.pointsValue}
                onChange={(e) => setField("pointsValue", Number(e.target.value))}
                className={bw.adminInputPlain}
              />
            </Field>
            <Field label="เติมเงินขั้นต่ำ (บาท)">
              <input
                type="number"
                step="1"
                min="0"
                value={form.minTopup}
                onChange={(e) => setField("minTopup", Number(e.target.value))}
                className={bw.adminInputPlain}
              />
            </Field>
            <Field label="เติมเงินสูงสุด (บาท)">
              <input
                type="number"
                step="1"
                min="0"
                value={form.maxTopup}
                onChange={(e) => setField("maxTopup", Number(e.target.value))}
                className={bw.adminInputPlain}
              />
            </Field>
          </div>
        </section>

        <div className="flex justify-end">
          <button type="submit" disabled={saving} className={bw.adminBtnPrimary}>
            {saving ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </button>
        </div>
      </form>
    </div>
  )
}
