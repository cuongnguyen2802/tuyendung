import {
  Controller, Get, Put, Post, Body, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
  UseInterceptors, UploadedFile, BadRequestException,
  ParseEnumPipe,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { EmployersService } from './employers.service'
import { UpdateCompanyDto } from './dto/update-company.dto'
import { UploadService } from '../upload/upload.service'
import { PlanService } from '../common/services/plan.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { Role, JwtPayload } from '@tuyendung/types'
import { UpgradePlanDto } from '../users/dto/update-profile.dto'

function imageFilter(req: any, file: Express.Multer.File, cb: any) {
  if (!file.mimetype.match(/^image\/(jpg|jpeg|png|gif|webp|svg\+xml)$/)) {
    return cb(new BadRequestException('Chỉ chấp nhận file ảnh (jpg, png, webp, gif)'), false)
  }
  cb(null, true)
}

@ApiTags('Employers')
@Controller('employers')
@UseGuards(JwtAuthGuard)
export class EmployersController {
  constructor(
    private employersService: EmployersService,
    private uploadService: UploadService,
    private plan: PlanService,
  ) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách công ty' })
  listCompanies(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('city') city?: string,
    @Query('industry') industry?: string,
  ) {
    return this.employersService.listCompanies(page, limit, city, industry)
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết công ty theo slug' })
  getCompanyBySlug(@Param('slug') slug: string) {
    return this.employersService.getCompanyBySlug(slug)
  }

  @Get('me/company')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thông tin công ty của tôi' })
  getMyCompany(@CurrentUser() user: JwtPayload) {
    return this.employersService.getMyCompany(user.sub)
  }

  @Put('me/company')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cập nhật thông tin công ty' })
  updateCompany(@CurrentUser() user: JwtPayload, @Body() dto: UpdateCompanyDto) {
    return this.employersService.updateCompany(user.sub, dto)
  }

  @Post('me/upload-logo')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload logo công ty' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), fileFilter: imageFilter, limits: { fileSize: 5 * 1024 * 1024 } }))
  async uploadLogo(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn file ảnh')
    const logoUrl = await this.uploadService.uploadFile(file, 'logos')
    await this.employersService.updateCompany(user.sub, { logoUrl })
    return { url: logoUrl }
  }

  @Post('me/upload-cover')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload ảnh bìa công ty' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), fileFilter: imageFilter, limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadCover(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn file ảnh')
    const coverUrl = await this.uploadService.uploadFile(file, 'covers')
    await this.employersService.updateCompany(user.sub, { coverUrl })
    return { url: coverUrl }
  }

  @Get('me/dashboard')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thống kê dashboard nhà tuyển dụng' })
  getDashboard(@CurrentUser() user: JwtPayload) {
    return this.employersService.getDashboardStats(user.sub)
  }

  @Get('me/insights')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Phân tích tuyển dụng' })
  getInsights(
    @CurrentUser() user: JwtPayload,
    @Query('period', new DefaultValuePipe(30), ParseIntPipe) period: number,
  ) {
    return this.employersService.getInsights(user.sub, Math.min(period, 90))
  }

  @Get('me/plan')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Thông tin gói nhà tuyển dụng' })
  async getPlan(@CurrentUser() user: JwtPayload) {
    const [details, limits] = await Promise.all([
      this.plan.getUserPlanDetails(user.sub),
      this.plan.getEmployerPlanInfo(user.sub),
    ])
    return { ...details, limits }
  }

  @Post('me/upgrade')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Nâng cấp tài khoản nhà tuyển dụng (mock)' })
  upgrade(@CurrentUser() user: JwtPayload, @Body() dto: UpgradePlanDto) {
    return this.plan.upgradePlan(user.sub, dto.plan, dto.months ?? 1)
  }

  @Post('me/verify-request')
  @Roles(Role.EMPLOYER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Gửi yêu cầu xác minh doanh nghiệp' })
  requestVerification(
    @CurrentUser() user: JwtPayload,
    @Body() body: { taxCode: string; contactName: string; note?: string },
  ) {
    return this.employersService.requestVerification(user.sub, body)
  }
}
