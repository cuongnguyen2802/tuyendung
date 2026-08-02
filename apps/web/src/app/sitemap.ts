import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tuyendung.vn'
const API_URL  = process.env.NEXT_PUBLIC_API_URL  || 'http://localhost:3001'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL,                                    priority: 1.0,  changeFrequency: 'daily'   },
    { url: `${BASE_URL}/jobs`,                          priority: 0.9,  changeFrequency: 'hourly'  },
    { url: `${BASE_URL}/companies`,                     priority: 0.85, changeFrequency: 'daily'   },
    { url: `${BASE_URL}/blog`,                          priority: 0.75, changeFrequency: 'weekly'  },
    { url: `${BASE_URL}/resumes/templates`,             priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${BASE_URL}/cover-letters/templates`,       priority: 0.7,  changeFrequency: 'monthly' },
    { url: `${BASE_URL}/tools/salary`,                  priority: 0.65, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/tools/interview`,               priority: 0.65, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/tools/career-test`,             priority: 0.65, changeFrequency: 'monthly' },
    { url: `${BASE_URL}/login`,                         priority: 0.4,  changeFrequency: 'yearly'  },
    { url: `${BASE_URL}/register`,                      priority: 0.4,  changeFrequency: 'yearly'  },
  ].map(r => ({ ...r, lastModified: now }))

  // CV template slugs
  const cvTemplateSlugs = ['developer', 'accountant', 'sales', 'marketing', 'simple']
  const cvTemplateRoutes: MetadataRoute.Sitemap = cvTemplateSlugs.map(slug => ({
    url: `${BASE_URL}/resumes/templates/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Cover letter template slugs
  const clTemplateSlugs = ['classic', 'modern', 'minimal', 'academic', 'tech', 'sales']
  const clTemplateRoutes: MetadataRoute.Sitemap = clTemplateSlugs.map(slug => ({
    url: `${BASE_URL}/cover-letters/templates/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  // Dynamic: published jobs
  let jobRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_URL}/jobs?limit=500&status=PUBLISHED`, {
      next: { revalidate: 3600 },
    })
    if (res.ok) {
      const json = await res.json()
      jobRoutes = (json.data as Array<{ slug: string; updatedAt: string }> ?? []).map(job => ({
        url: `${BASE_URL}/jobs/${job.slug}`,
        lastModified: new Date(job.updatedAt),
        changeFrequency: 'daily' as const,
        priority: 0.75,
      }))
    }
  } catch {}

  // Dynamic: company profiles
  let companyRoutes: MetadataRoute.Sitemap = []
  try {
    const res = await fetch(`${API_URL}/employers?limit=300`, {
      next: { revalidate: 86400 },
    })
    if (res.ok) {
      const json = await res.json()
      companyRoutes = (json.data as Array<{ slug: string; updatedAt: string }> ?? []).map(c => ({
        url: `${BASE_URL}/companies/${c.slug}`,
        lastModified: new Date(c.updatedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.65,
      }))
    }
  } catch {}

  return [
    ...staticRoutes,
    ...cvTemplateRoutes,
    ...clTemplateRoutes,
    ...jobRoutes,
    ...companyRoutes,
  ]
}
