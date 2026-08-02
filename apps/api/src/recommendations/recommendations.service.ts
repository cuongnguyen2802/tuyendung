import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async getJobRecommendations(userId: string, limit = 10) {
    // Get candidate's skills from their profile
    const candidateSkills = await this.prisma.candidateSkill.findMany({
      where: { profile: { userId } },
      select: { skillId: true },
    })

    const skillIds = candidateSkills.map(s => s.skillId)

    // Get candidate profile for location preference
    const profile = await this.prisma.candidateProfile.findUnique({ where: { userId } })

    // Jobs already applied to
    const applied = await this.prisma.application.findMany({
      where: { userId },
      select: { jobId: true },
    })
    const excludeJobIds = applied.map(a => a.jobId)

    if (skillIds.length === 0) {
      // No skills — return latest jobs not yet applied
      return this.prisma.job.findMany({
        where: {
          status: 'PUBLISHED' as any,
          id: { notIn: excludeJobIds.length > 0 ? excludeJobIds : undefined },
        },
        include: {
          employer: { select: { companyName: true, logoUrl: true, slug: true } },
          skills: { include: { skill: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
      })
    }

    const jobs = await this.prisma.job.findMany({
      where: {
        status: 'PUBLISHED' as any,
        id: { notIn: excludeJobIds.length > 0 ? excludeJobIds : undefined },
        OR: [
          { skills: { some: { skillId: { in: skillIds } } } },
          ...(profile?.city ? [{ city: { contains: profile.city, mode: 'insensitive' as const } }] : []),
        ],
      },
      include: {
        employer: { select: { companyName: true, logoUrl: true, slug: true } },
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit * 2,
    })

    // Sort by skill match count
    const skillSet = new Set(skillIds)
    const scored = jobs.map(job => ({
      ...job,
      matchScore: job.skills.filter(js => skillSet.has(js.skillId)).length,
    }))
    scored.sort((a, b) => b.matchScore - a.matchScore)

    return scored.slice(0, limit)
  }

  async getSimilarJobs(jobId: string, limit = 6) {
    const job = await this.prisma.job.findUnique({
      where: { id: jobId },
      include: { skills: true },
    })
    if (!job) return []

    const skillIds = job.skills.map(js => js.skillId)

    return this.prisma.job.findMany({
      where: {
        status: 'PUBLISHED' as any,
        id: { not: jobId },
        ...(skillIds.length > 0 && {
          OR: [
            { skills: { some: { skillId: { in: skillIds } } } },
            { city: job.city },
          ],
        }),
      },
      include: {
        employer: { select: { companyName: true, logoUrl: true, slug: true } },
        skills: { include: { skill: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })
  }
}
