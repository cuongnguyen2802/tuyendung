import { PaginationMeta } from '@tuyendung/types'

export function buildPaginationMeta(total: number, page: number, limit: number): PaginationMeta {
  return {
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
}

export function buildSkipTake(page: number, limit: number) {
  return {
    skip: (page - 1) * limit,
    take: limit,
  }
}
