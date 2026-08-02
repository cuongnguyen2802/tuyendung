export interface CategoryMeta {
  desc: string
  gradient: string
  illustration: string
  iconColor: string
  bgColor: string
  borderColor: string
}

export const CATEGORY_META: Record<string, CategoryMeta> = {
  'dinh-huong-nghe-nghiep': {
    desc: 'Khám phá con đường sự nghiệp và xây dựng kế hoạch phát triển dài hạn.',
    gradient: 'from-emerald-50 via-green-50 to-teal-50',
    illustration: '🧭',
    iconColor: 'text-brand',
    bgColor: 'bg-brand/10',
    borderColor: 'border-brand/20',
  },
  'bi-kip-tim-viec': {
    desc: 'Bí quyết viết CV, cover letter và chinh phục mọi vòng phỏng vấn.',
    gradient: 'from-amber-50 via-yellow-50 to-orange-50',
    illustration: '💡',
    iconColor: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
  },
  'che-do-luong-thuong': {
    desc: 'Thông tin mức lương, phúc lợi và cách đàm phán lương theo ngành nghề.',
    gradient: 'from-emerald-50 via-teal-50 to-cyan-50',
    illustration: '💰',
    iconColor: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
  },
  'kien-thuc-chuyen-nganh': {
    desc: 'Kiến thức chuyên sâu theo từng lĩnh vực để trở thành chuyên gia trong ngành.',
    gradient: 'from-violet-50 via-purple-50 to-indigo-50',
    illustration: '🎓',
    iconColor: 'text-violet-600',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
  },
  'hanh-trang-nghe-nghiep': {
    desc: 'Tài liệu, mẫu đơn từ và công cụ giúp bạn thăng tiến nhanh trong sự nghiệp.',
    gradient: 'from-sky-50 via-blue-50 to-indigo-50',
    illustration: '🎒',
    iconColor: 'text-sky-600',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
  },
  'thi-truong-xu-huong-tuyen-dung': {
    desc: 'Xu hướng tuyển dụng mới nhất và dự báo nghề nghiệp tương lai.',
    gradient: 'from-orange-50 via-amber-50 to-yellow-50',
    illustration: '📈',
    iconColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
  },
}

export const DEFAULT_CATEGORY_META: CategoryMeta = {
  desc: 'Tổng hợp các bài viết kiến thức nghề nghiệp hữu ích.',
  gradient: 'from-brand-50 to-emerald-50',
  illustration: '📚',
  iconColor: 'text-gray-600',
  bgColor: 'bg-gray-50',
  borderColor: 'border-gray-200',
}

// Maps clean URL slugs → DB category slugs
export const CATEGORY_SLUG_MAP: Record<string, string> = {
  career:      'dinh-huong-nghe-nghiep',
  tips:        'bi-kip-tim-viec',
  salary:      'che-do-luong-thuong',
  knowledge:   'kien-thuc-chuyen-nganh',
  preparation: 'hanh-trang-nghe-nghiep',
  market:      'thi-truong-xu-huong-tuyen-dung',
}

// Fallback display names keyed by DB slug (used when API is unreachable)
export const CATEGORY_NAMES: Record<string, string> = {
  'dinh-huong-nghe-nghiep':      'Định hướng nghề nghiệp',
  'bi-kip-tim-viec':              'Bí kíp tìm việc',
  'che-do-luong-thuong':          'Chế độ lương thưởng',
  'kien-thuc-chuyen-nganh':       'Kiến thức chuyên ngành',
  'hanh-trang-nghe-nghiep':       'Hành trang nghề nghiệp',
  'thi-truong-xu-huong-tuyen-dung': 'Thị trường & xu hướng tuyển dụng',
}

// Reverse map: DB slug → URL slug
export const DB_TO_URL: Record<string, string> = Object.fromEntries(
  Object.entries(CATEGORY_SLUG_MAP).map(([url, db]) => [db, url]),
)

export function toDbSlug(urlSlug: string) {
  return CATEGORY_SLUG_MAP[urlSlug] ?? urlSlug
}

export interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  imageUrl: string | null
  content: string
  views: number
  publishedAt: string | null
  createdAt: string
  category: { id: string; name: string; slug: string }
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string | null
  _count: { articles: number }
}
