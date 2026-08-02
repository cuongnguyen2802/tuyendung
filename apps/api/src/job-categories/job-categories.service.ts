import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

export interface UpsertCategoryDto {
  name: string
  slug: string
  icon?: string
  description?: string
  order?: number
  isActive?: boolean
}

@Injectable()
export class JobCategoriesService {
  constructor(private prisma: PrismaService) {}

  async findAll(activeOnly = true) {
    const rows = await this.prisma.jobCategory.findMany({
      where: activeOnly ? { isActive: true } : undefined,
      orderBy: [{ order: 'asc' }, { name: 'asc' }],
      include: { _count: { select: { jobs: { where: { status: 'PUBLISHED' } } } } },
    })
    return rows.map(({ _count, ...cat }) => ({ ...cat, jobCount: _count.jobs }))
  }

  async findBySlug(slug: string) {
    const cat = await this.prisma.jobCategory.findUnique({ where: { slug } })
    if (!cat) throw new NotFoundException('Phân loại việc làm không tồn tại')
    return cat
  }

  async create(dto: UpsertCategoryDto) {
    return this.prisma.jobCategory.create({ data: dto })
  }

  async update(id: string, dto: Partial<UpsertCategoryDto>) {
    await this.findOneOrThrow(id)
    return this.prisma.jobCategory.update({ where: { id }, data: dto })
  }

  async remove(id: string) {
    await this.findOneOrThrow(id)
    return this.prisma.jobCategory.delete({ where: { id } })
  }

  private async findOneOrThrow(id: string) {
    const cat = await this.prisma.jobCategory.findUnique({ where: { id } })
    if (!cat) throw new NotFoundException('Phân loại việc làm không tồn tại')
    return cat
  }
}
