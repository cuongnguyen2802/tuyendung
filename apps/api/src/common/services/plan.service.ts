import { Injectable, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { PLAN_LIMITS, EMPLOYER_PLAN_LIMITS } from '@tuyendung/types'

@Injectable()
export class PlanService {
  constructor(private prisma: PrismaService) {}

  async getUserPlan(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    })
    if (!user) return 'FREE' as const

    // Revert to FREE if plan has expired
    if (user.plan !== 'FREE' && user.planExpiresAt && user.planExpiresAt < new Date()) {
      await this.prisma.user.update({ where: { id: userId }, data: { plan: 'FREE', planExpiresAt: null } })
      return 'FREE' as const
    }
    return user.plan as keyof typeof PLAN_LIMITS
  }

  async checkApplicationQuota(userId: string) {
    const plan = await this.getUserPlan(userId)
    const limit = PLAN_LIMITS[plan].maxApplyPerMonth
    if (!isFinite(limit)) return

    const since = new Date()
    since.setDate(1)
    since.setHours(0, 0, 0, 0)

    const count = await this.prisma.application.count({
      where: { userId, appliedAt: { gte: since } },
    })

    if (count >= limit) {
      throw new ForbiddenException(
        `Tài khoản Free chỉ được ứng tuyển tối đa ${limit} tin/tháng. Nâng cấp để ứng tuyển không giới hạn.`,
      )
    }
  }

  async checkResumeQuota(userId: string) {
    const plan = await this.getUserPlan(userId)
    const limit = PLAN_LIMITS[plan].maxResumes
    if (!isFinite(limit)) return

    const count = await this.prisma.resume.count({ where: { userId } })

    if (count >= limit) {
      throw new ForbiddenException(
        `Tài khoản ${plan} chỉ được tạo tối đa ${limit} CV. Nâng cấp để tạo không giới hạn.`,
      )
    }
  }

  async checkJobQuota(userId: string) {
    const plan = await this.getUserPlan(userId)
    const limit = EMPLOYER_PLAN_LIMITS[plan].maxActiveJobs
    if (!isFinite(limit)) return

    const employer = await this.prisma.employer.findUnique({ where: { userId }, select: { id: true } })
    if (!employer) return

    const count = await this.prisma.job.count({
      where: { employerId: employer.id, status: { in: ['PUBLISHED', 'PENDING_APPROVAL'] } },
    })

    if (count >= limit) {
      throw new ForbiddenException(
        `Gói ${plan} chỉ được đăng tối đa ${limit} tin tuyển dụng đang hoạt động. Nâng cấp để đăng thêm.`,
      )
    }
  }

  async getEmployerPlanInfo(userId: string) {
    const plan = await this.getUserPlan(userId)
    return EMPLOYER_PLAN_LIMITS[plan]
  }

  async getUserPlanDetails(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { plan: true, planExpiresAt: true },
    })
    const plan = await this.getUserPlan(userId)
    return { plan, planExpiresAt: user?.planExpiresAt ?? null }
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
}
