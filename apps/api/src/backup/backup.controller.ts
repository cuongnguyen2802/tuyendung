import {
  Controller, Get, Post, Delete, Param, Body, Res,
  UseGuards, BadRequestException, UseInterceptors,
  UploadedFile, ParseFilePipe, MaxFileSizeValidator,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { memoryStorage } from 'multer'
import { Response } from 'express'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'
import { BackupService } from './backup.service'
import { RolesGuard } from '../common/guards/roles.guard'
import { Roles } from '../common/decorators/roles.decorator'
import { Role } from '@tuyendung/types'
import { SkipThrottle } from '@nestjs/throttler'

class SetAutoBackupDto {
  @IsBoolean() enabled: boolean
}

@ApiTags('Backup')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles(Role.ADMIN)
@SkipThrottle()
@Controller('admin/backup')
export class BackupController {
  constructor(private backup: BackupService) {}

  // ── Status ────────────────────────────────────────────────────────────────

  @Get('status')
  @ApiOperation({ summary: 'Trạng thái backup & auto-backup' })
  getStatus() {
    return this.backup.getStatus()
  }

  // ── List ──────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'Danh sách backup' })
  list() {
    return this.backup.listBackups()
  }

  // ── Create ────────────────────────────────────────────────────────────────

  @Post()
  @ApiOperation({ summary: 'Tạo backup thủ công ngay' })
  create() {
    return this.backup.createBackup('manual')
  }

  // ── Download ──────────────────────────────────────────────────────────────

  @Get(':filename/download')
  @ApiOperation({ summary: 'Tải xuống file backup' })
  download(@Param('filename') filename: string, @Res() res: Response) {
    // Basic path-traversal guard
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Invalid filename')
    }
    const stream = this.backup.createReadStream(filename)
    res.set({
      'Content-Type': 'application/gzip',
      'Content-Disposition': `attachment; filename="${filename}"`,
    })
    stream.pipe(res)
  }

  // ── Delete ────────────────────────────────────────────────────────────────

  @Delete(':filename')
  @ApiOperation({ summary: 'Xóa một file backup' })
  delete(@Param('filename') filename: string) {
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('Invalid filename')
    }
    this.backup.deleteBackup(filename)
    return { message: 'Đã xóa backup' }
  }

  // ── Auto-backup toggle ────────────────────────────────────────────────────

  @Post('auto')
  @ApiOperation({ summary: 'Bật/tắt auto-backup hàng ngày' })
  setAuto(@Body() dto: SetAutoBackupDto) {
    this.backup.setAutoBackup(dto.enabled)
    return { autoEnabled: dto.enabled, message: dto.enabled ? 'Đã bật auto-backup' : 'Đã tắt auto-backup' }
  }

  // ── Restore ───────────────────────────────────────────────────────────────

  @Post('restore')
  @ApiOperation({ summary: 'Khôi phục database từ file backup (.json.gz)' })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  restore(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: 500 * 1024 * 1024 })], // 500 MB max
      }),
    )
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Vui lòng chọn file backup (.json.gz)')
    if (!file.originalname.endsWith('.json.gz') && !file.originalname.endsWith('.gz')) {
      throw new BadRequestException('File phải có đuôi .json.gz')
    }
    return this.backup.restoreFromBuffer(file.buffer)
  }
}
