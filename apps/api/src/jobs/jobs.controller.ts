import {
  Controller, Get, Post, Put, Delete, Patch, Body, Param,
  Query, UseGuards, DefaultValuePipe, ParseIntPipe,
  UploadedFile, UseInterceptors, Req, BadRequestException,
} from '@nestjs/common'
import { Request } from 'express'
import { JwtService } from '@nestjs/jwt'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { JobsService } from './jobs.service'
import { CreateJobDto, UpdateJobDto } from './dto/create-job.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { Role, JwtPayload, JobType, WorkMode, JobStatus } from '@tuyendung/types'
import { AiService, AISuggestParams } from '../ai/ai.service'

@ApiTags('Jobs')
@Controller('jobs')
@UseGuards(JwtAuthGuard)
export class JobsController {
  constructor(
    private jobsService: JobsService,
    private aiService: AiService,
    private jwtService: JwtService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Tìm kiếm và lọc việc làm' })
  findAll(
    @Query('keyword') keyword?: string,
    @Query('city') city?: string,
    @Query('jobType') jobType?: JobType,
    @Query('workMode') workMode?: WorkMode,
    @Query('salaryMin') salaryMin?: string,
    @Query('experienceMin') experienceMin?: string,
    @Query('sortBy') sortBy?: 'newest' | 'salary' | 'views',
    @Query('categorySlug') categorySlug?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
  ) {
    return this.jobsService.findAll({
      keyword, city, jobType, workMode,
      salaryMin: salaryMin ? parseInt(salaryMin, 10) : undefined,
      experienceMin: experienceMin ? parseInt(experienceMin, 10) : undefined,
      sortBy, categorySlug, page, limit,
    })
  }

  @Public()
  @Get('stats')
  @ApiOperation({ summary: 'Thống kê thị trường việc làm' })
  getStats() {
    return this.jobsService.getStats()
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết tin tuyển dụng' })
  findBySlug(@Param('slug') slug: string, @Req() req: Request) {
    let userId: string | undefined
    try {
      const token = req.headers.authorization?.replace('Bearer ', '')
      if (token) userId = this.jwtService.verify<{ sub: string }>(token).sub
    } catch {}
    return this.jobsService.findBySlug(slug, userId)
  }

  @Get('employer/my-jobs')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Danh sách tin của nhà tuyển dụng' })
  getMyJobs(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: JobStatus,
  ) {
    return this.jobsService.getMyJobs(user.sub, page, limit, status)
  }

  @Get('employer/:id')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chi tiết 1 tin của nhà tuyển dụng (theo ID)' })
  findByIdForEmployer(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.jobsService.findByIdForEmployer(user.sub, id)
  }

  @Post('parse-jd')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @UseInterceptors(FileInterceptor('file', {
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
      const allowed = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ]
      if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException('Chỉ chấp nhận file .txt, .pdf, .doc, .docx'), false)
      }
      cb(null, true)
    },
  }))
  @ApiOperation({ summary: 'Phân tích JD từ văn bản hoặc file' })
  async parseJD(
    @Body('text') text?: string,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const content = file ? file.buffer.toString('utf-8') : (text ?? '')
    if (!content.trim()) throw new BadRequestException('Vui lòng cung cấp nội dung JD')
    return this.aiService.parseJD(content)
  }

  @Post('ai-suggest')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'AI tạo nội dung JD theo vị trí' })
  aiSuggest(@Body() params: AISuggestParams) {
    return this.aiService.suggestJD(params)
  }

  @Post()
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đăng tin tuyển dụng mới' })
  create(@CurrentUser() user: JwtPayload, @Body() dto: CreateJobDto) {
    return this.jobsService.create(user.sub, dto)
  }

  @Put(':id')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Chỉnh sửa tin tuyển dụng' })
  update(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: UpdateJobDto) {
    return this.jobsService.update(user.sub, id, dto)
  }

  @Patch(':id/close')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Đóng tin tuyển dụng' })
  close(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.jobsService.close(user.sub, id)
  }

  @Delete(':id')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Xóa tin tuyển dụng' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.jobsService.delete(user.sub, id)
  }

  @Post(':id/save')
  @Roles(Role.CANDIDATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lưu / bỏ lưu tin tuyển dụng' })
  toggleSave(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.jobsService.toggleSaveJob(user.sub, id)
  }

  @Patch(':id/feature')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Bật/tắt tin nổi bật (gated by plan)' })
  toggleFeature(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.jobsService.toggleFeature(user.sub, id)
  }

  @Patch(':id/approve')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Duyệt tin tuyển dụng' })
  approve(@Param('id') id: string) {
    return this.jobsService.approveJob(id)
  }

  @Patch(':id/reject')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Từ chối tin tuyển dụng' })
  reject(@Param('id') id: string) {
    return this.jobsService.rejectJob(id)
  }
}
