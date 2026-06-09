"use client"

import { useState } from "react"
import { TopupPageShell } from "@/components/topup/topup-page-shell"
import { AngpaoTopupForm } from "@/components/topup/angpao-topup-form"
import { TopupHistoryPanel } from "@/components/topup/topup-history-panel"

export default function TopupAngpaoPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  const handleSuccess = () => {
    setToast({ message: "ส่งคำขอเติมเงินสำเร็จ รอการอนุมัติ", type: "success" })
    setRefreshKey((k) => k + 1)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <TopupPageShell backHref="/topup" backLabel="เลือกช่องทางอื่น" toast={toast}>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        <AngpaoTopupForm onSuccess={handleSuccess} />
        <TopupHistoryPanel refreshKey={refreshKey} />
      </div>
    </TopupPageShell>
  )
}
