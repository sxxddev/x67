import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { cn } from "@/lib/utils"

/** main ยืดสูงอย่างน้อยหนึ่งจอ — ฟุตเตอร์อยู่ล่าง ต้องเลื่อนลงถึงจะเห็นเมื่อเนื้อหาน้อย */
export const siteMainStretchClass =
  "flex min-h-[calc(100dvh-4.5rem)] flex-1 flex-col sm:min-h-[calc(100dvh-4rem)]"

export const siteMainSpacerClass = "min-h-[18vh] flex-1 sm:min-h-[22vh]"

type SitePageShellProps = {
  children: React.ReactNode
  mainClassName?: string
  /** หน้าแรกมี spacer ใน hero แล้ว — ปิดซ้ำ */
  footerSpacer?: boolean
}

export function SitePageShell({
  children,
  mainClassName,
  footerSpacer = true,
}: SitePageShellProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className={cn(siteMainStretchClass, mainClassName)}>
        {children}
        {footerSpacer && (
          <div className={siteMainSpacerClass} aria-hidden />
        )}
      </main>
      <Footer />
    </div>
  )
}
