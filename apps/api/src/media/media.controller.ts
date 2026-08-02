import {
  Controller, Get, Post, Delete, Param, Query, UseGuards,
  UseInterceptors, UploadedFiles, ParseIntPipe, DefaultValuePipe, BadRequestException,
} from '@nestjs/common'
import { FilesInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { ApiTags, ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger'
import { MediaService } from './media.service'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Role } from '@tuyendung/types'

@ApiTags('Media')
@Controller('media')
@UseGuards(JwtAuthGuard)
@Roles(Role.ADMIN)
@ApiBearerAuth()
export class MediaController {
  constructor(private mediaService: MediaService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Thống kê media' })
  getStats() {
    return this.mediaService.getStats()
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách media' })
  list(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(40), ParseIntPipe) limit: number,
    @Query('type') type?: string,
    @Query('folder') folder?: string,
  ) {
    return this.mediaService.listMedia(page, limit, type, folder)
  }

  @Post('upload')
  @ApiOperation({ summary: 'Upload files' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 20, {
    storage: memoryStorage(),
    fileFilter: (_, file, cb) => {
      const allowed = /^(image|video|application\/(pdf|msword|vnd\.|zip))/
      if (!allowed.test(file.mimetype) && !file.mimetype.startsWith('image/')) {
        cb(new BadRequestException('Định dạng file không được hỗ trợ'), false)
      } else {
        cb(null, true)
      }
    },
    limits: { fileSize: 10 * 1024 * 1024 },
  }))
  upload(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files?.length) throw new BadRequestException('Vui lòng chọn file')
    return this.mediaService.uploadFiles(files, 'media')
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa media' })
  delete(@Param('id') id: string) {
    return this.mediaService.deleteMedia(id)
  }
}
