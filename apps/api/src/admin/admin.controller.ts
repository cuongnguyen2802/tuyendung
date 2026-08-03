import {
  Controller, Get, Post, Put, Patch, Delete,
  Param, Query, Body, UseGuards,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { AdminService } from './admin.service'
import { Roles } from '../common/decorators/roles.decorator'
import { RolesGuard } from '../common/guards/roles.guard'
import { Role } from '@tuyendung/types'

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private adminService: AdminService) {}

  // ── Dashboard ────────────────────────────────────────────────────────────────

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê tổng quan hệ thống' })
  @ApiQuery({ name: 'months', required: false, type: Number, description: '3 | 6 | 12' })
  getDashboardStats(@Query('months') months?: string) {
    const m = months ? parseInt(months, 10) : 6
    return this.adminService.getDashboardStats(m)
  }

  // ── Jobs ─────────────────────────────────────────────────────────────────────

  @Get('jobs')
  @ApiOperation({ summary: 'Danh sách tất cả tin tuyển dụng' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getJobs(
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getJobs({
      status,
      keyword,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    })
  }

  @Patch('jobs/:id/approve')
  @ApiOperation({ summary: 'Duyệt tin tuyển dụng' })
  approveJob(@Param('id') id: string) {
    return this.adminService.approveJob(id)
  }

  @Patch('jobs/:id/reject')
  @ApiOperation({ summary: 'Từ chối tin tuyển dụng' })
  rejectJob(@Param('id') id: string, @Body('reason') reason?: string) {
    return this.adminService.rejectJob(id, reason)
  }

  @Patch('jobs/:id/close')
  @ApiOperation({ summary: 'Đóng tin tuyển dụng' })
  closeJob(@Param('id') id: string) {
    return this.adminService.closeJob(id)
  }

  @Delete('jobs/:id')
  @ApiOperation({ summary: 'Xóa tin tuyển dụng' })
  deleteJob(@Param('id') id: string) {
    return this.adminService.deleteJob(id)
  }

  // ── Users ────────────────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'Danh sách người dùng' })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getUsers(
    @Query('role') role?: string,
    @Query('keyword') keyword?: string,
    @Query('isActive') isActive?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getUsers({
      role,
      keyword,
      isActive: isActive !== undefined ? isActive === 'true' : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    })
  }

  @Patch('users/:id/toggle-active')
  @ApiOperation({ summary: 'Khoá/mở khoá tài khoản' })
  toggleUserActive(@Param('id') id: string) {
    return this.adminService.toggleUserActive(id)
  }

  @Patch('users/:id/reset-password')
  @ApiOperation({ summary: 'Đặt lại mật khẩu người dùng (không áp dụng cho Admin)' })
  resetUserPassword(@Param('id') id: string, @Body('password') password: string) {
    return this.adminService.resetUserPassword(id, password)
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Xóa người dùng' })
  deleteUser(@Param('id') id: string) {
    return this.adminService.deleteUser(id)
  }

  // ── Employers ────────────────────────────────────────────────────────────────

  @Get('employers')
  @ApiOperation({ summary: 'Danh sách nhà tuyển dụng' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'verified', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getEmployers(
    @Query('keyword') keyword?: string,
    @Query('verified') verified?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getEmployers({
      keyword,
      verified: verified !== undefined ? verified === 'true' : undefined,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    })
  }

  @Patch('employers/:id/verify')
  @ApiOperation({ summary: 'Xác minh nhà tuyển dụng' })
  verifyEmployer(@Param('id') id: string, @Body('verified') verified: boolean) {
    return this.adminService.verifyEmployer(id, verified)
  }

  // ── Revenue / Subscriptions ───────────────────────────────────────────────────

  @Get('revenue')
  @ApiOperation({ summary: 'Thống kê doanh thu và gói đăng ký' })
  @ApiQuery({ name: 'plan', required: false })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRevenue(
    @Query('plan') plan?: string,
    @Query('keyword') keyword?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getRevenueStats({
      plan,
      keyword,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 20,
    })
  }

  @Patch('users/:id/plan')
  @ApiOperation({ summary: 'Cập nhật gói của user (admin override)' })
  updateUserPlan(
    @Param('id') id: string,
    @Body('plan') plan: string,
    @Body('months') months: number,
  ) {
    return this.adminService.updateUserPlan(id, plan, months ?? 1)
  }

  // ── System Settings ───────────────────────────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'Lấy tất cả cài đặt hệ thống' })
  getSettings() {
    return this.adminService.getSettings()
  }

  @Put('settings')
  @ApiOperation({ summary: 'Cập nhật cài đặt hệ thống' })
  updateSettings(@Body() data: Record<string, string>) {
    return this.adminService.updateSettings(data)
  }

  // ── Page content ──────────────────────────────────────────────────────────────

  @Get('pages')
  @ApiOperation({ summary: 'Danh sách trạng thái các trang tĩnh' })
  getPages() {
    return this.adminService.getPages()
  }

  @Get('pages/:slug')
  @ApiOperation({ summary: 'Lấy nội dung trang tĩnh theo slug' })
  getPageContent(@Param('slug') slug: string) {
    return this.adminService.getPageContent(slug)
  }

  @Put('pages/:slug')
  @ApiOperation({ summary: 'Cập nhật nội dung trang tĩnh' })
  updatePageContent(@Param('slug') slug: string, @Body() data: Record<string, any>) {
    return this.adminService.updatePageContent(slug, data)
  }

  // ── Skills ────────────────────────────────────────────────────────────────────

  @Get('skills')
  @ApiOperation({ summary: 'Danh sách kỹ năng' })
  @ApiQuery({ name: 'keyword', required: false })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  getSkills(
    @Query('keyword') keyword?: string,
    @Query('category') category?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminService.getSkills({
      keyword,
      category,
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 50,
    })
  }

  @Post('skills')
  @ApiOperation({ summary: 'Tạo kỹ năng mới' })
  createSkill(@Body() data: { name: string; category?: string }) {
    return this.adminService.createSkill(data)
  }

  @Patch('skills/:id')
  @ApiOperation({ summary: 'Cập nhật kỹ năng' })
  updateSkill(
    @Param('id') id: string,
    @Body() data: { name?: string; category?: string; isActive?: boolean },
  ) {
    return this.adminService.updateSkill(id, data)
  }

  @Delete('skills/:id')
  @ApiOperation({ summary: 'Xóa kỹ năng' })
  deleteSkill(@Param('id') id: string) {
    return this.adminService.deleteSkill(id)
  }
}
