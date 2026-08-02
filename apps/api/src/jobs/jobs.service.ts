import {
  Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject,
} from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { nanoid } from 'nanoid'
import { PrismaService } from '../prisma/prisma.service'
import { SearchService } from '../search/search.service'
import { ActivityService } from '../activity/activity.service'
import { PlanService } from '../common/services/plan.service'
import { CreateJobDto, UpdateJobDto, JobQueryDto } from './dto/create-job.dto'
import { buildSkipTake, buildPaginationMeta } from '../common/utils/pagination'
import { JobStatus } from '@tuyendung/types'

@Injectable()
export class JobsService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService,
    private activity: ActivityService,
    private plan: PlanService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  async create(userId: string, dto: CreateJobDto) {
    await this.plan.checkJobQuota(userId)

    const employer = await this.prisma.employer.findUnique({
      where: { userId },
      select: { id: true },
    })
    if (!employer) throw new ForbiddenException('Bạn chưa có thông tin công ty')

    const { skillIds, categoryId, deadline, ...jobData } = dto
    const slug = this.toSlug(dto.title) + '-' + nanoid(8)

    const job = await this.prisma.job.create({
      data: {
        ...jobData,
        slug,
        employerId: employer.id,
        status: JobStatus.PENDING_APPROVAL,
        ...(categoryId ? { categoryId } : {}),
        ...(deadline ? { deadline: new Date(deadline) } : {}),
        ...(skillIds?.length && {
          skills: { create: skillIds.map((id) => ({ skillId: id })) },
        }),
      },
      include: {
        employer: { select: { id: true, companyName: true, logoUrl: true, slug: true, verified: true } },
        skills: { include: { skill: true } },
      },
    })

    this.activity.record(
      employer.id,
      'JOB_CREATED',
      `Tạo tin tuyển dụng ${job.title}`,
      job.id,
      job.title,
    )

    return job
  }

  async findAll(query: JobQueryDto, userId?: string) {
    const { page = 1, limit = 20, keyword, city, jobType, workMode, salaryMin, experienceMin, sortBy, categorySlug } = query

    if (keyword) {
      if (this.searchService.isAvailable) {
        return this.searchService.searchJobs(keyword, query)
      }
      // Meilisearch not running — fall back to Postgres ILIKE search
      return this.searchPostgres(query, userId)
    }

    // Cache only for anonymous requests (no userId)
    const cacheKey = !userId
      ? `jobs:list:${page}:${limit}:${city ?? ''}:${jobType ?? ''}:${workMode ?? ''}:${salaryMin ?? ''}:${experienceMin ?? ''}:${sortBy ?? ''}:${categorySlug ?? ''}`
      : null
    if (cacheKey) {
      const cached = await this.cache.get(cacheKey)
      if (cached) return cached
    }

    const where = {
      status: JobStatus.PUBLISHED,
      ...(city && { city }),
      ...(jobType && { jobType }),
      ...(workMode && { workMode }),
      ...(salaryMin && { salaryMin: { gte: salaryMin } }),
      ...(experienceMin !== undefined && { experienceMin: { lte: experienceMin } }),
      ...(categorySlug && { category: { slug: categorySlug } }),
    }

    const orderBy =
      sortBy === 'salary'
        ? { salaryMax: 'desc' as const }
        : sortBy === 'views'
          ? { views: 'desc' as const }
          : { publishedAt: 'desc' as const }

    const { skip, take } = buildSkipTake(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        select: {
          id: true, title: true, slug: true, city: true, jobType: true,
          workMode: true, salaryMin: true, salaryMax: true, salaryNegotiable: true,
          experienceMin: true, deadline: true, status: true, views: true,
          isFeatured: true, publishedAt: true, createdAt: true, quantity: true,
          employer: {
            select: { id: true, companyName: true, logoUrl: true, slug: true, city: true, verified: true },
          },
          skills: { select: { skill: { select: { id: true, name: true, slug: true } } } },
          ...(userId && { savedBy: { where: { userId }, select: { userId: true } } }),
        },
        orderBy: [{ isFeatured: 'desc' }, orderBy],
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ])

    const result = {
      data: data.map((job) => ({
        ...job,
        // Flatten skills: [{ skill: { id, name, slug } }] → [{ id, name, slug }]
        skills: (job as any).skills?.map((js: any) => js.skill) ?? [],
        isSaved: userId ? ((job as unknown as { savedBy: unknown[] }).savedBy?.length ?? 0) > 0 : false,
      })),
      meta: buildPaginationMeta(total, page, limit),
    }

    if (cacheKey) await this.cache.set(cacheKey, result, 120_000) // 2 minutes
    return result
  }

  async findBySlug(slug: string, userId?: string) {
    const job = await this.prisma.job.findFirst({
      where: { slug, status: JobStatus.PUBLISHED },
      include: {
        employer: {
          select: {
            id: true, userId: true, companyName: true, logoUrl: true, slug: true,
            city: true, website: true, description: true, size: true,
            industry: true, founded: true, verified: true,
          },
        },
        skills: { include: { skill: true } },
        _count: { select: { applications: true } },
      },
    })
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại')

    // Fire all side-effects in parallel; view increment is fire-and-forget
    this.prisma.job.update({ where: { id: job.id }, data: { views: { increment: 1 } } }).catch(() => {})

    const [hasApplied, isSaved] = await Promise.all([
      userId
        ? this.prisma.application
            .findUnique({ where: { jobId_userId: { jobId: job.id, userId } } })
            .then(Boolean)
        : Promise.resolve(false),
      userId
        ? this.prisma.savedJob
            .findUnique({ where: { userId_jobId: { userId, jobId: job.id } } })
            .then(Boolean)
        : Promise.resolve(false),
    ])

    return {
      ...job,
      skills: job.skills.map((js) => js.skill),
      hasApplied,
      isSaved,
    }
  }

  async update(userId: string, jobId: string, dto: UpdateJobDto) {
    const job = await this.getJobForEmployer(userId, jobId)
    const { skillIds, categoryId, deadline, ...jobData } = dto

    if (skillIds !== undefined) {
      await this.prisma.jobSkill.deleteMany({ where: { jobId: job.id } })
      if (skillIds.length) {
        await this.prisma.jobSkill.createMany({
          data: skillIds.map((id) => ({ jobId: job.id, skillId: id })),
        })
      }
    }

    const updated = await this.prisma.job.update({
      where: { id: job.id },
      data: {
        ...jobData,
        categoryId: categoryId || null,
        ...(deadline ? { deadline: new Date(deadline) } : { deadline: null }),
      },
      include: { employer: true, skills: { include: { skill: true } } },
    })

    await this.searchService.indexJob(updated)
    return updated
  }

  async publish(userId: string, jobId: string) {
    const job = await this.getJobForEmployer(userId, jobId)
    if (job.status === JobStatus.PUBLISHED)
      throw new BadRequestException('Tin đã được đăng')

    const updated = await this.prisma.job.update({
      where: { id: job.id },
      data: { status: JobStatus.PENDING_APPROVAL },
    })
    return updated
  }

  async close(userId: string, jobId: string) {
    const job = await this.getJobForEmployer(userId, jobId)
    const updated = await this.prisma.job.update({
      where: { id: job.id },
      data: { status: JobStatus.CLOSED },
    })
    await this.searchService.removeJob(job.id)
    return updated
  }

  async delete(userId: string, jobId: string) {
    const job = await this.getJobForEmployer(userId, jobId)
    await this.prisma.job.delete({ where: { id: job.id } })
    await this.searchService.removeJob(job.id)
    return { message: 'Đã xóa tin tuyển dụng' }
  }

  async getMyJobs(userId: string, page = 1, limit = 20, status?: JobStatus) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } })
    if (!employer) throw new ForbiddenException('Bạn chưa có thông tin công ty')

    const where = { employerId: employer.id, ...(status && { status }) }
    const { skip, take } = buildSkipTake(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          skills: { include: { skill: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ])

    return { data, meta: buildPaginationMeta(total, page, limit) }
  }

  async toggleSaveJob(userId: string, jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } })
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại')

    const existing = await this.prisma.savedJob.findUnique({
      where: { userId_jobId: { userId, jobId } },
    })

    if (existing) {
      await this.prisma.savedJob.delete({ where: { userId_jobId: { userId, jobId } } })
      return { saved: false }
    }

    await this.prisma.savedJob.create({ data: { userId, jobId } })
    return { saved: true }
  }

  async toggleFeature(userId: string, jobId: string) {
    const job = await this.getJobForEmployer(userId, jobId)

    if (!job.isFeatured) {
      const plan = await this.plan.getUserPlan(userId)
      const { featuredJobsPerMonth } = (await import('@tuyendung/types')).EMPLOYER_PLAN_LIMITS[plan]
      if (featuredJobsPerMonth === 0) {
        throw new (await import('@nestjs/common')).ForbiddenException(
          `Gói ${plan} không hỗ trợ tin nổi bật. Nâng cấp lên Pro hoặc Premium.`,
        )
      }
      if (isFinite(featuredJobsPerMonth as number)) {
        const startOfMonth = new Date()
        startOfMonth.setDate(1); startOfMonth.setHours(0, 0, 0, 0)
        const employer = await this.prisma.employer.findUnique({ where: { userId }, select: { id: true } })
        const usedThisMonth = await this.prisma.job.count({
          where: { employerId: employer!.id, isFeatured: true, updatedAt: { gte: startOfMonth } },
        })
        if (usedThisMonth >= (featuredJobsPerMonth as number)) {
          throw new (await import('@nestjs/common')).ForbiddenException(
            `Gói ${plan} chỉ có ${featuredJobsPerMonth} lượt nổi bật/tháng, bạn đã dùng hết.`,
          )
        }
      }
    }

    return this.prisma.job.update({
      where: { id: job.id },
      data: { isFeatured: !job.isFeatured },
      select: { id: true, isFeatured: true },
    })
  }

  async approveJob(jobId: string) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.PUBLISHED, publishedAt: new Date() },
    })
  }

  async rejectJob(jobId: string, _reason?: string) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: JobStatus.REJECTED },
    })
  }

  private async searchPostgres(query: JobQueryDto, userId?: string) {
    const { keyword, page = 1, limit = 20, city, jobType, workMode, salaryMin, experienceMin } = query
    const { skip, take } = buildSkipTake(page, limit)

    const where: Record<string, unknown> = {
      status: JobStatus.PUBLISHED,
      ...(keyword && {
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { description: { contains: keyword, mode: 'insensitive' } },
          { employer: { companyName: { contains: keyword, mode: 'insensitive' } } },
        ],
      }),
      ...(city && { city }),
      ...(jobType && { jobType }),
      ...(workMode && { workMode }),
      ...(salaryMin && { salaryMin: { gte: salaryMin } }),
      ...(experienceMin !== undefined && { experienceMin: { lte: experienceMin } }),
    }

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        select: {
          id: true, title: true, slug: true, city: true, jobType: true,
          workMode: true, salaryMin: true, salaryMax: true, salaryNegotiable: true,
          experienceMin: true, deadline: true, status: true, views: true,
          isFeatured: true, publishedAt: true, createdAt: true, quantity: true,
          employer: {
            select: { id: true, companyName: true, logoUrl: true, slug: true, city: true, verified: true },
          },
          skills: { select: { skill: { select: { id: true, name: true, slug: true } } } },
          ...(userId && { savedBy: { where: { userId }, select: { userId: true } } }),
        },
        orderBy: [{ isFeatured: 'desc' }, { publishedAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.job.count({ where }),
    ])

    return {
      data: data.map((job) => ({
        ...job,
        skills: (job as any).skills?.map((js: any) => js.skill) ?? [],
        isSaved: userId ? ((job as any).savedBy?.length ?? 0) > 0 : false,
      })),
      meta: buildPaginationMeta(total, page, limit),
    }
  }

  async getStats() {
    const cacheKey = 'jobs:stats'
    const cached = await this.cache.get(cacheKey)
    if (cached) return cached

    const now = new Date()
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000)

    const [totalActive, newLast24h, totalEmployers, recentJobs, weeklyJobs, jobTypeStats] =
      await Promise.all([
        this.prisma.job.count({ where: { status: 'PUBLISHED' } }),
        this.prisma.job.count({ where: { status: 'PUBLISHED', createdAt: { gte: yesterday } } }),
        this.prisma.employer.count(),
        this.prisma.job.findMany({
          where: { status: 'PUBLISHED' },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true, title: true, slug: true, city: true,
            employer: { select: { companyName: true, logoUrl: true, slug: true } },
          },
        }),
        this.prisma.job.findMany({
          where: { status: 'PUBLISHED', publishedAt: { gte: eightWeeksAgo } },
          select: { publishedAt: true },
        }),
        this.prisma.job.groupBy({
          by: ['jobType'],
          where: { status: 'PUBLISHED' },
          _count: { id: true },
          orderBy: { _count: { id: 'desc' } },
        }),
      ])

    // Group by ISO week
    const weekMap = new Map<string, number>()
    weeklyJobs.forEach((job) => {
      if (!job.publishedAt) return
      const d = new Date(job.publishedAt)
      const day = d.getDay()
      d.setDate(d.getDate() - day + (day === 0 ? -6 : 1))
      d.setHours(0, 0, 0, 0)
      const key = d.toISOString().split('T')[0]
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1)
    })

    const weeklyData = Array.from(weekMap.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({ week, count }))

    const JOB_TYPE_LABELS: Record<string, string> = {
      FULL_TIME: 'Toàn thời gian',
      PART_TIME: 'Bán thời gian',
      CONTRACT: 'Hợp đồng',
      INTERNSHIP: 'Thực tập',
      FREELANCE: 'Freelance',
    }

    const jobTypeData = jobTypeStats.map((r) => ({
      label: JOB_TYPE_LABELS[r.jobType] ?? r.jobType,
      count: r._count.id,
    }))

    const result = { totalActive, newLast24h, totalEmployers, recentJobs, weeklyData, jobTypeData }
    await this.cache.set(cacheKey, result, 300_000) // 5 minutes
    return result
  }

  async findByIdForEmployer(userId: string, jobId: string) {
    return this.getJobForEmployer(userId, jobId)
  }

  private async getJobForEmployer(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, employer: { userId } },
    })
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại hoặc bạn không có quyền')
    return job
  }

  private toSlug(text: string): string {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }
}
