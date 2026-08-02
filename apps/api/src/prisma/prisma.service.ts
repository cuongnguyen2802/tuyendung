import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@tuyendung/database'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    // Lazy connect — Prisma connects on first query
  }

  async onModuleDestroy() {
    await this.$disconnect()
  }
}
