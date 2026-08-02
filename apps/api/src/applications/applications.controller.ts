import {
  Controller, Post, Patch, Get, Body, Param,
  Query, UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ApplicationsService } from './applications.service'
import { ApplyJobDto, UpdateApplicationStatusDto } from './dto/apply-job.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role, JwtPayload, ApplicationStatus } from '@tuyendung/types'

@ApiTags('Applications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('applications')
export class ApplicationsController {
  constructor(private applicationsService: ApplicationsService) {}

  @Post('jobs/:jobId')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Nộp đơn ứng tuyển' })
  apply(
    @CurrentUser() user: JwtPayload,
    @Param('jobId') jobId: string,
    @Body() dto: ApplyJobDto,
  ) {
    return this.applicationsService.apply(user.sub, jobId, dto)
  }

  @Get('me')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Lịch sử ứng tuyển của tôi' })
  getMyApplications(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.applicationsService.getMyApplications(user.sub, page, limit)
  }

  @Patch(':id/withdraw')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Rút đơn ứng tuyển' })
  withdraw(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.applicationsService.withdraw(user.sub, id)
  }

  @Get('employer/me')
  @Roles(Role.EMPLOYER)
  @ApiOperation({ summary: 'Tất cả hồ sơ ứng tuyển của nhà tuyển dụng' })
  getAllEmployerApplications(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: ApplicationStatus,
    @Query('jobId') jobId?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.applicationsService.getAllEmployerApplications(
      user.sub, page, limit, status, jobId, keyword,
    )
  }

  @Get('jobs/:jobId')
  @Roles(Role.EMPLOYER)
  @ApiOperation({ summary: 'Danh sách ứng viên theo tin tuyển dụng' })
  getJobApplications(
    @CurrentUser() user: JwtPayload,
    @Param('jobId') jobId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: ApplicationStatus,
  ) {
    return this.applicationsService.getJobApplications(user.sub, jobId, page, limit, status)
  }

  @Patch(':id/status')
  @Roles(Role.EMPLOYER)
  @ApiOperation({ summary: 'Cập nhật trạng thái đơn ứng tuyển' })
  updateStatus(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() dto: UpdateApplicationStatusDto,
  ) {
    return this.applicationsService.updateStatus(user.sub, id, dto)
  }
}
