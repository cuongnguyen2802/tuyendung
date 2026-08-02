import { Module } from '@nestjs/common'
import { ApplicationsController } from './applications.controller'
import { ApplicationsService } from './applications.service'
import { NotificationsModule } from '../notifications/notifications.module'
import { EmailModule } from '../email/email.module'
import { ActivityModule } from '../activity/activity.module'
import { PlanModule } from '../common/services/plan.module'

@Module({
  imports: [NotificationsModule, EmailModule, ActivityModule, PlanModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
})
export class ApplicationsModule {}
