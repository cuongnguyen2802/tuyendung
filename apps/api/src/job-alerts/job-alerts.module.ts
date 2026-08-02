import { Module } from '@nestjs/common'
import { JobAlertsController } from './job-alerts.controller'
import { JobAlertsService } from './job-alerts.service'
import { JobAlertDispatchService } from './job-alert-dispatch.service'
import { PrismaModule } from '../prisma/prisma.module'
import { EmailModule } from '../email/email.module'
import { NotificationsModule } from '../notifications/notifications.module'

@Module({
  imports: [PrismaModule, EmailModule, NotificationsModule],
  controllers: [JobAlertsController],
  providers: [JobAlertsService, JobAlertDispatchService],
})
export class JobAlertsModule {}
