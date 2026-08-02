import { PrismaClient } from '../src/generated/client'

const prisma = new PrismaClient()

const CATEGORIES = [
  { name: 'Định hướng nghề nghiệp', slug: 'dinh-huong-nghe-nghiep', icon: 'compass', order: 1 },
  { name: 'Bí kíp tìm việc', slug: 'bi-kip-tim-viec', icon: 'lightbulb', order: 2 },
  { name: 'Chế độ lương thưởng', slug: 'che-do-luong-thuong', icon: 'banknote', order: 3 },
  { name: 'Kiến thức chuyên ngành', slug: 'kien-thuc-chuyen-nganh', icon: 'graduation-cap', order: 4 },
  { name: 'Hành trang nghề nghiệp', slug: 'hanh-trang-nghe-nghiep', icon: 'briefcase', order: 5 },
  { name: 'Thị trường & xu hướng tuyển dụng', slug: 'thi-truong-xu-huong-tuyen-dung', icon: 'trending-up', order: 6 },
]

async function main() {
  for (const cat of CATEGORIES) {
    await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: cat.order },
      create: cat,
    })
    console.log(`✓ ${cat.name}`)
  }
  console.log('Done seeding article categories.')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
