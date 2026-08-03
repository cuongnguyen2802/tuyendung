import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler'
import { CacheModule } from '@nestjs/cache-manager'
import { APP_GUARD } from '@nestjs/core'
import KeyvRedis from '@keyv/redis'
import { AuthModule } from './auth/auth.module'
import { UsersModule } from './users/users.module'
import { EmployersModule } from './employers/employers.module'
import { JobsModule } from './jobs/jobs.module'
import { ApplicationsModule } from './applications/applications.module'
import { SearchModule } from './search/search.module'
import { PrismaModule } from './prisma/prisma.module'
import { NotificationsModule } from './notifications/notifications.module'
import { EmailModule } from './email/email.module'
import { CandidatesModule } from './candidates/candidates.module'
import { RecommendationsModule } from './recommendations/recommendations.module'
import { ResumesModule } from './resumes/resumes.module'
import { AdminModule } from './admin/admin.module'
import { ArticlesModule } from './articles/articles.module'
import { JobCategoriesModule } from './job-categories/job-categories.module'
import { MediaModule } from './media/media.module'
import { ActivityModule } from './activity/activity.module'
import { CampaignsModule } from './campaigns/campaigns.module'
import { CoverLettersModule } from './cover-letters/cover-letters.module'
import { JobAlertsModule } from './job-alerts/job-alerts.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 100 }]),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const redisUrl = config.get<string>('REDIS_URL')
        if (redisUrl) {
          return { stores: [new KeyvRedis(redisUrl)], ttl: 60000 } as any
        }
        return { ttl: 60000, max: 200 } as any
      },
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    EmployersModule,
    JobsModule,
    ApplicationsModule,
    SearchModule,
    NotificationsModule,
    EmailModule,
    // MessagesModule omitted — WebSocket gateways are not supported in serverless
    CandidatesModule,
    RecommendationsModule,
    ResumesModule,
    AdminModule,
    ArticlesModule,
    JobCategoriesModule,
    MediaModule,
    ActivityModule,
    CampaignsModule,
    CoverLettersModule,
    JobAlertsModule,
  ],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppServerlessModule {}
