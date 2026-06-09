"use client"

import { useTheme } from "@/components/theme-provider"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()

  const themeOptions = [
    { id: "light", label: "Light Mode", icon: Sun },
    { id: "dark", label: "Dark Mode", icon: Moon },
    { id: "system", label: "System", icon: Monitor },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-xl bg-white border border-border shadow-sm p-6">
        <h1 className="text-xl font-bold text-foreground">ตั้งค่า</h1>
        <p className="text-sm text-muted-foreground">ปรับแต่งการตั้งค่าของคุณ</p>
      </div>

      {/* Theme Settings */}
      <div className="rounded-xl bg-white border border-border shadow-sm p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">ธีม</h2>
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon
            const isActive = theme === option.id
            return (
              <button
                key={option.id}
                onClick={() => setTheme(option.id)}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-lg border p-4 transition-all",
                  isActive
                    ? "border-primary bg-primary/10"
                    : "border-border hover:border-primary/50"
                )}
              >
                <Icon
                  className={cn(
                    "h-8 w-8",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-sm font-medium",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Language Settings */}
      <div className="rounded-xl bg-white border border-border shadow-sm p-6">
        <h2 className="mb-4 text-lg font-semibold text-foreground">ภาษา</h2>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center justify-center gap-2 rounded-lg border border-primary bg-primary/10 p-4">
            <span className="text-sm font-medium text-primary">ไทย</span>
          </button>
          <button className="flex items-center justify-center gap-2 rounded-lg border border-border p-4 transition-all hover:border-primary/50">
            <span className="text-sm font-medium text-muted-foreground">English</span>
          </button>
        </div>
      </div>
    </div>
  )
}
