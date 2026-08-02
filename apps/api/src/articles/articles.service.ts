import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateArticleDto, UpdateArticleDto, ArticleStatus } from './dto/article.dto'
import { buildSkipTake, buildPaginationMeta } from '../common/utils/pagination'
import slugify from 'slugify'

function generateSlug(title: string) {
  const base = slugify(title, { lower: true, locale: 'vi', strict: true })
  const suffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${suffix}`
}

@Injectable()
export class ArticlesService {
  constructor(private prisma: PrismaService) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  async listCategories() {
    return this.prisma.articleCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { articles: { where: { status: 'PUBLISHED' } } } } },
    })
  }

  async listArticles(page = 1, limit = 12, categorySlug?: string, keyword?: string) {
    const where: any = { status: 'PUBLISHED' as any }

    if (categorySlug) {
      const cat = await this.prisma.articleCategory.findUnique({ where: { slug: categorySlug } })
      if (cat) where.categoryId = cat.id
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { excerpt: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    const { skip, take } = buildSkipTake(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true } } },
        orderBy: { publishedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.article.count({ where }),
    ])

    return { data, meta: buildPaginationMeta(total, page, limit) }
  }

  async getArticleBySlug(slug: string) {
    const article = await this.prisma.article.findUnique({
      where: { slug },
      include: { category: true },
    })
    if (!article || article.status !== 'PUBLISHED')
      throw new NotFoundException('Bài viết không tồn tại')

    await this.prisma.article.update({ where: { slug }, data: { views: { increment: 1 } } })
    return article
  }

  // ── Admin ───────────────────────────────────────────────────────────────────

  async adminListArticles(page = 1, limit = 20, status?: string, keyword?: string, categoryId?: string) {
    const where: any = {}
    if (status) where.status = status
    if (categoryId) where.categoryId = categoryId
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { excerpt: { contains: keyword, mode: 'insensitive' } },
      ]
    }

    const { skip, take } = buildSkipTake(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.article.findMany({
        where,
        include: { category: { select: { id: true, name: true, slug: true, icon: true } } },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.article.count({ where }),
    ])

    return { data, meta: buildPaginationMeta(total, page, limit) }
  }

  async createArticle(dto: CreateArticleDto) {
    const slug = generateSlug(dto.title)
    const publishedAt = dto.status === ArticleStatus.PUBLISHED ? new Date() : null

    return this.prisma.article.create({
      data: {
        title: dto.title,
        slug,
        content: dto.content,
        excerpt: dto.excerpt,
        imageUrl: dto.imageUrl,
        categoryId: dto.categoryId,
        status: (dto.status ?? ArticleStatus.DRAFT) as any,
        publishedAt,
        metaTitle: dto.metaTitle,
        metaDescription: dto.metaDescription,
        metaKeywords: dto.metaKeywords,
      },
      include: { category: true },
    })
  }

  async adminGetArticle(id: string) {
    const article = await this.prisma.article.findUnique({
      where: { id },
      include: { category: true },
    })
    if (!article) throw new NotFoundException('Bài viết không tồn tại')
    return article
  }

  async updateArticle(id: string, dto: UpdateArticleDto) {
    const existing = await this.prisma.article.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Bài viết không tồn tại')

    const publishedAt =
      dto.status === ArticleStatus.PUBLISHED && existing.status !== 'PUBLISHED'
        ? new Date()
        : undefined

    return this.prisma.article.update({
      where: { id },
      data: {
        ...dto,
        status: dto.status as any,
        ...(publishedAt !== undefined && { publishedAt }),
      },
      include: { category: true },
    })
  }

  async deleteArticle(id: string) {
    const existing = await this.prisma.article.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Bài viết không tồn tại')
    await this.prisma.article.delete({ where: { id } })
    return { message: 'Đã xóa bài viết' }
  }

  async adminListCategories() {
    return this.prisma.articleCategory.findMany({
      orderBy: { order: 'asc' },
      include: { _count: { select: { articles: true } } },
    })
  }

  async createCategory(name: string, icon?: string) {
    const slug = slugify(name, { lower: true, locale: 'vi', strict: true })
    const last = await this.prisma.articleCategory.findFirst({ orderBy: { order: 'desc' } })
    return this.prisma.articleCategory.create({
      data: { name, slug, icon, order: (last?.order ?? 0) + 1 },
    })
  }

  async updateCategory(id: string, name: string, icon?: string, customSlug?: string) {
    const existing = await this.prisma.articleCategory.findUnique({ where: { id } })
    if (!existing) throw new NotFoundException('Danh mục không tồn tại')
    const slug = customSlug?.trim()
      ? customSlug.trim().toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
      : slugify(name, { lower: true, locale: 'vi', strict: true })
    return this.prisma.articleCategory.update({
      where: { id },
      data: { name, slug, icon },
    })
  }

  async deleteCategory(id: string) {
    const existing = await this.prisma.articleCategory.findUnique({
      where: { id },
      include: { _count: { select: { articles: true } } },
    })
    if (!existing) throw new NotFoundException('Danh mục không tồn tại')
    if (existing._count.articles > 0) {
      throw new Error(`Danh mục còn ${existing._count.articles} bài viết, không thể xóa`)
    }
    await this.prisma.articleCategory.delete({ where: { id } })
    return { message: 'Đã xóa danh mục' }
  }
}
