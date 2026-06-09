import { SitePageShell } from "@/components/site-page-shell"
import { CategoryPageLoader } from "@/components/store/category-page-loader"

interface CategoryPageProps {
  params: Promise<{ categoryId: string }>
}

export default function CategoryPage({ params }: CategoryPageProps) {
  return (
    <SitePageShell>
      <CategoryPageLoader params={params} />
    </SitePageShell>
  )
}
