import {
  Controller, Get, Post, Put, Patch, Delete, Body, Param,
  UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger'
import { memoryStorage } from 'multer'
import { ResumesService } from './resumes.service'
import { UploadService } from '../upload/upload.service'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '@tuyendung/types'

@ApiTags('Resumes')
@ApiBearerAuth()
@Controller('resumes')
export class ResumesController {
  constructor(
    private resumesService: ResumesService,
    private uploadService: UploadService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách CV của tôi' })
  getMyResumes(@CurrentUser() user: JwtPayload) {
    return this.resumesService.getMyResumes(user.sub)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Lấy chi tiết 1 CV' })
  getOne(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.getOne(user.sub, id)
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload file CV (PDF/DOC/DOCX)' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    fileFilter: (req, file, cb) => {
      const allowed = ['application/pdf', 'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      if (!allowed.includes(file.mimetype)) {
        return cb(new BadRequestException('Chỉ chấp nhận PDF, DOC, DOCX'), false)
      }
      cb(null, true)
    },
    limits: { fileSize: 5 * 1024 * 1024 },
  }))
  async uploadResume(
    @CurrentUser() user: JwtPayload,
    @UploadedFile() file: Express.Multer.File,
    @Body('title') title: string,
  ) {
    if (!file) throw new BadRequestException('Vui lòng chọn file CV')
    const fileUrl = await this.uploadService.uploadFile(file, `candidates/${user.sub}/resumes`)
    const resume = await this.resumesService.create(user.sub, {
      title: title || file.originalname,
      content: null,
    })
    await this.resumesService.update(user.sub, resume.id, { fileUrl })
    return { ...resume, fileUrl }
  }

  @Post()
  @ApiOperation({ summary: 'Tạo CV mới (từ CV Builder)' })
  create(
    @CurrentUser() user: JwtPayload,
    @Body() body: { title: string; content?: any; isOnline?: boolean },
  ) {
    return this.resumesService.create(user.sub, body)
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật CV' })
  update(
    @CurrentUser() user: JwtPayload,
    @Param('id') id: string,
    @Body() body: { title?: string; content?: any; isOnline?: boolean },
  ) {
    return this.resumesService.update(user.sub, id, body)
  }

  @Patch(':id/default')
  @ApiOperation({ summary: 'Đặt CV làm mặc định' })
  setDefault(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.setDefault(user.sub, id)
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa CV' })
  delete(@CurrentUser() user: JwtPayload, @Param('id') id: string) {
    return this.resumesService.delete(user.sub, id)
  }
}
