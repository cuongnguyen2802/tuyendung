import { Module } from '@nestjs/common'
import { AiService } from './ai.service'
import { ChatService } from './chat.service'
import { ChatController } from './chat.controller'
import { PrismaModule } from '../prisma/prisma.module'

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [AiService, ChatService],
  exports: [AiService, ChatService],
})
export class AiModule {}
