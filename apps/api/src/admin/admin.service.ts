import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common'
import * as bcrypt from 'bcryptjs'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private cache: Cache,
  ) {}

  // ── Dashboard stats ──────────────────────────────────────────────────────────

  async getDashboardStats(months = 6) {
    const cacheKey = `admin:stats:${months}`
    const cached = await this.cache.get(cacheKey)
    if (cached) return cached

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalUsers, newUsersThisMonth,
      totalEmployers,
      totalJobs, pendingJobs, publishedJobs,
      totalApplications, applicationsThisMonth,
    ] = await Promise.all([
      this.prisma.user.count(),
      this.prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      this.prisma.employer.count(),
      this.prisma.job.count(),
      this.prisma.job.count({ where: { status: 'PENDING_APPROVAL' as any } }),
      this.prisma.job.count({ where: { status: 'PUBLISHED' as any } }),
      this.prisma.application.count(),
      this.prisma.application.count({ where: { appliedAt: { gte: startOfMonth } } }),
    ])

    const [jobsChart, usersChart, applicationsChart] = await Promise.all([
      this.getMonthlyChart('job', months),
      this.getMonthlyChart('user', months),
      this.getMonthlyChart('application', months),
    ])

    const topEmployers = await this.prisma.employer.findMany({
      take: 5,
      include: { _count: { select: { jobs: true } } },
      orderBy: { jobs: { _count: 'desc' } },
    })

    const result = {
      totalUsers, newUsersThisMonth,
      totalEmployers,
      totalJobs, pendingJobs, publishedJobs,
      totalApplications, applicationsThisMonth,
      jobsChart, usersChart, applicationsChart,
      topEmployers,
    }

    await this.cache.set(cacheKey, result, 120000)
    return result
  }

  async invalidateStatsCache() {
    await this.cache.del('admin:stats')
  }

  private async getMonthlyChart(model: 'job' | 'user' | 'application', months: number) {
    const now = new Date()
    const ranges = Array.from({ length: months }, (_, i) => {
      const offset = months - 1 - i
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1)
      const label = start.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })
      return { start, end, label }
    })

    const counts = await Promise.all(
      ranges.map(({ start, end }) => {
        if (model === 'job')
          return this.prisma.job.count({ where: { createdAt: { gte: start, lt: end } } })
        if (model === 'application')
          return this.prisma.application.count({ where: { appliedAt: { gte: start, lt: end } } })
        return this.prisma.user.count({ where: { createdAt: { gte: start, lt: end } } })
      }),
    )

    return ranges.map(({ label }, i) => ({ label, count: counts[i] }))
  }

  // ── Jobs management ──────────────────────────────────────────────────────────

  async getJobs(params: {
    status?: string
    keyword?: string
    page?: number
    limit?: number
  }) {
    const { status, keyword, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (status) where.status = status
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { employer: { companyName: { contains: keyword, mode: 'insensitive' } } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.job.findMany({
        where,
        include: {
          employer: { select: { companyName: true, logoUrl: true, slug: true } },
          _count: { select: { applications: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.job.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async approveJob(jobId: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } })
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại')

    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'PUBLISHED' as any, publishedAt: new Date() },
    })
  }

  async rejectJob(jobId: string, reason?: string) {
    const job = await this.prisma.job.findUnique({ where: { id: jobId } })
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại')

    return this.prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'REJECTED' as any,
        ...(reason && { requirements: job.requirements ? `${job.requirements}\n\n[Lý do từ chối: ${reason}]` : `[Lý do từ chối: ${reason}]` }),
      },
    })
  }

  async closeJob(jobId: string) {
    return this.prisma.job.update({
      where: { id: jobId },
      data: { status: 'CLOSED' as any },
    })
  }

  async deleteJob(jobId: string) {
    return this.prisma.job.delete({ where: { id: jobId } })
  }

  // ── Users management ─────────────────────────────────────────────────────────

  async getUsers(params: {
    role?: string
    keyword?: string
    isActive?: boolean
    page?: number
    limit?: number
  }) {
    const { role, keyword, isActive, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (role) where.role = role
    if (isActive !== undefined) where.isActive = isActive
    if (keyword) {
      where.OR = [
        { email: { contains: keyword, mode: 'insensitive' } },
        { profile: { fullName: { contains: keyword, mode: 'insensitive' } } },
        { employer: { companyName: { contains: keyword, mode: 'insensitive' } } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          role: true,
          isActive: true,
          emailVerified: true,
          createdAt: true,
          profile: { select: { fullName: true, avatarUrl: true, city: true } },
          employer: { select: { companyName: true, logoUrl: true, verified: true } },
          _count: { select: { applications: true, resumes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('Người dùng không tồn tại')

    return this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    })
  }

  async deleteUser(userId: string) {
    return this.prisma.user.delete({ where: { id: userId } })
  }

  async resetUserPassword(userId: string, newPassword: string) {
    if (!newPassword || newPassword.length < 6)
      throw new BadRequestException('Mật khẩu phải có ít nhất 6 ký tự')

    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new NotFoundException('Người dùng không tồn tại')
    if (user.role === 'ADMIN') throw new BadRequestException('Không thể đổi mật khẩu tài khoản Admin')

    const hash = await bcrypt.hash(newPassword, 10)
    await this.prisma.user.update({ where: { id: userId }, data: { password: hash } })
    return { message: 'Đổi mật khẩu thành công' }
  }

  // ── Employers management ─────────────────────────────────────────────────────

  async getEmployers(params: { keyword?: string; verified?: boolean; page?: number; limit?: number }) {
    const { keyword, verified, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (verified !== undefined) where.verified = verified
    if (keyword) {
      where.OR = [
        { companyName: { contains: keyword, mode: 'insensitive' } },
        { user: { email: { contains: keyword, mode: 'insensitive' } } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.employer.findMany({
        where,
        include: {
          user: { select: { email: true, isActive: true, createdAt: true } },
          _count: { select: { jobs: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.employer.count({ where }),
    ])

    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async verifyEmployer(employerId: string, verified: boolean) {
    const employer = await this.prisma.employer.findUnique({ where: { id: employerId } })
    if (!employer) throw new NotFoundException('Nhà tuyển dụng không tồn tại')

    return this.prisma.employer.update({
      where: { id: employerId },
      data: { verified },
    })
  }

  // ── Revenue / Subscriptions ───────────────────────────────────────────────────

  async getRevenueStats(params: { page?: number; limit?: number; plan?: string; keyword?: string }) {
    const { page = 1, limit = 20, plan, keyword } = params
    const skip = (page - 1) * limit

    // Plan prices (employer)
    const PRICES: Record<string, number> = { FREE: 0, PRO: 500000, PREMIUM: 1200000 }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const where: any = { role: 'EMPLOYER' }
    if (plan) where.plan = plan
    if (keyword) {
      where.OR = [
        { email: { contains: keyword, mode: 'insensitive' } },
        { employer: { companyName: { contains: keyword, mode: 'insensitive' } } },
      ]
    }

    const [subscribers, totalEmployers, proCount, premiumCount, proThisMonth, premiumThisMonth] =
      await Promise.all([
        this.prisma.user.findMany({
          where,
          select: {
            id: true,
            email: true,
            plan: true,
            planExpiresAt: true,
            createdAt: true,
            employer: { select: { companyName: true, logoUrl: true, slug: true, verified: true } },
          },
          orderBy: [{ plan: 'desc' }, { planExpiresAt: 'desc' }],
          skip,
          take: limit,
        }),
        this.prisma.user.count({ where: { role: 'EMPLOYER' } }),
        this.prisma.user.count({ where: { role: 'EMPLOYER', plan: 'PRO' } }),
        this.prisma.user.count({ where: { role: 'EMPLOYER', plan: 'PREMIUM' } }),
        this.prisma.user.count({ where: { role: 'EMPLOYER', plan: 'PRO', planExpiresAt: { gte: now } } }),
        this.prisma.user.count({ where: { role: 'EMPLOYER', plan: 'PREMIUM', planExpiresAt: { gte: now } } }),
      ])

    const total = await this.prisma.user.count({ where })

    // Estimated MRR
    const mrr = proThisMonth * PRICES.PRO + premiumThisMonth * PRICES.PREMIUM

    // 6-month revenue chart (approximate from active plans)
    const revenueChart = await this.getRevenueChart(6)

    return {
      summary: {
        totalEmployers,
        proCount,
        premiumCount,
        freeCount: totalEmployers - proCount - premiumCount,
        mrr,
        activeSubscriptions: proThisMonth + premiumThisMonth,
      },
      revenueChart,
      data: subscribers,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async updateUserPlan(userId: string, plan: string, months: number) {
    const validPlans = ['FREE', 'PRO', 'PREMIUM']
    if (!validPlans.includes(plan)) throw new BadRequestException('Gói không hợp lệ')

    const expiresAt =
      plan === 'FREE'
        ? null
        : new Date(Date.now() + months * 30 * 24 * 60 * 60 * 1000)

    return this.prisma.user.update({
      where: { id: userId },
      data: { plan: plan as any, planExpiresAt: expiresAt },
      select: { id: true, email: true, plan: true, planExpiresAt: true },
    })
  }

  // ── System Settings ──────────────────────────────────────────────────────────

  async getSettings(): Promise<Record<string, string>> {
    const rows = await this.prisma.systemSetting.findMany()
    return Object.fromEntries(rows.map(r => [r.key, r.value]))
  }

  async updateSettings(data: Record<string, string>) {
    await Promise.all(
      Object.entries(data).map(([key, value]) =>
        this.prisma.systemSetting.upsert({
          where: { key },
          create: { key, value },
          update: { value },
        }),
      ),
    )
    return this.getSettings()
  }

  // ── Page content ─────────────────────────────────────────────────────────────

  private static readonly PAGE_SLUGS = [
    'about', 'contact', 'faq', 'pricing', 'careers',
    'press', 'privacy', 'terms', 'cv-review',
  ]

  async getPages() {
    const rows = await this.prisma.systemSetting.findMany({
      where: { key: { startsWith: 'page:' } },
    })
    const map = Object.fromEntries(rows.map(r => [r.key.replace('page:', ''), r]))
    return AdminService.PAGE_SLUGS.map(slug => ({
      slug,
      updatedAt: map[slug]?.updatedAt ?? null,
      hasContent: !!map[slug],
    }))
  }

  async getPageContent(slug: string) {
    const row = await this.prisma.systemSetting.findUnique({
      where: { key: `page:${slug}` },
    })
    if (!row) return null
    try { return JSON.parse(row.value) } catch { return null }
  }

  async updatePageContent(slug: string, data: Record<string, any>) {
    await this.prisma.systemSetting.upsert({
      where: { key: `page:${slug}` },
      create: { key: `page:${slug}`, value: JSON.stringify(data) },
      update: { value: JSON.stringify(data) },
    })
    return this.getPageContent(slug)
  }

  // ── Skills management ─────────────────────────────────────────────────────────

  async getSkills(params: { keyword?: string; category?: string; page?: number; limit?: number }) {
    const { keyword, category, page = 1, limit = 50 } = params
    const skip = (page - 1) * limit

    const where: any = {}
    if (category) where.category = category
    if (keyword) where.name = { contains: keyword, mode: 'insensitive' }

    const [data, total] = await Promise.all([
      this.prisma.skill.findMany({
        where,
        include: { _count: { select: { jobSkills: true, candidateSkills: true } } },
        orderBy: [{ category: 'asc' }, { name: 'asc' }],
        skip,
        take: limit,
      }),
      this.prisma.skill.count({ where }),
    ])
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async createSkill(data: { name: string; category?: string }) {
    const slug = data.name
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
    return this.prisma.skill.create({ data: { ...data, slug } })
  }

  async updateSkill(id: string, data: { name?: string; category?: string; isActive?: boolean }) {
    const update: any = { ...data }
    if (data.name) {
      update.slug = data.name
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    }
    return this.prisma.skill.update({ where: { id }, data: update })
  }

  async deleteSkill(id: string) {
    return this.prisma.skill.delete({ where: { id } })
  }

  private async getRevenueChart(months: number) {
    const PRICES: Record<string, number> = { PRO: 500000, PREMIUM: 1200000 }
    const now = new Date()
    const ranges = Array.from({ length: months }, (_, i) => {
      const offset = months - 1 - i
      const start = new Date(now.getFullYear(), now.getMonth() - offset, 1)
      const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1)
      const label = start.toLocaleDateString('vi-VN', { month: 'short', year: '2-digit' })
      return { start, end, label }
    })

    const counts = await Promise.all(
      ranges.map(({ start, end }) =>
        Promise.all([
          this.prisma.user.count({
            where: { role: 'EMPLOYER', plan: 'PRO', planExpiresAt: { gte: start, lt: end } },
          }),
          this.prisma.user.count({
            where: { role: 'EMPLOYER', plan: 'PREMIUM', planExpiresAt: { gte: start, lt: end } },
          }),
        ]),
      ),
    )

    return ranges.map(({ label }, i) => ({
      label,
      pro: counts[i][0],
      premium: counts[i][1],
      revenue: counts[i][0] * PRICES.PRO + counts[i][1] * PRICES.PREMIUM,
    }))
  }
}
