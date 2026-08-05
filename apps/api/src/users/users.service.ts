import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { buildSkipTake, buildPaginationMeta } from '../common/utils/pagination'
import { UpdateProfileDto, AddExperienceDto, AddEducationDto, UpsertSkillsDto } from './dto/update-profile.dto'

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async getProfile(userId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({
      where: { userId },
      include: {
        skills: { include: { skill: true } },
        experiences: { orderBy: { startDate: 'desc' } },
        educations: { orderBy: { startDate: 'desc' } },
      },
    })
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại')
    return profile
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.prisma.candidateProfile.update({
      where: { userId },
      data: { ...dto, gender: dto.gender as never },
    })
  }

  async addExperience(userId: string, dto: AddExperienceDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại')

    return this.prisma.workExperience.create({
      data: { ...dto, profileId: profile.id },
    })
  }

  async updateExperience(userId: string, experienceId: string, dto: AddExperienceDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại')

    return this.prisma.workExperience.updateMany({
      where: { id: experienceId, profileId: profile.id },
      data: dto,
    })
  }

  async deleteExperience(userId: string, experienceId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại')

    return this.prisma.workExperience.deleteMany({
      where: { id: experienceId, profileId: profile.id },
    })
  }

  async addEducation(userId: string, dto: AddEducationDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại')

    return this.prisma.education.create({
      data: { ...dto, profileId: profile.id },
    })
  }

  async updateEducation(userId: string, educationId: string, dto: AddEducationDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại')

    return this.prisma.education.updateMany({
      where: { id: educationId, profileId: profile.id },
      data: dto,
    })
  }

  async deleteEducation(userId: string, educationId: string) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại')

    return this.prisma.education.deleteMany({
      where: { id: educationId, profileId: profile.id },
    })
  }

  async upsertSkills(userId: string, dto: UpsertSkillsDto) {
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } })
    if (!profile) throw new NotFoundException('Hồ sơ không tồn tại')

    await this.prisma.candidateSkill.deleteMany({ where: { profileId: profile.id } })
    await this.prisma.candidateSkill.createMany({
      data: dto.skills.map((s) => ({
        profileId: profile.id,
        skillId: s.skillId,
        level: s.level as never,
      })),
    })
    return this.getProfile(userId)
  }

  async getResumes(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async deleteResume(userId: string, resumeId: string) {
    return this.prisma.resume.deleteMany({ where: { id: resumeId, userId } })
  }

  async getSavedJobs(userId: string, page = 1, limit = 20) {
    const [items, total] = await Promise.all([
      this.prisma.savedJob.findMany({
        where: { userId },
        include: {
          job: {
            include: { employer: true, skills: { include: { skill: true } } },
          },
        },
        orderBy: { savedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.savedJob.count({ where: { userId } }),
    ])
    return { data: items.map((s) => s.job), meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
  }

  async getSidebarStats(userId: string) {
    const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)

    const [activeApplications, newApplicationResponses, newProfileViews] = await Promise.all([
      this.prisma.application.count({
        where: { userId, status: { in: ['REVIEWING', 'INTERVIEW', 'OFFER'] as never[] } },
      }),
      this.prisma.application.count({
        where: {
          userId,
          status: { in: ['REVIEWING', 'INTERVIEW', 'OFFER'] as never[] },
          updatedAt: { gte: since7d },
        },
      }),
      this.prisma.profileView.count({
        where: { viewedId: userId, createdAt: { gte: since7d } },
      }),
    ])

    return {
      newConnections: 0,
      newProfileViews,
      activeApplications,
      newApplicationResponses,
    }
  }

  async getProfileViews(userId: string, page = 1, limit = 20) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true },
    })
    const canSeeViewers = user?.plan === 'PRO' || user?.plan === 'PREMIUM'

    const [items, total] = await Promise.all([
      this.prisma.profileView.findMany({
        where: { viewedId: userId },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: canSeeViewers
          ? {
              viewer: {
                select: {
                  employer: {
                    select: { companyName: true, logoUrl: true, slug: true },
                  },
                },
              },
            }
          : undefined,
      }),
      this.prisma.profileView.count({ where: { viewedId: userId } }),
    ])

    return {
      canSeeViewers,
      data: items.map((v) => ({
        id: v.id,
        createdAt: v.createdAt,
        viewer: canSeeViewers && (v as any).viewer?.employer
          ? (v as any).viewer.employer
          : null,
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getPlanInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    })
    return user
  }

  async upgradePlan(userId: string, plan: 'PRO' | 'PREMIUM', months = 1) {
    const expiresAt = new Date()
    expiresAt.setMonth(expiresAt.getMonth() + months)
    return this.prisma.user.update({
      where: { id: userId },
      data: { plan, planExpiresAt: expiresAt },
      select: { id: true, plan: true, planExpiresAt: true },
    })
  }

  // ─── Follow companies ────────────────────────────────────────────────────────

  async toggleFollowCompany(userId: string, employerId: string) {
    const existing = await this.prisma.followedCompany.findUnique({
      where: { userId_employerId: { userId, employerId } },
    })

    if (existing) {
      await this.prisma.followedCompany.delete({
        where: { userId_employerId: { userId, employerId } },
      })
      return { following: false }
    }

    await this.prisma.followedCompany.create({ data: { userId, employerId } })
    return { following: true }
  }

  async getFollowedCompanies(userId: string, page = 1, limit = 20) {
    const { skip, take } = buildSkipTake(page, limit)
    const [items, total] = await Promise.all([
      this.prisma.followedCompany.findMany({
        where: { userId },
        include: {
          employer: {
            select: {
              id: true, companyName: true, slug: true, logoUrl: true,
              city: true, industry: true, verified: true,
              _count: { select: { jobs: { where: { status: 'PUBLISHED' } } } },
            },
          },
        },
        orderBy: { followedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.followedCompany.count({ where: { userId } }),
    ])

    return {
      data: items.map((f) => ({
        followedAt: f.followedAt,
        employer: {
          ...f.employer,
          activeJobCount: (f.employer as any)._count?.jobs ?? 0,
        },
      })),
      meta: buildPaginationMeta(total, page, limit),
    }
  }

  async getNotificationPreferences(userId: string) {
    const existing = await this.prisma.notificationPreference.findUnique({ where: { userId } })
    if (existing) return existing
    return this.prisma.notificationPreference.create({ data: { userId } })
  }

  async updateNotificationPreferences(userId: string, data: {
    emailApply?: boolean; emailJobAlert?: boolean; emailNews?: boolean
    inAppApply?: boolean; inAppJobAlert?: boolean; inAppNews?: boolean
  }) {
    return this.prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...data },
      update: data,
    })
  }
}
