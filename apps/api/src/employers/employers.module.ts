import { Module } from '@nestjs/common'
import { EmployersController } from './employers.controller'
import { EmployersService } from './employers.service'
import { UploadModule } from '../upload/upload.module'
import { ActivityModule } from '../activity/activity.module'
import { PlanModule } from '../common/services/plan.module'

@Module({
  imports: [UploadModule, ActivityModule, PlanModule],
  controllers: [EmployersController],
  providers: [EmployersService],
  exports: [EmployersService],
})
export class EmployersModule {}
