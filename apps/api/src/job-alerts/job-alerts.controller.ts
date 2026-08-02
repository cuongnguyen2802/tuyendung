import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JobAlertsService, CreateJobAlertDto, UpdateJobAlertDto } from './job-alerts.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role, JwtPayload } from '@tuyendung/types'

@ApiTags('Job Alerts')
@ApiBearerAuth()
@Controller('job-alerts')
@UseGuards(JwtAuthGuard)
@Roles(Role.CANDIDATE)
export class JobAlertsController {
  constructor(private service: JobAlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách cảnh báo việc làm' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.service.findAll(user.sub)
  }

  @Post()
  @ApiOperation({ summary: 'Tạo cảnh báo việc làm' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateJobAlertDto) {
    return this.service.create(user.sub, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật cảnh báo việc làm' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateJobAlertDto) {
    return this.service.update(user.sub, id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa cảnh báo việc làm' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.remove(user.sub, id)
  }

  @Patch(':id/toggle')
  @ApiOperation({ summary: 'Bật/tắt cảnh báo' })
  toggle(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.toggle(user.sub, id)
  }
}
