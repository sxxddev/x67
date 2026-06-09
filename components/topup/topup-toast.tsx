"use client"

import { AlertCircle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export function TopupToast({
  message,
  type,
}: {
  message: string
  type: "success" | "error"
}) {
  return (
    <div
      className={cn(
        "fixed top-20 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-3 shadow-xl animate-in slide-in-from-right backdrop-blur-xl",
        type === "success"
          ? "border-white/20 bg-white/10 text-white"
          : "border-white/10 bg-black/80 text-white/90"
      )}
    >
      {type === "success" ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <span className="text-sm font-normal">{message}</span>
    </div>
  )
}
