import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { IsString, IsOptional, MaxLength } from 'class-validator'

export class CreateCoverLetterDto {
  @IsString() @MaxLength(200) title: string
  @IsString() content: string
  @IsOptional() @IsString() @MaxLength(200) jobTitle?: string
  @IsOptional() @IsString() @MaxLength(200) company?: string
}

export class UpdateCoverLetterDto {
  @IsOptional() @IsString() @MaxLength(200) title?: string
  @IsOptional() @IsString() content?: string
  @IsOptional() @IsString() @MaxLength(200) jobTitle?: string
  @IsOptional() @IsString() @MaxLength(200) company?: string
}

@Injectable()
export class CoverLettersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.coverLetter.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { updatedAt: 'desc' }],
    })
  }

  async findOne(userId: string, id: string) {
    const cl = await this.prisma.coverLetter.findUnique({ where: { id } })
    if (!cl || cl.userId !== userId) throw new NotFoundException('Thư xin việc không tồn tại')
    return cl
  }

  async create(userId: string, dto: CreateCoverLetterDto) {
    const count = await this.prisma.coverLetter.count({ where: { userId } })
    const isDefault = count === 0
    return this.prisma.coverLetter.create({
      data: { ...dto, userId, isDefault },
    })
  }

  async update(userId: string, id: string, dto: UpdateCoverLetterDto) {
    await this.findOne(userId, id)
    return this.prisma.coverLetter.update({ where: { id }, data: dto })
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id)
    await this.prisma.coverLetter.delete({ where: { id } })
    return { message: 'Đã xóa thư xin việc' }
  }

  async setDefault(userId: string, id: string) {
    await this.findOne(userId, id)
    await this.prisma.coverLetter.updateMany({ where: { userId }, data: { isDefault: false } })
    return this.prisma.coverLetter.update({ where: { id }, data: { isDefault: true } })
  }
}
