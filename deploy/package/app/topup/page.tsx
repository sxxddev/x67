"use client"

import { SitePageShell } from "@/components/site-page-shell"
import { PaymentMethodPicker } from "@/components/topup/payment-method-picker"

export default function TopupPage() {
  return (
    <SitePageShell>
      <PaymentMethodPicker />
    </SitePageShell>
  )
}
