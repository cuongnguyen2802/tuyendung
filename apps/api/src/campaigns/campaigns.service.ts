import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto'
import { buildSkipTake, buildPaginationMeta } from '../common/utils/pagination'

@Injectable()
export class CampaignsService {
  constructor(private prisma: PrismaService) {}

  private async getEmployer(userId: string) {
    const employer = await this.prisma.employer.findUnique({ where: { userId }, select: { id: true } })
    if (!employer) throw new ForbiddenException('Thông tin công ty không tồn tại')
    return employer
  }

  async create(userId: string, dto: CreateCampaignDto) {
    const employer = await this.getEmployer(userId)
    return this.prisma.campaign.create({
      data: {
        ...dto,
        employerId: employer.id,
        startDate: new Date(dto.startDate),
        endDate: new Date(dto.endDate),
      },
    })
  }

  async findAll(userId: string, page = 1, limit = 20, status?: string) {
    const employer = await this.getEmployer(userId)
    const { skip, take } = buildSkipTake(page, limit)
    const where = { employerId: employer.id, ...(status ? { status: status as any } : {}) }

    const [data, total] = await Promise.all([
      this.prisma.campaign.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.campaign.count({ where }),
    ])
    return { data, meta: buildPaginationMeta(total, page, limit) }
  }

  async findOne(userId: string, id: string) {
    const employer = await this.getEmployer(userId)
    const campaign = await this.prisma.campaign.findFirst({ where: { id, employerId: employer.id } })
    if (!campaign) throw new NotFoundException('Chiến dịch không tồn tại')
    return campaign
  }

  async update(userId: string, id: string, dto: UpdateCampaignDto) {
    const employer = await this.getEmployer(userId)
    const campaign = await this.prisma.campaign.findFirst({ where: { id, employerId: employer.id } })
    if (!campaign) throw new NotFoundException('Chiến dịch không tồn tại')
    return this.prisma.campaign.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.startDate ? { startDate: new Date(dto.startDate) } : {}),
        ...(dto.endDate ? { endDate: new Date(dto.endDate) } : {}),
      },
    })
  }

  async remove(userId: string, id: string) {
    const employer = await this.getEmployer(userId)
    const campaign = await this.prisma.campaign.findFirst({ where: { id, employerId: employer.id } })
    if (!campaign) throw new NotFoundException('Chiến dịch không tồn tại')
    await this.prisma.campaign.delete({ where: { id } })
    return { success: true }
  }
}
