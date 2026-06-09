"use client"

import { useState } from "react"
import { Product, useStore } from "@/lib/store"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react"

interface PurchaseModalProps {
  product: Product | null
  quantity: number
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PurchaseModal({
  product,
  quantity,
  isOpen,
  onClose,
  onConfirm,
}: PurchaseModalProps) {
  const { user } = useStore()
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [termsExpanded, setTermsExpanded] = useState(false)

  if (!product || !user) return null

  const totalPrice = product.price * quantity
  const remainingBalance = user.balance - totalPrice
  const canAfford = remainingBalance >= 0

  const handleConfirm = () => {
    if (termsAccepted && canAfford) {
      onConfirm()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white border-border shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-xl text-foreground">ยืนยันการสั่งซื้อ</DialogTitle>
          <p className="text-sm text-muted-foreground">โปรดอ่านและยอมรับเงื่อนไขก่อนทำรายการ</p>
        </DialogHeader>

        <div className="space-y-4">
          {/* Order Details */}
          <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">ชื่อสินค้า</span>
              <span className="font-medium text-foreground text-right max-w-[200px] truncate">
                {product.name}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ราคา/ชิ้น</span>
              <span className="text-foreground">{product.price.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">ยอดเงินคงเหลือ</span>
              <span className="text-foreground">{user.balance.toLocaleString()} บาท</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">จำนวน</span>
              <span className="text-foreground">{quantity} ชิ้น</span>
            </div>
            
            <div className="border-t border-border pt-3 mt-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">รวมทั้งสิ้น</span>
                <span className="text-lg font-bold text-primary">
                  {totalPrice.toLocaleString()} บาท
                </span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">คงเหลือหลังชำระ</span>
                <span className={`font-medium ${remainingBalance >= 0 ? 'text-foreground' : 'text-red-500'}`}>
                  {remainingBalance.toLocaleString()} บาท
                </span>
              </div>
            </div>
          </div>

          {/* Not enough balance warning */}
          {!canAfford && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/10 p-3 flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-500">
                ยอดเงินไม่เพียงพอ กรุณาเติมเงินก่อนทำรายการ
              </p>
            </div>
          )}

          {/* Terms & Conditions */}
          <div className="rounded-lg border border-border bg-muted/50">
            <button
              type="button"
              onClick={() => setTermsExpanded(!termsExpanded)}
              className="w-full flex items-center justify-between p-3 text-left"
            >
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span className="font-medium text-foreground">รายละเอียดเงื่อนไข</span>
              </div>
              {termsExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>
            {termsExpanded && (
              <div className="px-3 pb-3 text-sm text-muted-foreground">
                ห้ามนำบัญชีไปหารและห้ามเปลี่ยนรหัสบัญชี พบเจอแบนทันที
              </div>
            )}
          </div>

          {/* Accept Terms Checkbox */}
          <div className="flex items-center gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(checked) => setTermsAccepted(checked === true)}
            />
            <label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
              ฉันได้อ่านและยอมรับเงื่อนไขการสั่งซื้อ
            </label>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button variant="outline" onClick={onClose} className="w-full">
              ยกเลิก
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={!termsAccepted || !canAfford}
              className="w-full bg-primary hover:bg-primary/90"
            >
              สั่งซื้อ
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
