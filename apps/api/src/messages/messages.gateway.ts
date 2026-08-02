import {
  WebSocketGateway, SubscribeMessage, MessageBody,
  ConnectedSocket, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { JwtService } from '@nestjs/jwt'
import { MessagesService } from './messages.service'

@WebSocketGateway({ cors: { origin: '*' }, namespace: 'chat' })
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server

  private userSockets = new Map<string, string>() // userId -> socketId

  constructor(
    private messagesService: MessagesService,
    private jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token as string
      const payload = this.jwtService.verify(token)
      client.data.userId = payload.sub
      this.userSockets.set(payload.sub, client.id)
      client.join(`user:${payload.sub}`)
    } catch {
      client.disconnect()
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.userSockets.delete(client.data.userId)
    }
  }

  @SubscribeMessage('send_message')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string; applicationId?: string },
  ) {
    const senderId = client.data.userId as string
    const message = await this.messagesService.send(senderId, data.receiverId, data.content, data.applicationId)

    // Emit to receiver if online
    this.server.to(`user:${data.receiverId}`).emit('new_message', message)
    // Emit back to sender
    client.emit('new_message', message)

    return message
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    this.server.to(`user:${data.receiverId}`).emit('typing', {
      userId: client.data.userId,
      isTyping: data.isTyping,
    })
  }
}
