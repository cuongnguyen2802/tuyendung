import { Controller, Get, Post, Body, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger'
import { MessagesService } from './messages.service'
import { MessagesGateway } from './messages.gateway'
import { CurrentUser } from '../common/decorators/current-user.decorator'
import { JwtPayload } from '@tuyendung/types'

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(
    private messagesService: MessagesService,
    private messagesGateway: MessagesGateway,
  ) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Danh sách cuộc trò chuyện' })
  getConversations(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getConversations(user.sub)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Số tin nhắn chưa đọc' })
  getUnreadCount(@CurrentUser() user: JwtPayload) {
    return this.messagesService.getUnreadCount(user.sub)
  }

  @Get(':partnerId/context')
  @ApiOperation({ summary: 'Thông tin ngữ cảnh của cuộc trò chuyện (profile partner + applications)' })
  getPartnerContext(
    @CurrentUser() user: JwtPayload,
    @Param('partnerId') partnerId: string,
  ) {
    return this.messagesService.getPartnerContext(user.sub, partnerId)
  }

  @Get(':partnerId')
  @ApiOperation({ summary: 'Lấy thread tin nhắn với một người' })
  getThread(
    @CurrentUser() user: JwtPayload,
    @Param('partnerId') partnerId: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(30), ParseIntPipe) limit: number,
  ) {
    return this.messagesService.getThread(user.sub, partnerId, page, limit)
  }

  @Post()
  @ApiOperation({ summary: 'Gửi tin nhắn' })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['receiverId', 'content'],
      properties: {
        receiverId: { type: 'string' },
        content: { type: 'string' },
        applicationId: { type: 'string' },
      },
    },
  })
  async send(
    @CurrentUser() user: JwtPayload,
    @Body('receiverId') receiverId: string,
    @Body('content') content: string,
    @Body('applicationId') applicationId?: string,
  ) {
    const message = await this.messagesService.send(user.sub, receiverId, content, applicationId)
    // Notify receiver in real-time if they are connected
    this.messagesGateway.server?.to(`user:${receiverId}`).emit('new_message', message)
    return message
  }
}
