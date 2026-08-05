import { Injectable, NotFoundException, Inject, ForbiddenException, ConflictException, BadRequestException } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { PrismaService } from '../prisma/prisma.service'
import { ActivityService } from '../activity/activity.service'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { buildSkipTake, buildPaginationMeta } from '../common/utils/pagination'

@Injectable()
export class EmployersService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    private activity: ActivityService,
  ) {}

  async getMyCompany(userId: string) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
      include: { _count: { select: { jobs: { where: { status: 'PUBLISHED' } } } } },
    })
    if (!employer) throw new NotFoundException('Thông tin công ty không tồn tại')
    return employer
  }

  async updateCompany(userId: string, dto: UpdateCompanyDto) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } })
    if (!employer) throw new NotFoundException('Thông tin công ty không tồn tại')
    const updated = await this.prisma.employer.update({ where: { userId }, data: dto })
    this.activity.record(
      employer.id,
      'COMPANY_UPDATED',
      `Cập nhật thông tin công ty ${employer.companyName}`,
      employer.id,
      employer.companyName,
    ).catch(() => {})
    return updated
  }

  async requestVerification(userId: string, body: { taxCode: string; contactName: string; note?: string }) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } })
    if (!employer) throw new NotFoundException('Thông tin công ty không tồn tại')

    // Save tax code to profile
    await this.prisma.employer.update({ where: { userId }, data: { taxCode: body.taxCode } })

    // Notify all admins
    const admins = await this.prisma.user.findMany({ where: { role: 'ADMIN' as never } })
    for (const admin of admins) {
      this.prisma.notification.create({
        data: {
          userId: admin.id,
          type: 'SYSTEM' as never,
          title: 'Yêu cầu xác minh doanh nghiệp',
          body: `${employer.companyName} (MST: ${body.taxCode}) vừa gửi yêu cầu xác minh. Người liên hệ: ${body.contactName}`,
          link: `/admin/employers`,
        },
      }).catch(() => {})
    }

    return { success: true, message: 'Yêu cầu xác minh đã được gửi. Chúng tôi sẽ phản hồi trong vòng 1-3 ngày làm việc.' }
  }

  async getCompanyBySlug(slug: string) {
    const employer = await this.prisma.employer.findUnique({
      where: { slug },
      include: {
        _count: { select: { jobs: { where: { status: 'PUBLISHED' } } } },
        jobs: {
          where: { status: 'PUBLISHED' },
          include: { skills: { include: { skill: true } } },
          orderBy: { publishedAt: 'desc' },
          take: 10,
        },
      },
    })
    if (!employer) throw new NotFoundException('Công ty không tồn tại')
    return employer
  }

  async listCompanies(page = 1, limit = 20, city?: string, industry?: string) {
    const cacheKey = `employers:list:${page}:${limit}:${city ?? ''}:${industry ?? ''}`
    const cached = await this.cache.get(cacheKey)
    if (cached) return cached

    const where = {
      ...(city && { city }),
      ...(industry && { industry }),
    }

    const { skip, take } = buildSkipTake(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.employer.findMany({
        where,
        select: {
          id: true, companyName: true, slug: true, logoUrl: true,
          city: true, industry: true, size: true, verified: true, createdAt: true,
          _count: { select: { jobs: { where: { status: 'PUBLISHED' } } } },
        },
        orderBy: [{ verified: 'desc' }, { createdAt: 'desc' }],
        skip,
        take,
      }),
      this.prisma.employer.count({ where }),
    ])

    const mapped = data.map((e: any) => ({
      id: e.id,
      companyName: e.companyName,
      slug: e.slug,
      logoUrl: e.logoUrl,
      city: e.city,
      industry: e.industry,
      size: e.size,
      verified: e.verified,
      jobCount: e._count?.jobs ?? 0,
    }))

    const result = { data: mapped, meta: buildPaginationMeta(total, page, limit) }
    await this.cache.set(cacheKey, result, 60000) // 1 minute
    return result
  }

  async getInsights(userId: string, period: number) {
    const employer = await this.prisma.employer.findUnique({ where: { userId }, select: { id: true } })
    if (!employer) throw new NotFoundException('Thông tin công ty không tồn tại')

    const since = new Date()
    since.setDate(since.getDate() - period)

    const [statusBreakdown, topJobs, totalViews, dailyApplications] = await Promise.all([
      // Application status breakdown
      this.prisma.application.groupBy({
        by: ['status'],
        where: { job: { employerId: employer.id } },
        _count: { _all: true },
      }),
      // Top jobs by applications
      this.prisma.job.findMany({
        where: { employerId: employer.id },
        include: { _count: { select: { applications: true } } },
        orderBy: { applications: { _count: 'desc' } },
        take: 5,
      }),
      // Total views across all jobs
      this.prisma.job.aggregate({
        where: { employerId: employer.id },
        _sum: { views: true },
      }),
      // Applications per day for the period
      this.prisma.application.findMany({
        where: { job: { employerId: employer.id }, appliedAt: { gte: since } },
        select: { appliedAt: true },
        orderBy: { appliedAt: 'asc' },
      }),
    ])

    // Build daily trend
    const dayMap: Record<string, number> = {}
    for (let i = period - 1; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i)
      dayMap[d.toISOString().slice(0, 10)] = 0
    }
    for (const app of dailyApplications) {
      const key = app.appliedAt.toISOString().slice(0, 10)
      if (key in dayMap) dayMap[key]++
    }
    const dailyTrend = Object.entries(dayMap).map(([date, count]) => ({ date, count }))

    return {
      statusBreakdown: statusBreakdown.map(s => ({ status: s.status, count: s._count._all })),
      topJobs: topJobs.map(j => ({
        id: j.id, title: j.title, status: j.status,
        applicationCount: j._count.applications, views: j.views,
      })),
      totalViews: totalViews._sum.views ?? 0,
      dailyTrend,
    }
  }

  // ─── Employer Members ────────────────────────────────────────────────────────

  private async getEmployerOrThrow(userId: string) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } })
    if (!employer) throw new NotFoundException('Thông tin công ty không tồn tại')
    return employer
  }

  async listMembers(userId: string) {
    const employer = await this.getEmployerOrThrow(userId)
    const members = await this.prisma.employerMember.findMany({
      where: { employerId: employer.id },
      orderBy: [{ role: 'asc' }, { invitedAt: 'asc' }],
    })
    // Prepend the owner (current account) at the top
    const ownerUser = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { employer: true },
    })
    const ownerEntry = {
      id: '__owner__',
      employerId: employer.id,
      email: ownerUser?.email ?? '',
      fullName: (ownerUser as any)?.employer?.companyName ?? null,
      role: 'OWNER' as const,
      status: 'ACTIVE' as const,
      invitedBy: null,
      invitedAt: employer.createdAt,
      joinedAt: employer.createdAt,
      note: null,
    }
    return [ownerEntry, ...members]
  }

  async addMember(
    userId: string,
    dto: { email: string; fullName?: string; role?: string; note?: string },
  ) {
    const employer = await this.getEmployerOrThrow(userId)

    // Cannot add owner's own email
    const owner = await this.prisma.user.findUnique({ where: { id: userId } })
    if (owner?.email?.toLowerCase() === dto.email.toLowerCase()) {
      throw new BadRequestException('Không thể thêm chính mình làm quản trị viên')
    }

    const existing = await this.prisma.employerMember.findUnique({
      where: { employerId_email: { employerId: employer.id, email: dto.email.toLowerCase() } },
    })
    if (existing) throw new ConflictException('Email này đã là thành viên của công ty')

    const role = (dto.role as any) ?? 'RECRUITER'
    if (!['ADMIN', 'RECRUITER'].includes(role)) {
      throw new BadRequestException('Vai trò không hợp lệ')
    }

    const member = await this.prisma.employerMember.create({
      data: {
        employerId: employer.id,
        email: dto.email.toLowerCase(),
        fullName: dto.fullName,
        role,
        status: 'ACTIVE',
        invitedBy: userId,
        joinedAt: new Date(),
        note: dto.note,
      },
    })

    this.activity.record(
      employer.id, 'COMPANY_UPDATED',
      `Thêm quản trị viên ${dto.email}`, employer.id, employer.companyName,
    ).catch(() => {})

    return member
  }

  async updateMember(userId: string, memberId: string, dto: { role?: string; fullName?: string; note?: string }) {
    const employer = await this.getEmployerOrThrow(userId)
    const member = await this.prisma.employerMember.findFirst({
      where: { id: memberId, employerId: employer.id },
    })
    if (!member) throw new NotFoundException('Thành viên không tồn tại')

    if (dto.role && !['ADMIN', 'RECRUITER'].includes(dto.role)) {
      throw new BadRequestException('Vai trò không hợp lệ')
    }

    return this.prisma.employerMember.update({
      where: { id: memberId },
      data: {
        ...(dto.role && { role: dto.role as any }),
        ...(dto.fullName !== undefined && { fullName: dto.fullName }),
        ...(dto.note !== undefined && { note: dto.note }),
      },
    })
  }

  async removeMember(userId: string, memberId: string) {
    const employer = await this.getEmployerOrThrow(userId)
    const member = await this.prisma.employerMember.findFirst({
      where: { id: memberId, employerId: employer.id },
    })
    if (!member) throw new NotFoundException('Thành viên không tồn tại')

    await this.prisma.employerMember.delete({ where: { id: memberId } })

    this.activity.record(
      employer.id, 'COMPANY_UPDATED',
      `Xóa quản trị viên ${member.email}`, employer.id, employer.companyName,
    ).catch(() => {})

    return { success: true }
  }

  // ─── Dashboard ────────────────────────────────────────────────────────────────

  async getDashboardStats(userId: string) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } })
    if (!employer) throw new NotFoundException('Thông tin công ty không tồn tại')

    const [totalJobs, publishedJobs, totalApplications, newApplications] = await Promise.all([
      this.prisma.job.count({ where: { employerId: employer.id } }),
      this.prisma.job.count({ where: { employerId: employer.id, status: 'PUBLISHED' } }),
      this.prisma.application.count({ where: { job: { employerId: employer.id } } }),
      this.prisma.application.count({
        where: {
          job: { employerId: employer.id },
          status: 'PENDING',
          appliedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),
    ])

    return { totalJobs, publishedJobs, totalApplications, newApplications }
  }
}
