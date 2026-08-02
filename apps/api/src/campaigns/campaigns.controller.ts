import {
  Controller, Get, Post, Put, Delete, Body, Param,
  Query, UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { CampaignsService } from './campaigns.service'
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaign.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role, JwtPayload } from '@tuyendung/types'

@ApiTags('Campaigns')
@Controller('campaigns')
@UseGuards(JwtAuthGuard)
@Roles(Role.EMPLOYER)
@ApiBearerAuth()
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Tạo chiến dịch mới' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCampaignDto) {
    return this.campaignsService.create(user.sub, dto)
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách chiến dịch' })
  findAll(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
  ) {
    return this.campaignsService.findAll(user.sub, page, limit, status)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết chiến dịch' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.campaignsService.findOne(user.sub, id)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật chiến dịch' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCampaignDto) {
    return this.campaignsService.update(user.sub, id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa chiến dịch' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.campaignsService.remove(user.sub, id)
  }
}
