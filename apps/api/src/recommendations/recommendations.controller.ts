import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { RecommendationsService } from './recommendations.service'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { Public } from '../common/decorators/public.decorator'
import { JwtPayload } from '@tuyendung/types'

@ApiTags('Recommendations')
@ApiBearerAuth()
@Controller('recommendations')
export class RecommendationsController {
  constructor(private recommendationsService: RecommendationsService) {}

  @Get('jobs')
  @ApiOperation({ summary: 'Gợi ý việc làm phù hợp với ứng viên' })
  getJobRecommendations(
    @CurrentUser() user: JwtPayload,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationsService.getJobRecommendations(user.sub, limit ? parseInt(limit, 10) : 10)
  }

  @Get('jobs/:jobId/similar')
  @Public()
  @ApiOperation({ summary: 'Việc làm tương tự' })
  getSimilarJobs(
    @Param('jobId') jobId: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationsService.getSimilarJobs(jobId, limit ? parseInt(limit, 10) : 6)
  }
}
