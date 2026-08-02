import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://tuyendung.vn'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/employer/',
          '/profile/',
          '/applications/',
          '/resumes/builder',
          '/resumes/upload',
          '/cover-letters/new',
          '/messages',
          '/notifications',
          '/settings/',
          '/upgrade',
          '/api/',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
