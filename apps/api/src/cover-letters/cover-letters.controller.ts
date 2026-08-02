import { Controller, Get, Post, Put, Delete, Patch, Body, Param, UseGuards } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { CoverLettersService, CreateCoverLetterDto, UpdateCoverLetterDto } from './cover-letters.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Role, JwtPayload } from '@tuyendung/types'

@ApiTags('Cover Letters')
@ApiBearerAuth()
@Controller('cover-letters')
@UseGuards(JwtAuthGuard)
@Roles(Role.CANDIDATE)
export class CoverLettersController {
  constructor(private service: CoverLettersService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách thư xin việc' })
  findAll(@CurrentUser() user: JwtPayload) {
    return this.service.findAll(user.sub)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết thư xin việc' })
  findOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.findOne(user.sub, id)
  }

  @Post()
  @ApiOperation({ summary: 'Tạo thư xin việc' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateCoverLetterDto) {
    return this.service.create(user.sub, dto)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật thư xin việc' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateCoverLetterDto) {
    return this.service.update(user.sub, id, dto)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa thư xin việc' })
  remove(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.remove(user.sub, id)
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Đặt làm mặc định' })
  setDefault(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.service.setDefault(user.sub, id)
  }
}
