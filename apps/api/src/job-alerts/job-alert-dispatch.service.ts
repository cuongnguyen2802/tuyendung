import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { EmailService } from '../email/email.service'
import { NotificationsService } from '../notifications/notifications.service'
import { NotificationType } from '@tuyendung/types'

const DAILY_INTERVAL  = 24 * 60 * 60 * 1000   // 1 day
const WEEKLY_INTERVAL =  7 * 24 * 60 * 60 * 1000

@Injectable()
export class JobAlertDispatchService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(JobAlertDispatchService.name)
  private timer: NodeJS.Timeout | null = null

  constructor(
    private prisma: PrismaService,
    private email: EmailService,
    private notifications: NotificationsService,
  ) {}

  onModuleInit() {
    // Run 5 minutes after startup, then every hour
    this.timer = setTimeout(() => {
      void this.dispatch()
      this.timer = setInterval(() => void this.dispatch(), 60 * 60 * 1000)
    }, 5 * 60 * 1000)
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer)
  }

  async dispatch() {
    this.logger.log('Running job alert dispatch...')
    try {
      const alerts = await this.prisma.jobAlert.findMany({
        where: { isActive: true },
        include: { user: true },
      })

      for (const alert of alerts) {
        const interval = alert.frequency === 'WEEKLY' ? WEEKLY_INTERVAL : DAILY_INTERVAL
        const since    = alert.lastSentAt
          ? new Date(alert.lastSentAt.getTime())
          : new Date(Date.now() - interval)

        // Skip if not enough time has elapsed
        if (alert.lastSentAt && Date.now() - alert.lastSentAt.getTime() < interval) continue

        const where: Record<string, unknown> = {
          status:    'PUBLISHED',
          createdAt: { gte: since },
        }
        if (alert.keyword) where.title  = { contains: alert.keyword, mode: 'insensitive' }
        if (alert.city)    where.city   = { contains: alert.city,    mode: 'insensitive' }
        if (alert.jobType) where.jobType = alert.jobType
        if (alert.salaryMin) where.salaryMax = { gte: alert.salaryMin }

        const jobs = await this.prisma.job.findMany({
          where: where as never,
          take: 10,
          orderBy: { createdAt: 'desc' },
          include: { employer: true },
        })

        if (jobs.length === 0) continue

        const jobList = jobs
          .map(j => `• ${j.title} — ${j.employer.companyName} (${j.city})`)
          .join('\n')

        // In-app notification
        await this.notifications.create(
          alert.userId,
          NotificationType.JOB_ALERT,
          `${jobs.length} việc làm mới phù hợp với bạn`,
          jobList.split('\n')[0] + (jobs.length > 1 ? ` và ${jobs.length - 1} tin khác` : ''),
          '/jobs?keyword=' + encodeURIComponent(alert.keyword ?? ''),
        ).catch(() => {})

        // Email notification
        if (alert.user?.email) {
          await this.email.sendJobAlertEmail(
            alert.user.email,
            (alert.user as any).profile?.fullName ?? alert.user.email,
            jobs.length,
            jobs.slice(0, 5).map(j => ({
              title: j.title,
              company: j.employer.companyName,
              city: j.city,
              slug: j.slug,
            })),
          ).catch(() => {})
        }

        await this.prisma.jobAlert.update({
          where: { id: alert.id },
          data:  { lastSentAt: new Date() },
        })
      }

      this.logger.log(`Dispatched alerts for ${alerts.length} active alerts`)
    } catch (err) {
      this.logger.error('Job alert dispatch failed', err)
    }
  }
}
