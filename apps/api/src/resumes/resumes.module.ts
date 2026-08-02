import { Module } from '@nestjs/common'
import { ResumesController } from './resumes.controller'
import { ResumesService } from './resumes.service'
import { PrismaModule } from '../prisma/prisma.module'
import { UploadModule } from '../upload/upload.module'
import { PlanModule } from '../common/services/plan.module'

@Module({
  imports: [PrismaModule, UploadModule, PlanModule],
  controllers: [ResumesController],
  providers: [ResumesService],
})
export class ResumesModule {}
