import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { IsString, IsOptional, IsInt, Min, IsEnum, IsBoolean } from 'class-validator'
import { JobType } from '@tuyendung/types'

export class CreateJobAlertDto {
  @IsOptional() @IsString() keyword?: string
  @IsOptional() @IsString() city?: string
  @IsOptional() @IsEnum(JobType) jobType?: JobType
  @IsOptional() @IsInt() @Min(0) salaryMin?: number
  @IsOptional() @IsEnum(['DAILY', 'WEEKLY']) frequency?: 'DAILY' | 'WEEKLY'
}

export class UpdateJobAlertDto {
  @IsOptional() @IsString() keyword?: string
  @IsOptional() @IsString() city?: string
  @IsOptional() @IsEnum(JobType) jobType?: JobType
  @IsOptional() @IsInt() @Min(0) salaryMin?: number
  @IsOptional() @IsEnum(['DAILY', 'WEEKLY']) frequency?: 'DAILY' | 'WEEKLY'
  @IsOptional() @IsBoolean() isActive?: boolean
}

@Injectable()
export class JobAlertsService {
  constructor(private prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.jobAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })
  }

  create(userId: string, dto: CreateJobAlertDto) {
    return this.prisma.jobAlert.create({
      data: { ...dto, userId },
    })
  }

  async update(userId: string, id: string, dto: UpdateJobAlertDto) {
    await this.findOwned(userId, id)
    return this.prisma.jobAlert.update({ where: { id }, data: dto })
  }

  async remove(userId: string, id: string) {
    await this.findOwned(userId, id)
    await this.prisma.jobAlert.delete({ where: { id } })
    return { message: 'Đã xóa cảnh báo việc làm' }
  }

  async toggle(userId: string, id: string) {
    const alert = await this.findOwned(userId, id)
    return this.prisma.jobAlert.update({
      where: { id },
      data: { isActive: !alert.isActive },
    })
  }

  private async findOwned(userId: string, id: string) {
    const alert = await this.prisma.jobAlert.findUnique({ where: { id } })
    if (!alert || alert.userId !== userId) throw new NotFoundException('Cảnh báo không tồn tại')
    return alert
  }
}
