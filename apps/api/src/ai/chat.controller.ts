import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiBody, ApiBearerAuth } from '@nestjs/swagger'
import { Response } from 'express'
import { ChatService } from './chat.service'
import { ChatMessageDto } from './dto/chat-message.dto'
import { Public } from '../common/decorators/public.decorator'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '@tuyendung/types'

@ApiTags('AI Chat')
@Controller('ai/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * POST /api/v1/ai/chat/stream
   * Send a message and receive a streaming SSE response.
   * Works for both authenticated users and anonymous guests.
   *
   * Request body: { message, sessionId?, guestId? }
   * Response: SSE stream of `data: {"token":"..."}` events
   *           terminated by `data: {"done":true,"sessionId":"..."}`.
   */
  @Post('stream')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Gửi tin nhắn AI (SSE stream)' })
  @ApiBody({ type: ChatMessageDto })
  async stream(
    @Body() dto: ChatMessageDto,
    @Res() res: Response,
    @CurrentUser() user?: JwtPayload,
  ) {
    // Bypass NestJS response handling — we write SSE directly
    await this.chatService.streamChat({
      message:   dto.message,
      sessionId: dto.sessionId,
      guestId:   dto.guestId,
      userId:    user?.sub,
      res,
    })
  }

  /**
   * GET /api/v1/ai/chat/sessions/:id/messages
   * Fetch message history for a session.
   * Pass ?guestId=xxx for anonymous access.
   */
  @Get('sessions/:id/messages')
  @Public()
  @ApiOperation({ summary: 'Lấy lịch sử tin nhắn của phiên chat AI' })
  @ApiBearerAuth()
  getMessages(
    @Param('id') id: string,
    @Query('guestId') guestId?: string,
    @CurrentUser() user?: JwtPayload,
  ) {
    return this.chatService.getSessionMessages(id, guestId, user?.sub)
  }
}
