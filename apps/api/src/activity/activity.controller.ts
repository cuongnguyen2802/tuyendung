import {
  Controller, Get, Query, UseGuards,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ActivityService, ActivityTypeKey } from './activity.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role, JwtPayload } from '@tuyendung/types'
import { PrismaService } from '../prisma/prisma.service'
import { NotFoundException } from '@nestjs/common'

@ApiTags('Activity')
@Controller('activity')
@UseGuards(JwtAuthGuard)
export class ActivityController {
  constructor(
    private activityService: ActivityService,
    private prisma: PrismaService,
  ) {}

  @Get('employer/me')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lịch sử hoạt động nhà tuyển dụng' })
  async getMyActivity(
    @CurrentUser() user: JwtPayload,
    @Query('from') from?: string,
    @Query('to') to?: string,
    @Query('type') type?: ActivityTypeKey,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit?: number,
  ) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId: user.sub },
      select: { id: true },
    })
    if (!employer) throw new NotFoundException('Thông tin công ty không tồn tại')

    const fromDate = from ? new Date(from) : (() => {
      const d = new Date(); d.setDate(d.getDate() - 30); return d
    })()
    const toDate = to ? new Date(to) : new Date()
    toDate.setHours(23, 59, 59, 999)

    return this.activityService.findMany(employer.id, {
      from: fromDate,
      to: toDate,
      type,
      page,
      limit,
    })
  }
}
