import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { JobsController } from './jobs.controller'
import { JobsService } from './jobs.service'
import { SearchModule } from '../search/search.module'
import { ActivityModule } from '../activity/activity.module'
import { AiModule } from '../ai/ai.module'
import { PlanModule } from '../common/services/plan.module'

@Module({
  imports: [
    SearchModule,
    ActivityModule,
    AiModule,
    PlanModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
