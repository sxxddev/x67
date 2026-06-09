"use client"

import { Bell } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white border border-border shadow-sm p-6">
        <h1 className="text-xl font-bold text-foreground">การแจ้งเตือน</h1>
        <p className="text-sm text-muted-foreground">การแจ้งเตือนทั้งหมดของคุณ</p>
      </div>

      {/* Empty State */}
      <div className="rounded-xl bg-white border border-border shadow-sm p-6">
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Bell className="h-20 w-20 text-muted-foreground/30" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">ไม่มีการแจ้งเตือน</h3>
          <p className="mt-2 text-muted-foreground">คุณไม่มีการแจ้งเตือนในขณะนี้</p>
        </div>
      </div>
    </div>
  )
}
