import { Injectable, OnModuleInit, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { Meilisearch } from 'meilisearch'
import { JobQueryDto } from '../jobs/dto/create-job.dto'

@Injectable()
export class SearchService implements OnModuleInit {
  private client: Meilisearch
  private readonly logger = new Logger(SearchService.name)
  private _available = false

  get isAvailable() {
    return this._available
  }

  constructor(config: ConfigService) {
    this.client = new Meilisearch({
      host: config.get('MEILISEARCH_HOST', 'http://localhost:7700'),
      apiKey: config.get('MEILISEARCH_API_KEY', ''),
    })
  }

  async onModuleInit() {
    try {
      const index = this.client.index('jobs')
      await index.updateSettings({
        searchableAttributes: ['title', 'description', 'companyName', 'city', 'skills'],
        filterableAttributes: ['city', 'jobType', 'workMode', 'status', 'salaryMin', 'salaryMax'],
        sortableAttributes: ['salaryMax', 'views', 'publishedAt'],
      })
      this._available = true
      this.logger.log('Meilisearch initialized')
    } catch {
      this._available = false
      this.logger.warn('Meilisearch not available, full-text search will fall back to Postgres')
    }
  }

  async indexJob(job: Record<string, unknown>) {
    try {
      const index = this.client.index('jobs')
      await index.addDocuments([this.transformJob(job)])
    } catch {
      this.logger.warn(`Failed to index job ${job['id']}`)
    }
  }

  async removeJob(jobId: string) {
    try {
      await this.client.index('jobs').deleteDocument(jobId)
    } catch {
      // silently fail if Meilisearch is unavailable
    }
  }

  async searchJobs(keyword: string, query: JobQueryDto) {
    const { page = 1, limit = 20, city, jobType, workMode, salaryMin } = query

    const filters: string[] = ['status = "PUBLISHED"']
    if (city) filters.push(`city = "${city}"`)
    if (jobType) filters.push(`jobType = "${jobType}"`)
    if (workMode) filters.push(`workMode = "${workMode}"`)
    if (salaryMin) filters.push(`salaryMax >= ${salaryMin}`)

    try {
      const result = await this.client.index('jobs').search(keyword, {
        filter: filters.join(' AND '),
        limit,
        offset: (page - 1) * limit,
        sort: ['publishedAt:desc'],
      })

      return {
        data: result.hits,
        meta: {
          total: result.estimatedTotalHits || 0,
          page,
          limit,
          totalPages: Math.ceil((result.estimatedTotalHits || 0) / limit),
        },
      }
    } catch {
      return { data: [], meta: { total: 0, page, limit, totalPages: 0 } }
    }
  }

  private transformJob(job: Record<string, unknown>) {
    const employer = job['employer'] as Record<string, unknown> | undefined
    const skills = (job['skills'] as { skill: { name: string } }[])?.map((s) => s.skill.name) || []
    return {
      id: job['id'],
      title: job['title'],
      description: job['description'],
      city: job['city'],
      jobType: job['jobType'],
      workMode: job['workMode'],
      salaryMin: job['salaryMin'],
      salaryMax: job['salaryMax'],
      status: job['status'],
      views: job['views'],
      publishedAt: job['publishedAt'],
      companyName: employer?.['companyName'],
      skills,
    }
  }
}
