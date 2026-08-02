import { Controller, Get, Query } from '@nestjs/common'
import { SearchService } from './search.service'
import { JobQueryDto } from '../jobs/dto/create-job.dto'
import { Public } from '../common/decorators/public.decorator'

class SearchJobsQuery extends JobQueryDto {
  q?: string
}

@Public()
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('jobs')
  async searchJobs(@Query() query: SearchJobsQuery) {
    const { q = '', ...filters } = query

    if (!this.searchService.isAvailable) {
      return {
        data: [],
        meta: { total: 0, page: 1, limit: 20, totalPages: 0 },
        fallback: true,
        message: 'Meilisearch không khả dụng — vui lòng dùng endpoint /jobs',
      }
    }

    return this.searchService.searchJobs(q, filters as JobQueryDto)
  }

  @Get('status')
  getStatus() {
    return { available: this.searchService.isAvailable }
  }
}
