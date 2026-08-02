import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

interface SearchCandidatesDto {
  keyword?: string
  city?: string
  skillIds?: string[]
  openToWork?: boolean
  expectedSalaryMax?: number
  page?: number
  limit?: number
}

@Injectable()
export class CandidatesService {
  constructor(private prisma: PrismaService) {}

  async searchCandidates(employerUserId: string, dto: SearchCandidatesDto) {
    const employer = await this.prisma.employer.findUnique({ where: { userId: employerUserId } })
    if (!employer) throw new ForbiddenException('Chỉ nhà tuyển dụng mới có thể tìm ứng viên')

    const page = dto.page ?? 1
    const limit = Math.min(dto.limit ?? 20, 50)
    const skip = (page - 1) * limit

    // Điều kiện bắt buộc trên CandidateProfile (không liên quan keyword)
    const profileWhere: any = { isNot: null }
    if (dto.openToWork !== undefined) profileWhere.openToWork = dto.openToWork
    if (dto.city) profileWhere.city = { contains: dto.city, mode: 'insensitive' }
    if (dto.expectedSalaryMax) profileWhere.expectedSalaryMin = { lte: dto.expectedSalaryMax }
    if (dto.skillIds?.length) {
      profileWhere.skills = { some: { skillId: { in: dto.skillIds } } }
    }

    const where: any = { profile: profileWhere }

    // Keyword tìm trong email (User) + fullName/title/summary (CandidateProfile)
    if (dto.keyword) {
      where.OR = [
        { email:    { contains: dto.keyword, mode: 'insensitive' } },
        { profile: { fullName: { contains: dto.keyword, mode: 'insensitive' } } },
        { profile: { title:    { contains: dto.keyword, mode: 'insensitive' } } },
        { profile: { summary:  { contains: dto.keyword, mode: 'insensitive' } } },
      ]
    }

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
              title: true,
              city: true,
              summary: true,
              openToWork: true,
              expectedSalaryMin: true,
              expectedSalaryMax: true,
              skills: { include: { skill: { select: { name: true, id: true } } } },
            },
          },
          resumes: {
            where: { isOnline: true },
            take: 1,
            select: { id: true, title: true },
          },
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getCandidatePublicProfile(userId: string, viewerId?: string) {
    const [profile] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          plan: true,
          profile: {
            select: {
              fullName: true,
              avatarUrl: true,
              title: true,
              city: true,
              summary: true,
              openToWork: true,
              linkedinUrl: true,
              githubUrl: true,
              portfolioUrl: true,
              expectedSalaryMin: true,
              expectedSalaryMax: true,
              skills: { include: { skill: true } },
              experiences: true,
              educations: true,
            },
          },
          resumes: {
            where: { isOnline: true },
            select: { id: true, title: true },
          },
        },
      }),
      // Track profile view (deduplicate same viewer within 24h)
      viewerId && viewerId !== userId
        ? this.trackProfileView(userId, viewerId)
        : Promise.resolve(),
    ])
    return profile
  }

  private async trackProfileView(viewedId: string, viewerId: string) {
    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000)
    const recent = await this.prisma.profileView.findFirst({
      where: { viewedId, viewerId, createdAt: { gte: since24h } },
    })
    if (!recent) {
      await this.prisma.profileView.create({ data: { viewedId, viewerId } }).catch(() => {})
    }
  }
}
