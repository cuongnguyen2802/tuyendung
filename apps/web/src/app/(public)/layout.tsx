import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FloatingActions } from '@/components/common/FloatingActions'
import { readJsonCached } from '@/lib/read-json-cached'
import { serverFetch } from '@/lib/server-fetch'
import { JobCategoryDto } from '@tuyendung/types'

type ArticlePreview = { title: string; excerpt?: string | null; slug: string; imageUrl?: string | null; category?: { slug: string } }

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const navConfig    = readJsonCached('nav-menu.json',         { items: [] as { id: string; label?: string; visible: boolean; sections?: any[] }[] })
  const floatingData = readJsonCached('floating-actions.json', { items: [] as { id: string; label: string; icon: string; href: string; visible: boolean; showBadge: boolean }[] })

  const [categories, articlesResult] = await Promise.all([
    serverFetch<JobCategoryDto[]>('/job-categories', { revalidate: 300 }),
    serverFetch<{ data: ArticlePreview[] }>('/articles?limit=2', { revalidate: 300 }),
  ])

  return (
    <>
      <Navbar navConfig={navConfig} categories={categories ?? []} featuredArticles={articlesResult?.data ?? []} />
      <main>{children}</main>
      <Footer />
      <FloatingActions initialItems={floatingData.items} />
    </>
  )
}
