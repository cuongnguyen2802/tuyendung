import {
  Controller, Get, Post, Put, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger'
import { JobCategoriesService, UpsertCategoryDto } from './job-categories.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Public } from '../common/decorators/public.decorator'
import { Role } from '@tuyendung/types'

@ApiTags('Job Categories')
@Controller('job-categories')
@UseGuards(JwtAuthGuard)
export class JobCategoriesController {
  constructor(private readonly svc: JobCategoriesService) {}

  @Public()
  @Get()
  findAll(@Query('all') all?: string) {
    return this.svc.findAll(all !== 'true')
  }

  @Public()
  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.svc.findBySlug(slug)
  }

  @Post()
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  create(@Body() dto: UpsertCategoryDto) {
    return this.svc.create(dto)
  }

  @Put(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  update(@Param('id') id: string, @Body() dto: Partial<UpsertCategoryDto>) {
    return this.svc.update(id, dto)
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  remove(@Param('id') id: string) {
    return this.svc.remove(id)
  }
}
