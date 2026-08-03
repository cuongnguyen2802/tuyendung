import { Navbar } from '@/components/layout/Navbar'
import { CandidateSidebar } from '@/components/candidate/CandidateSidebar'
import { UpgradeToastListener } from '@/components/common/UpgradeToastListener'
import { readJsonCached } from '@/lib/read-json-cached'
import { serverFetch } from '@/lib/server-fetch'
import { JobCategoryDto } from '@tuyendung/types'

type ArticlePreview = { title: string; excerpt?: string | null; slug: string; imageUrl?: string | null; category?: { slug: string } }

export default async function CandidateLayout({ children }: { children: React.ReactNode }) {
  const navConfig = readJsonCached('nav-menu.json', { items: [] as { id: string; label?: string; visible: boolean; sections?: any[] }[] })
  const [categories, articlesResult] = await Promise.all([
    serverFetch<JobCategoryDto[]>('/job-categories', { revalidate: 300 }),
    serverFetch<{ data: ArticlePreview[] }>('/articles?limit=2', { revalidate: 300 }),
  ])

  return (
    <>
      <UpgradeToastListener />
      <Navbar navConfig={navConfig} categories={categories ?? []} featuredArticles={articlesResult?.data ?? []} />
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="shrink-0">
            <CandidateSidebar />
          </aside>
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </>
  )
}
