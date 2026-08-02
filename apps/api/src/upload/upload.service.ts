import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'
import * as path from 'path'
import * as fs from 'fs'

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name)
  private s3: S3Client | null = null
  private bucket: string | null = null
  private useS3: boolean = false

  constructor(private config: ConfigService) {
    const region = config.get<string>('AWS_REGION')
    const accessKeyId = config.get<string>('AWS_ACCESS_KEY_ID')
    const secretAccessKey = config.get<string>('AWS_SECRET_ACCESS_KEY')
    this.bucket = config.get<string>('AWS_S3_BUCKET') ?? null

    if (region && accessKeyId && secretAccessKey && this.bucket) {
      this.s3 = new S3Client({ region, credentials: { accessKeyId, secretAccessKey } })
      this.useS3 = true
      this.logger.log('S3 upload enabled')
    } else {
      this.logger.warn('AWS S3 not configured — using local disk storage')
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<string> {
    if (this.useS3 && this.s3 && this.bucket) {
      return this.uploadToS3(file, folder)
    }
    return this.saveLocally(file, folder)
  }

  async deleteFile(url: string): Promise<void> {
    if (this.useS3 && this.s3 && this.bucket) {
      try {
        // Extract S3 key from URL
        const key = url.split('.amazonaws.com/').at(1)
        if (key) {
          await this.s3.send(new DeleteObjectCommand({ Bucket: this.bucket!, Key: key }))
        }
      } catch (err) {
        this.logger.error('S3 delete failed:', err)
      }
      return
    }
    // Local delete
    try {
      const localPath = url.replace(/^https?:\/\/[^/]+/, '')
      const fullPath = path.join(process.cwd(), localPath)
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath)
    } catch {}
  }

  private async uploadToS3(file: Express.Multer.File, folder: string): Promise<string> {
    const ext = path.extname(file.originalname)
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`

    const upload = new Upload({
      client: this.s3!,
      params: {
        Bucket: this.bucket!,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      },
    })

    const result = await upload.done()
    return (result as any).Location ?? `https://${this.bucket}.s3.amazonaws.com/${key}`
  }

  private saveLocally(file: Express.Multer.File, folder: string): string {
    const dir = path.join(process.cwd(), 'uploads', folder)
    fs.mkdirSync(dir, { recursive: true })

    const ext = path.extname(file.originalname)
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`
    fs.writeFileSync(path.join(dir, filename), file.buffer)

    const apiUrl = this.config.get('API_URL', 'http://localhost:3001')
    return `${apiUrl}/uploads/${folder}/${filename}`
  }
}
