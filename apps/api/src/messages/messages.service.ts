import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

const USER_SELECT = {
  id: true, email: true,
  profile: { select: { fullName: true, avatarUrl: true, phone: true, city: true } },
  employer: { select: { companyName: true, logoUrl: true, verified: true, slug: true } },
} as const

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    const messages = await this.prisma.message.findMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
      include: {
        sender:   { select: USER_SELECT },
        receiver: { select: USER_SELECT },
      },
      orderBy: { createdAt: 'desc' },
    })

    const map = new Map<string, { user: any; lastMessage: any; unreadCount: number }>()
    for (const msg of messages) {
      const otherId   = msg.senderId === userId ? msg.receiverId : msg.senderId
      const otherUser = msg.senderId === userId ? msg.receiver   : msg.sender
      if (!map.has(otherId)) {
        map.set(otherId, { user: otherUser, lastMessage: msg, unreadCount: 0 })
      }
      if (msg.receiverId === userId && !msg.isRead) {
        map.get(otherId)!.unreadCount++
      }
    }

    return Array.from(map.values())
  }

  async getThread(userId: string, partnerId: string, page = 1, limit = 30) {
    const skip = (page - 1) * limit
    const where = {
      OR: [
        { senderId: userId,    receiverId: partnerId },
        { senderId: partnerId, receiverId: userId },
      ],
    }

    const [data, total] = await Promise.all([
      this.prisma.message.findMany({
        where,
        include: { sender: { select: USER_SELECT } },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.message.count({ where }),
    ])

    await this.prisma.message.updateMany({
      where: { senderId: partnerId, receiverId: userId, isRead: false },
      data: { isRead: true },
    })

    return {
      data: data.reverse(),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    }
  }

  async getPartnerContext(currentUserId: string, partnerId: string) {
    const [currentUser, partner] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: currentUserId }, select: { role: true } }),
      this.prisma.user.findUnique({ where: { id: partnerId }, include: { profile: true, employer: true } }),
    ])
    if (!partner) throw new NotFoundException('Người dùng không tồn tại')

    let applications: any[] = []
    let recentApplicants: any[] = []

    if (currentUser?.role === 'EMPLOYER') {
      // Applications that partner (candidate) sent to currentUser's jobs
      applications = await this.prisma.application.findMany({
        where: { userId: partnerId, job: { employer: { userId: currentUserId } } },
        include: { job: { select: { id: true, title: true, slug: true } } },
        orderBy: { appliedAt: 'desc' },
        take: 5,
      })

      // Other recent applicants (last 7 days) to currentUser's jobs
      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      const myJobIds = (await this.prisma.job.findMany({
        where: { employer: { userId: currentUserId } },
        select: { id: true },
      })).map(j => j.id)

      if (myJobIds.length > 0) {
        recentApplicants = await this.prisma.application.findMany({
          where: { jobId: { in: myJobIds }, appliedAt: { gte: since }, userId: { not: partnerId } },
          include: {
            user: { select: { id: true, profile: { select: { fullName: true, avatarUrl: true } } } },
            job:  { select: { title: true } },
          },
          orderBy: { appliedAt: 'desc' },
          take: 5,
        })
      }
    } else {
      // Applications that currentUser (candidate) sent to partner's employer jobs
      applications = await this.prisma.application.findMany({
        where: { userId: currentUserId, job: { employer: { userId: partnerId } } },
        include: { job: { select: { id: true, title: true, slug: true } } },
        orderBy: { appliedAt: 'desc' },
        take: 5,
      })
    }

    return {
      partner: {
        id: partner.id,
        email: partner.email,
        role: partner.role,
        profile: partner.profile,
        employer: partner.employer,
      },
      applications,
      recentApplicants,
    }
  }

  async send(senderId: string, receiverId: string, content: string, applicationId?: string) {
    if (!content.trim()) throw new ForbiddenException('Tin nhắn không được trống')

    const receiver = await this.prisma.user.findUnique({ where: { id: receiverId } })
    if (!receiver) throw new NotFoundException('Người nhận không tồn tại')

    if (applicationId) {
      const app = await this.prisma.application.findFirst({
        where: {
          id: applicationId,
          OR: [{ userId: senderId }, { job: { employer: { userId: senderId } } }],
        },
      })
      if (!app) throw new ForbiddenException('Không có quyền gửi tin nhắn trong đơn này')
    }

    return this.prisma.message.create({
      data: { senderId, receiverId, content, applicationId },
      include: { sender: { select: USER_SELECT } },
    })
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.message.count({
      where: { receiverId: userId, isRead: false },
    })
    return { count }
  }
}
