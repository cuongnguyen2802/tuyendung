import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { PlanService } from '../common/services/plan.service'

@Injectable()
export class ResumesService {
  constructor(
    private prisma: PrismaService,
    private plan: PlanService,
  ) {}

  async getMyResumes(userId: string) {
    return this.prisma.resume.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  async create(userId: string, data: { title: string; content?: any; isOnline?: boolean }) {
    await this.plan.checkResumeQuota(userId)
    return this.prisma.resume.create({
      data: {
        userId,
        title: data.title,
        content: data.content,
        isOnline: data.isOnline ?? false,
      },
    })
  }

  async update(userId: string, resumeId: string, data: { title?: string; content?: any; isOnline?: boolean; fileUrl?: string }) {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } })
    if (!resume) throw new NotFoundException('CV không tồn tại')
    if (resume.userId !== userId) throw new ForbiddenException('Không có quyền')

    return this.prisma.resume.update({
      where: { id: resumeId },
      data,
    })
  }

  async delete(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } })
    if (!resume) throw new NotFoundException('CV không tồn tại')
    if (resume.userId !== userId) throw new ForbiddenException('Không có quyền')

    return this.prisma.resume.delete({ where: { id: resumeId } })
  }

  async setDefault(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } })
    if (!resume) throw new NotFoundException('CV không tồn tại')
    if (resume.userId !== userId) throw new ForbiddenException('Không có quyền')

    // Bỏ mặc định tất cả CV của user, sau đó set cái này là mặc định
    await this.prisma.resume.updateMany({ where: { userId }, data: { isDefault: false } })
    return this.prisma.resume.update({ where: { id: resumeId }, data: { isDefault: true } })
  }

  async getOne(userId: string, resumeId: string) {
    const resume = await this.prisma.resume.findUnique({ where: { id: resumeId } })
    if (!resume) throw new NotFoundException('CV không tồn tại')
    if (resume.userId !== userId) throw new ForbiddenException('Không có quyền')
    return resume
  }
}
