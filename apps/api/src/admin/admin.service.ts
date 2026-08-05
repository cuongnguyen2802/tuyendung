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
          user: { select: { id: true, email: true, isActive: true, createdAt: true } },
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

  // ── System activity feed ─────────────────────────────────────────────────────

  async getSystemActivity(limit = 60) {
    const [recentUsers, recentJobs, recentApplications] = await Promise.all([
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true, email: true, role: true, createdAt: true,
          profile: { select: { fullName: true, avatarUrl: true } },
          employer: { select: { companyName: true, logoUrl: true, slug: true } },
        },
      }),
      this.prisma.job.findMany({
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true, title: true, slug: true, status: true, createdAt: true, publishedAt: true,
          employer: { select: { companyName: true, slug: true, logoUrl: true } },
        },
      }),
      this.prisma.application.findMany({
        orderBy: { appliedAt: 'desc' },
        take: limit,
        select: {
          id: true, status: true, appliedAt: true,
          job: { select: { title: true, slug: true, employer: { select: { companyName: true } } } },
          user: { select: { email: true, profile: { select: { fullName: true, avatarUrl: true } } } },
        },
      }),
    ])

    type ActivityEvent = {
      id: string
      type: 'new_candidate' | 'new_employer' | 'new_job' | 'job_approved' | 'new_application' | 'application_status'
      title: string
      description: string
      meta?: Record<string, string | null>
      timestamp: Date
    }

    const events: ActivityEvent[] = [
      ...recentUsers
        .filter(u => u.role !== 'ADMIN')
        .map(u => ({
          id: `user-${u.id}`,
          type: (u.role === 'CANDIDATE' ? 'new_candidate' : 'new_employer') as ActivityEvent['type'],
          title: u.role === 'CANDIDATE' ? 'Ứng viên mới đăng ký' : 'Nhà tuyển dụng mới đăng ký',
          description: u.role === 'CANDIDATE'
            ? (u.profile?.fullName ?? u.email)
            : (u.employer?.companyName ?? u.email),
          meta: u.role === 'EMPLOYER' && u.employer?.slug
            ? { logoUrl: u.employer.logoUrl ?? null, slug: u.employer.slug }
            : null as any,
          timestamp: u.createdAt,
        })),

      ...recentJobs.map(j => ({
        id: `job-${j.id}`,
        type: (j.status === 'PUBLISHED' ? 'job_approved' : 'new_job') as ActivityEvent['type'],
        title: j.status === 'PUBLISHED'
          ? 'Tin tuyển dụng đã đăng'
          : j.status === 'PENDING_APPROVAL'
            ? 'Tin tuyển dụng chờ duyệt'
            : j.status === 'REJECTED'
              ? 'Tin tuyển dụng bị từ chối'
              : 'Tin tuyển dụng cập nhật',
        description: `${j.title} — ${j.employer?.companyName ?? ''}`,
        meta: { slug: j.slug, logoUrl: j.employer?.logoUrl ?? null },
        timestamp: j.createdAt,
      })),

      ...recentApplications.map(a => ({
        id: `app-${a.id}`,
        type: 'new_application' as ActivityEvent['type'],
        title: 'Đơn ứng tuyển mới',
        description: `${a.user?.profile?.fullName ?? a.user?.email ?? '?'} → ${a.job?.title ?? '?'}`,
        meta: { status: a.status, avatarUrl: a.user?.profile?.avatarUrl ?? null },
        timestamp: a.appliedAt,
      })),
    ]

    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    return events.slice(0, limit)
  }

  // ── 4.3: Candidate analysis ──────────────────────────────────────────────────

  async getCandidateStats() {
    const [
      total,
      hasProfile,
      openToWork,
      withResume,
      withSkills,
      withEducation,
      withExperience,
      topSkills,
      degreeBreakdown,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'CANDIDATE' } }),
      this.prisma.candidateProfile.count(),
      this.prisma.candidateProfile.count({ where: { openToWork: true } }),
      this.prisma.user.count({ where: { role: 'CANDIDATE', resumes: { some: {} } } }),
      this.prisma.candidateProfile.count({ where: { skills: { some: {} } } }),
      this.prisma.candidateProfile.count({ where: { educations: { some: {} } } }),
      this.prisma.candidateProfile.count({ where: { experiences: { some: {} } } }),
      this.prisma.skill.findMany({
        where: { candidateSkills: { some: {} } },
        include: { _count: { select: { candidateSkills: true } } },
        orderBy: { candidateSkills: { _count: 'desc' } },
        take: 10,
      }),
      this.prisma.education.groupBy({
        by: ['degree'],
        _count: { _all: true },
        orderBy: { _count: { _all: 'desc' } },
      }),
    ])

    const noProfile = total - hasProfile
    const complete = await this.prisma.candidateProfile.count({
      where: {
        skills: { some: {} },
        educations: { some: {} },
        experiences: { some: {} },
        avatarUrl: { not: null },
        phone: { not: null },
      },
    })

    return {
      total,
      hasProfile,
      noProfile,
      openToWork,
      withResume,
      withSkills,
      withEducation,
      withExperience,
      completeProfiles: complete,
      topSkills: topSkills.map(s => ({
        name: s.name, count: s._count.candidateSkills,
      })),
      degreeBreakdown: degreeBreakdown.map(d => ({
        degree: d.degree ?? 'Không xác định', count: d._count._all,
      })),
    }
  }

  async getCandidateAnalysis(params: {
    keyword?: string
    degree?: string
    completeness?: string
    page?: number
    limit?: number
  }) {
    const { keyword, degree, completeness, page = 1, limit = 20 } = params
    const skip = (page - 1) * limit

    const where: any = { role: 'CANDIDATE', profile: {} }

    if (keyword) {
      where.OR = [
        { email: { contains: keyword, mode: 'insensitive' } },
        { profile: { fullName: { contains: keyword, mode: 'insensitive' } } },
      ]
    }

    if (completeness === 'complete') {
      where.profile = {
        skills: { some: {} },
        educations: { some: {} },
        experiences: { some: {} },
        avatarUrl: { not: null },
      }
    } else if (completeness === 'partial') {
      where.profile = { is: {} }
      // has profile but not fully complete — handled in JS
    } else if (completeness === 'none') {
      where.profile = { is: null }
    }

    if (degree) {
      where.profile = { ...where.profile, educations: { some: { degree } } }
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true, email: true, isActive: true, createdAt: true, emailVerified: true,
          profile: {
            select: {
              fullName: true, avatarUrl: true, city: true, title: true,
              phone: true, openToWork: true,
              skills: { select: { skill: { select: { name: true } } }, take: 5 },
              educations: { select: { degree: true, major: true, school: true }, orderBy: { startDate: 'desc' }, take: 1 },
              experiences: { select: { id: true }, take: 1 },
            },
          },
          resumes: { select: { id: true }, take: 1 },
          _count: { select: { applications: true, resumes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.user.count({ where }),
    ])

    // Compute completeness score for each candidate
    const enriched = data.map((u: any) => {
      const p = u.profile
      let score = 0
      if (p) {
        score += 20 // has profile
        if (p.avatarUrl) score += 10
        if (p.phone) score += 10
        if (p.city) score += 10
        if (p.title) score += 10
        if (p.skills?.length > 0) score += 15
        if (p.educations?.length > 0) score += 10
        if (p.experiences?.length > 0) score += 10
        if (u.resumes?.length > 0) score += 5
      }
      return { ...u, completenessScore: score }
    })

    return { data: enriched, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  // ── 4.4: Matching module ──────────────────────────────────────────────────────

  async getJobsForMatching() {
    return this.prisma.job.findMany({
      where: { status: 'PUBLISHED' as any },
      select: {
        id: true, title: true, slug: true,
        employer: { select: { companyName: true, logoUrl: true } },
        skills: { select: { skill: { select: { id: true, name: true } } } },
        _count: { select: { applications: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 100,
    })
  }

  async getMatchingCandidates(jobId: string, limit = 20) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      select: {
        id: true, title: true,
        skills: { select: { skill: { select: { id: true, name: true } } } },
      },
    })
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại')

    const requiredSkillIds = job.skills.map((js: any) => js.skill.id)
    const requiredSkillNames = job.skills.map((js: any) => js.skill.name)

    // If no skills required, return candidates by applications count
    if (requiredSkillIds.length === 0) {
      const candidates = await this.prisma.candidateProfile.findMany({
        take: limit,
        select: {
          fullName: true, avatarUrl: true, city: true, title: true,
          user: {
            select: {
              id: true, email: true,
              _count: { select: { applications: true } },
            },
          },
          skills: { select: { skill: { select: { id: true, name: true } } }, take: 5 },
        },
      })
      return {
        job: { id: job.id, title: job.title, requiredSkills: requiredSkillNames },
        candidates: candidates.map((c: any) => ({
          ...c,
          matchScore: 0,
          matchedSkills: [],
        })),
      }
    }

    // Find candidates with at least 1 matching skill
    const candidatesWithSkills = await this.prisma.candidateProfile.findMany({
      where: { skills: { some: { skillId: { in: requiredSkillIds } } } },
      select: {
        fullName: true, avatarUrl: true, city: true, title: true, openToWork: true,
        user: {
          select: {
            id: true, email: true, isActive: true,
            _count: { select: { applications: true } },
          },
        },
        skills: { select: { skill: { select: { id: true, name: true } } } },
      },
      take: limit * 3, // fetch more, rank in JS
    })

    // Rank by match score
    const ranked = candidatesWithSkills
      .map((c: any) => {
        const candidateSkillIds = c.skills.map((cs: any) => cs.skill.id)
        const matched = requiredSkillIds.filter((id: string) => candidateSkillIds.includes(id))
        const matchScore = Math.round((matched.length / requiredSkillIds.length) * 100)
        const matchedSkillNames = job.skills
          .filter((js: any) => matched.includes(js.skill.id))
          .map((js: any) => js.skill.name)
        return { ...c, matchScore, matchedSkills: matchedSkillNames }
      })
      .sort((a: any, b: any) => b.matchScore - a.matchScore)
      .slice(0, limit)

    return {
      job: { id: job.id, title: job.title, requiredSkills: requiredSkillNames },
      candidates: ranked,
    }
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
