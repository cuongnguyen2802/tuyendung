import {
  Controller, Get, Post, Put, Delete, Body, Param, Query,
  UseGuards, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ArticlesService } from './articles.service'
import { CreateArticleDto, UpdateArticleDto } from './dto/article.dto'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Public } from '../common/decorators/public.decorator'
import { Role } from '@tuyendung/types'

@ApiTags('Articles')
@Controller('articles')
@UseGuards(JwtAuthGuard)
export class ArticlesController {
  constructor(private articlesService: ArticlesService) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Danh mục bài viết' })
  listCategories() {
    return this.articlesService.listCategories()
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Danh sách bài viết đã xuất bản' })
  listArticles(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(12), ParseIntPipe) limit: number,
    @Query('category') category?: string,
    @Query('keyword') keyword?: string,
  ) {
    return this.articlesService.listArticles(page, limit, category, keyword)
  }

  @Public()
  @Get(':slug')
  @ApiOperation({ summary: 'Chi tiết bài viết' })
  getArticle(@Param('slug') slug: string) {
    return this.articlesService.getArticleBySlug(slug)
  }

  // ── Admin ───────────────────────────────────────────────────────────────────

  @Get('admin/list')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Danh sách tất cả bài viết' })
  adminList(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
    @Query('status') status?: string,
    @Query('keyword') keyword?: string,
    @Query('categoryId') categoryId?: string,
  ) {
    return this.articlesService.adminListArticles(page, limit, status, keyword, categoryId)
  }

  @Get('admin/categories')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  adminListCategories() {
    return this.articlesService.adminListCategories()
  }

  @Post('admin/categories')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  createCategory(@Body() body: { name: string; icon?: string }) {
    return this.articlesService.createCategory(body.name, body.icon)
  }

  @Put('admin/categories/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  updateCategory(@Param('id') id: string, @Body() body: { name: string; icon?: string; slug?: string }) {
    return this.articlesService.updateCategory(id, body.name, body.icon, body.slug)
  }

  @Delete('admin/categories/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  deleteCategory(@Param('id') id: string) {
    return this.articlesService.deleteCategory(id)
  }

  @Get('admin/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Lấy chi tiết bài viết' })
  adminGetArticle(@Param('id') id: string) {
    return this.articlesService.adminGetArticle(id)
  }

  @Post('admin')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Tạo bài viết' })
  createArticle(@Body() dto: CreateArticleDto) {
    return this.articlesService.createArticle(dto)
  }

  @Put('admin/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Cập nhật bài viết' })
  updateArticle(@Param('id') id: string, @Body() dto: UpdateArticleDto) {
    return this.articlesService.updateArticle(id, dto)
  }

  @Delete('admin/:id')
  @Roles(Role.ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: '[Admin] Xóa bài viết' })
  deleteArticle(@Param('id') id: string) {
    return this.articlesService.deleteArticle(id)
  }
}
