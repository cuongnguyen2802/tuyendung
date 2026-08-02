import {
  Injectable, NotFoundException, ConflictException, ForbiddenException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { NotificationsService } from '../notifications/notifications.service'
import { EmailService } from '../email/email.service'
import { ActivityService } from '../activity/activity.service'
import { PlanService } from '../common/services/plan.service'
import { ApplyJobDto, UpdateApplicationStatusDto } from './dto/apply-job.dto'
import { buildSkipTake, buildPaginationMeta } from '../common/utils/pagination'
import { ApplicationStatus, NotificationType } from '@tuyendung/types'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xem xét',
  REVIEWING: 'Duyệt hồ sơ',
  INTERVIEW: 'Phỏng vấn',
  OFFER: 'Đề nghị công việc',
  REJECTED: 'Chưa phù hợp',
  WITHDRAWN: 'Đã rút',
}

@Injectable()
export class ApplicationsService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
    private email: EmailService,
    private activity: ActivityService,
    private plan: PlanService,
  ) {}

  async apply(userId: string, jobId: string, dto: ApplyJobDto) {
    await this.plan.checkApplicationQuota(userId)

    const job = await this.prisma.job.findUnique({
      where: { id: jobId, status: 'PUBLISHED' },
      include: { employer: true },
    })
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại hoặc đã đóng')

    const existing = await this.prisma.application.findUnique({
      where: { jobId_userId: { jobId, userId } },
    })
    if (existing) throw new ConflictException('Bạn đã ứng tuyển vị trí này rồi')

    const application = await this.prisma.application.create({
      data: { jobId, userId, ...dto },
      include: { job: { include: { employer: true } }, resume: true, user: true },
    })

    // Notify employer
    const employerUser = await this.prisma.user.findUnique({ where: { id: job.employer.userId } })
    if (employerUser) {
      this.notifications.create(
        employerUser.id,
        NotificationType.APPLICATION_RECEIVED,
        'Ứng viên mới',
        `Có ứng viên mới ứng tuyển vị trí "${job.title}"`,
        `/employer/jobs/${jobId}/applications`,
      ).catch(() => {})
    }

    // Confirm to candidate
    const candidate = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    })
    if (candidate) {
      this.notifications.create(
        userId,
        NotificationType.APPLICATION_RECEIVED,
        'Đã nhận đơn ứng tuyển',
        `Đơn ứng tuyển vị trí "${job.title}" tại ${job.employer.companyName} đã được ghi nhận`,
        `/applications`,
      ).catch(() => {})

      this.email.sendApplicationReceived(
        candidate.email,
        candidate.profile?.fullName ?? candidate.email,
        job.title,
        job.employer.companyName,
      ).catch(() => {})
    }

    return application
  }

  async withdraw(userId: string, applicationId: string) {
    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, userId },
    })
    if (!app) throw new NotFoundException('Đơn ứng tuyển không tồn tại')
    if (app.status !== ApplicationStatus.PENDING) {
      throw new ForbiddenException('Không thể rút đơn ở trạng thái này')
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status: ApplicationStatus.WITHDRAWN },
    })
  }

  async getMyApplications(userId: string, page = 1, limit = 20) {
    const { skip, take } = buildSkipTake(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where: { userId },
        include: {
          job: {
            include: {
              employer: { select: { companyName: true, logoUrl: true, slug: true } },
            },
          },
          resume: { select: { id: true, title: true } },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.application.count({ where: { userId } }),
    ])
    return { data, meta: buildPaginationMeta(total, page, limit) }
  }

  async getJobApplications(userId: string, jobId: string, page = 1, limit = 20, status?: ApplicationStatus) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } })
    if (!employer) throw new ForbiddenException('Không có quyền')

    const job = await this.prisma.job.findFirst({ where: { id: jobId, employerId: employer.id } })
    if (!job) throw new NotFoundException('Tin tuyển dụng không tồn tại')

    const where = { jobId, ...(status && { status }) }
    const { skip, take } = buildSkipTake(page, limit)

    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          user: {
            include: {
              profile: { select: { fullName: true, avatarUrl: true, title: true, city: true } },
            },
          },
          resume: true,
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.application.count({ where }),
    ])

    return { data, meta: buildPaginationMeta(total, page, limit) }
  }

  async getAllEmployerApplications(
    userId: string,
    page = 1,
    limit = 20,
    status?: ApplicationStatus,
    jobId?: string,
    keyword?: string,
  ) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } })
    if (!employer) throw new ForbiddenException('Không có quyền')

    const where: any = {
      job: { employerId: employer.id, ...(jobId && { id: jobId }) },
      ...(status && { status }),
      ...(keyword && {
        user: {
          profile: {
            fullName: { contains: keyword, mode: 'insensitive' },
          },
        },
      }),
    }

    const { skip, take } = buildSkipTake(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.application.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, slug: true } },
          user: {
            include: {
              profile: {
                select: { fullName: true, avatarUrl: true, title: true, city: true, phone: true },
              },
            },
          },
          resume: { select: { id: true, title: true, fileUrl: true } },
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.application.count({ where }),
    ])

    return { data, meta: buildPaginationMeta(total, page, limit) }
  }

  async updateStatus(userId: string, applicationId: string, dto: UpdateApplicationStatusDto) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } })
    if (!employer) throw new ForbiddenException('Không có quyền')

    const app = await this.prisma.application.findFirst({
      where: { id: applicationId, job: { employerId: employer.id } },
      include: { job: true, user: { include: { profile: true } } },
    })
    if (!app) throw new NotFoundException('Đơn ứng tuyển không tồn tại')

    const updated = await this.prisma.application.update({
      where: { id: applicationId },
      data: { status: dto.status as ApplicationStatus, notes: dto.notes },
    })

    // Notify candidate
    this.notifications.create(
      app.userId,
      NotificationType.APPLICATION_STATUS_CHANGED,
      'Cập nhật đơn ứng tuyển',
      `Đơn ứng tuyển vị trí "${app.job.title}" đã được cập nhật: ${dto.status}`,
      `/applications`,
    ).catch(() => {})

    const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL ?? 'http://localhost:3000'
    this.email.sendApplicationStatusChanged(
      app.user.email,
      app.user.profile?.fullName ?? app.user.email,
      app.job.title,
      dto.status,
      `${frontendUrl}/applications`,
    ).catch(() => {})

    const candidateName = app.user.profile?.fullName ?? app.user.email
    this.activity.record(
      employer.id,
      'APPLICATION_STATUS_CHANGED',
      `Thay đổi trạng thái ứng viên ${candidateName} thành ${STATUS_LABELS[dto.status] ?? dto.status}`,
      applicationId,
      candidateName,
      { oldStatus: app.status, newStatus: dto.status, jobTitle: app.job.title },
    )

    return updated
  }
}
