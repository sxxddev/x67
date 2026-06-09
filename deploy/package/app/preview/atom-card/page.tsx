import { SitePageShell } from "@/components/site-page-shell"
import { AtomHoverCardPreview } from "@/components/store/atom-hover-card-preview"

export default function AtomCardPreviewPage() {
  return (
    <SitePageShell>
      <div className="mx-auto max-w-lg px-4 py-12">
        <h1 className="mb-2 text-center text-xl font-bold text-white">
          Atom Orbit Card Preview
        </h1>
        <p className="mb-8 text-center text-sm text-white/50">
          เอาเมาส์ไปวางบนการ์ด — วงแหวนจะหมุนตามแกน X / Y / Z
        </p>
        <AtomHoverCardPreview />
      </div>
    </SitePageShell>
  )
}
