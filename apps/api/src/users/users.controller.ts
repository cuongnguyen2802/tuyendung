import {
  Controller, Get, Put, Post, Delete, Patch, Body, Param,
  UseGuards, Query, ParseIntPipe, DefaultValuePipe,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { UsersService } from './users.service'
import { UploadService } from '../upload/upload.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { Role, JwtPayload } from '@tuyendung/types'
import {
  UpdateProfileDto, AddExperienceDto, AddEducationDto, UpsertSkillsDto, UpgradePlanDto,
  UpdateNotificationPrefDto,
} from './dto/update-profile.dto'

@ApiTags('Candidate Profile')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(
    private usersService: UsersService,
    private uploadService: UploadService,
  ) {}

  @Get('suggestions')
  @Public()
  @ApiOperation({ summary: 'Gợi ý và quảng cáo (public, chỉ trả active items)' })
  getPublicSuggestions() {
    return this.usersService.getPublicSuggestions()
  }

  @Get('me/profile')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Lấy hồ sơ ứng viên' })
  getProfile(@CurrentUser() user: JwtPayload) {
    return this.usersService.getProfile(user.sub)
  }

  @Put('me/profile')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Cập nhật hồ sơ' })
  updateProfile(@CurrentUser() user: JwtPayload, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.sub, dto)
  }

  @Post('me/experiences')
  @Roles(Role.CANDIDATE)
  addExperience(@CurrentUser() user: JwtPayload, @Body() dto: AddExperienceDto) {
    return this.usersService.addExperience(user.sub, dto)
  }

  @Put('me/experiences/:id')
  @Roles(Role.CANDIDATE)
  updateExperience(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: AddExperienceDto) {
    return this.usersService.updateExperience(user.sub, id, dto)
  }

  @Delete('me/experiences/:id')
  @Roles(Role.CANDIDATE)
  deleteExperience(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.deleteExperience(user.sub, id)
  }

  @Post('me/educations')
  @Roles(Role.CANDIDATE)
  addEducation(@CurrentUser() user: JwtPayload, @Body() dto: AddEducationDto) {
    return this.usersService.addEducation(user.sub, dto)
  }

  @Put('me/educations/:id')
  @Roles(Role.CANDIDATE)
  updateEducation(@CurrentUser() user: JwtPayload, @Param('id') id: string, @Body() dto: AddEducationDto) {
    return this.usersService.updateEducation(user.sub, id, dto)
  }

  @Delete('me/educations/:id')
  @Roles(Role.CANDIDATE)
  deleteEducation(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.deleteEducation(user.sub, id)
  }

  @Put('me/skills')
  @Roles(Role.CANDIDATE)
  upsertSkills(@CurrentUser() user: JwtPayload, @Body() dto: UpsertSkillsDto) {
    return this.usersService.upsertSkills(user.sub, dto)
  }

  @Get('me/resumes')
  @Roles(Role.CANDIDATE)
  getResumes(@CurrentUser() user: JwtPayload) {
    return this.usersService.getResumes(user.sub)
  }

  @Delete('me/resumes/:id')
  @Roles(Role.CANDIDATE)
  deleteResume(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.usersService.deleteResume(user.sub, id)
  }

  @Post('me/upload-avatar')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Upload avatar ứng viên' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      if (!file.mimetype.match(/^image\/(jpg|jpeg|png|webp)$/)) {
        return cb(new BadRequestException('Chỉ chấp nhận jpg, png, webp'), false)
      }
      cb(null, true)
    },
    limits: { fileSize: 3 * 1024 * 1024 },
  }))
  async uploadAvatar(@CurrentUser() user: JwtPayload, @UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Vui lòng chọn file ảnh')
    // Xóa avatar cũ trước khi lưu avatar mới
    const profile = await this.usersService.getProfile(user.sub).catch(() => null)
    if (profile?.avatarUrl) await this.uploadService.deleteFile(profile.avatarUrl).catch(() => {})
    const avatarUrl = await this.uploadService.uploadFile(file, `candidates/${user.sub}/avatar`)
    await this.usersService.updateProfile(user.sub, { avatarUrl })
    return { url: avatarUrl }
  }

  @Get('me/saved-jobs')
  @Roles(Role.CANDIDATE)
  getSavedJobs(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getSavedJobs(user.sub, page, limit)
  }

  @Get('me/sidebar-stats')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Thống kê badge sidebar ứng viên' })
  getSidebarStats(@CurrentUser() user: JwtPayload) {
    return this.usersService.getSidebarStats(user.sub)
  }

  @Get('me/profile-views')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Danh sách người đã xem hồ sơ' })
  getProfileViews(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getProfileViews(user.sub, page, limit)
  }

  @Get('me/plan')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Thông tin gói hiện tại' })
  getPlan(@CurrentUser() user: JwtPayload) {
    return this.usersService.getPlanInfo(user.sub)
  }

  @Post('me/upgrade')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Nâng cấp tài khoản (mock — chưa tích hợp payment)' })
  upgrade(@CurrentUser() user: JwtPayload, @Body() dto: UpgradePlanDto) {
    return this.usersService.upgradePlan(user.sub, dto.plan, dto.months ?? 1)
  }

  // ─── Follow companies ───────────────────────────────────────────────────────

  @Get('me/followed-companies')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Danh sách công ty đang theo dõi' })
  getFollowedCompanies(
    @CurrentUser() user: JwtPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.usersService.getFollowedCompanies(user.sub, page, limit)
  }

  @Post('me/follow-companies/:employerId')
  @Roles(Role.CANDIDATE)
  @ApiOperation({ summary: 'Theo dõi / bỏ theo dõi công ty' })
  toggleFollowCompany(@CurrentUser() user: JwtPayload, @Param('employerId') employerId: string) {
    return this.usersService.toggleFollowCompany(user.sub, employerId)
  }

  @Get('me/notification-preferences')
  @Roles(Role.CANDIDATE, Role.EMPLOYER)
  @ApiOperation({ summary: 'Lấy cài đặt thông báo' })
  getNotifPrefs(@CurrentUser() user: JwtPayload) {
    return this.usersService.getNotificationPreferences(user.sub)
  }

  @Patch('me/notification-preferences')
  @Roles(Role.CANDIDATE, Role.EMPLOYER)
  @ApiOperation({ summary: 'Cập nhật cài đặt thông báo' })
  updateNotifPrefs(@CurrentUser() user: JwtPayload, @Body() dto: UpdateNotificationPrefDto) {
    return this.usersService.updateNotificationPreferences(user.sub, dto)
  }
}
