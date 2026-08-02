import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { UploadService } from '../upload/upload.service'
import { buildSkipTake, buildPaginationMeta } from '../common/utils/pagination'

@Injectable()
export class MediaService {
  constructor(
    private prisma: PrismaService,
    private uploadService: UploadService,
  ) {}

  async uploadFiles(files: Express.Multer.File[], folder = 'media') {
    const results = await Promise.all(
      files.map(async (file) => {
        const url = await this.uploadService.uploadFile(file, folder)
        return this.prisma.media.create({
          data: {
            filename: file.originalname,
            url,
            mimeType: file.mimetype,
            size: file.size,
            folder,
          },
        })
      }),
    )
    return results
  }

  async listMedia(page = 1, limit = 40, type?: string, folder?: string) {
    const where: any = {}
    if (type === 'image') where.mimeType = { startsWith: 'image/' }
    else if (type === 'video') where.mimeType = { startsWith: 'video/' }
    else if (type === 'document') where.mimeType = { not: { startsWith: 'image/' } }
    if (folder) where.folder = folder

    const { skip, take } = buildSkipTake(page, limit)
    const [data, total] = await Promise.all([
      this.prisma.media.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
      this.prisma.media.count({ where }),
    ])

    return { data, meta: buildPaginationMeta(total, page, limit) }
  }

  async deleteMedia(id: string) {
    const media = await this.prisma.media.findUnique({ where: { id } })
    if (!media) throw new NotFoundException('File không tồn tại')
    await this.uploadService.deleteFile(media.url)
    await this.prisma.media.delete({ where: { id } })
    return { message: 'Đã xóa file' }
  }

  async getStats() {
    const [total, images, totalSize] = await Promise.all([
      this.prisma.media.count(),
      this.prisma.media.count({ where: { mimeType: { startsWith: 'image/' } } }),
      this.prisma.media.aggregate({ _sum: { size: true } }),
    ])
    return { total, images, totalSize: totalSize._sum.size ?? 0 }
  }
}
