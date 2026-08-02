import { Injectable } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { buildSkipTake, buildPaginationMeta } from '../common/utils/pagination'

export type ActivityTypeKey =
  | 'LOGIN'
  | 'JOB_CREATED'
  | 'JOB_UPDATED'
  | 'JOB_STATUS_CHANGED'
  | 'APPLICATION_STATUS_CHANGED'
  | 'COMPANY_UPDATED'
  | 'PROFILE_UPDATED'

@Injectable()
export class ActivityService {
  constructor(private prisma: PrismaService) {}

  async record(
    employerId: string,
    type: ActivityTypeKey,
    action: string,
    targetId?: string,
    targetName?: string,
    meta?: Record<string, unknown>,
  ) {
    return this.prisma.activityLog.create({
      data: { employerId, type, action, targetId, targetName, meta },
    }).catch(() => {}) // fire-and-forget, never block the main flow
  }

  async findMany(
    employerId: string,
    opts: { from?: Date; to?: Date; type?: ActivityTypeKey; page?: number; limit?: number },
  ) {
    const { from, to, type, page = 1, limit = 30 } = opts
    const { skip, take } = buildSkipTake(page, limit)

    const where = {
      employerId,
      ...(type && { type }),
      ...(from || to
        ? {
            createdAt: {
              ...(from && { gte: from }),
              ...(to && { lte: to }),
            },
          }
        : {}),
    }

    const [data, total] = await Promise.all([
      this.prisma.activityLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.activityLog.count({ where }),
    ])

    return { data, meta: buildPaginationMeta(total, page, limit) }
  }
}
