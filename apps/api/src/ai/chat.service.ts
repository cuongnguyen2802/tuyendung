import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { Response } from 'express'
import { PrismaService } from '../prisma/prisma.service'

// Maximum recent messages loaded into AI context
const MAX_CONTEXT_MESSAGES = 20
// Maximum sessions stored per guest (anonymous users)
const MAX_GUEST_SESSIONS_PER_ID = 10

const SYSTEM_PROMPT = `Bạn là trợ lý AI của TuyenDung.vn — nền tảng tuyển dụng hàng đầu Việt Nam.
Nhiệm vụ của bạn là hỗ trợ cả ứng viên và nhà tuyển dụng với các vấn đề liên quan đến tuyển dụng.

Bạn có thể giúp:
- Ứng viên: tìm việc làm phù hợp, tư vấn viết CV chuyên nghiệp, chuẩn bị phỏng vấn, đàm phán lương, phát triển kỹ năng
- Nhà tuyển dụng: viết tin tuyển dụng hấp dẫn, xây dựng tiêu chí tuyển dụng, cải thiện quy trình tuyển chọn, thu hút nhân tài
- Chung: giải đáp thắc mắc về thị trường lao động Việt Nam, xu hướng ngành nghề, mức lương tham khảo

Phong cách:
- Trả lời ngắn gọn, thực tế, đúng trọng tâm
- Dùng tiếng Việt tự nhiên, thân thiện nhưng chuyên nghiệp
- Dùng danh sách gạch đầu dòng (•) khi liệt kê nhiều điểm
- Đề xuất tính năng cụ thể của TuyenDung.vn khi phù hợp (đăng tin, tìm việc, CV builder, v.v.)
- Nếu câu hỏi không liên quan đến tuyển dụng, hãy khéo léo chuyển hướng về chủ đề chính`

// ── Mock streaming helpers ─────────────────────────────────────────────────────

const MOCK_RESPONSES: Record<string, string> = {
  default: `Xin chào! Tôi là trợ lý AI của TuyenDung.vn. Tôi có thể giúp bạn:

• Tư vấn viết CV chuyên nghiệp
• Chuẩn bị cho buổi phỏng vấn
• Tìm kiếm việc làm phù hợp
• Đàm phán mức lương
• Giải đáp thắc mắc về thị trường lao động

Bạn cần hỗ trợ gì hôm nay?`,
  cv: `Dưới đây là những bí quyết để viết CV ấn tượng:

• **Thông tin cá nhân**: Họ tên, email chuyên nghiệp, số điện thoại, LinkedIn
• **Tóm tắt nghề nghiệp**: 2-3 câu nêu bật điểm mạnh và mục tiêu
• **Kinh nghiệm làm việc**: Dùng con số cụ thể (tăng 30% doanh thu, quản lý 10 nhân viên...)
• **Kỹ năng**: Liệt kê cả hard skills lẫn soft skills liên quan đến vị trí
• **Học vấn**: Tên trường, chuyên ngành, năm tốt nghiệp, GPA (nếu cao)

💡 Bạn có thể dùng **CV Builder** của TuyenDung.vn để tạo CV chuyên nghiệp miễn phí!`,
  interview: `Để chuẩn bị phỏng vấn thành công, hãy chú ý:

**Trước buổi phỏng vấn:**
• Nghiên cứu kỹ về công ty (sản phẩm, văn hóa, tin tức gần đây)
• Luyện tập trả lời câu hỏi STAR (Situation - Task - Action - Result)
• Chuẩn bị 2-3 câu hỏi thông minh để hỏi lại nhà tuyển dụng

**Trong buổi phỏng vấn:**
• Đến đúng giờ hoặc sớm 10 phút
• Lắng nghe kỹ câu hỏi trước khi trả lời
• Dùng ví dụ thực tế để minh họa câu trả lời

**Câu hỏi thường gặp:**
• "Điểm mạnh/yếu của bạn là gì?"
• "Tại sao bạn muốn làm việc tại đây?"
• "Bạn kỳ vọng mức lương bao nhiêu?"`,
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('cv') || lower.includes('hồ sơ') || lower.includes('resume')) return MOCK_RESPONSES.cv
  if (lower.includes('phỏng vấn') || lower.includes('interview')) return MOCK_RESPONSES.interview
  return MOCK_RESPONSES.default
}

async function* mockStream(text: string, delayMs = 18) {
  for (const char of text) {
    yield char
    await new Promise(r => setTimeout(r, delayMs))
  }
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name)
  private client: Anthropic | null = null
  private readonly useMock: boolean

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey  = config.get<string>('ANTHROPIC_API_KEY')
    const isMock  = config.get<string>('AI_MOCK') === 'true'

    if (apiKey && !isMock) {
      this.client  = new Anthropic({ apiKey })
      this.useMock = false
      this.logger.log('ChatService: using Anthropic Claude')
    } else {
      this.useMock = true
      this.logger.warn(isMock ? 'ChatService: mock mode ON' : 'ChatService: no API key — mock fallback')
    }
  }

  // ── Session management ──────────────────────────────────────────────────────

  async getOrCreateSession(sessionId?: string, guestId?: string, userId?: string) {
    if (sessionId) {
      const session = await this.prisma.aiChatSession.findUnique({
        where: { id: sessionId },
        include: { messages: { orderBy: { createdAt: 'asc' }, take: MAX_CONTEXT_MESSAGES } },
      })
      if (!session) throw new NotFoundException('Phiên chat không tồn tại')

      // Security: only allow access if guest or user matches
      if (userId && session.userId && session.userId !== userId) throw new ForbiddenException()
      if (!userId && guestId && session.guestId && session.guestId !== guestId) throw new ForbiddenException()

      return session
    }

    // Create a new session
    const session = await this.prisma.aiChatSession.create({
      data: { userId: userId ?? null, guestId: userId ? null : (guestId ?? null) },
      include: { messages: true },
    })
    return session
  }

  async getSessionMessages(sessionId: string, guestId?: string, userId?: string) {
    const session = await this.prisma.aiChatSession.findUnique({
      where: { id: sessionId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!session) throw new NotFoundException('Phiên chat không tồn tại')
    if (userId && session.userId && session.userId !== userId) throw new ForbiddenException()
    if (!userId && guestId && session.guestId && session.guestId !== guestId) throw new ForbiddenException()
    return session.messages
  }

  // ── Streaming chat ──────────────────────────────────────────────────────────

  /**
   * Stream an AI response for a user message.
   * Writes SSE events directly to `res`:
   *   data: {"token":"..."}        ← each text chunk
   *   data: {"done":true,"sessionId":"..."}  ← final event
   *   data: {"error":"..."}        ← on failure
   */
  async streamChat(opts: {
    message: string
    sessionId?: string
    guestId?: string
    userId?: string
    res: Response
  }) {
    const { message, guestId, userId, res } = opts

    // Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')  // disable nginx buffering
    res.flushHeaders?.()

    const sendEvent = (payload: object) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`)
      ;(res as any).flush?.()
    }

    try {
      const session = await this.getOrCreateSession(opts.sessionId, guestId, userId)

      // Build conversation history for the AI
      const history = session.messages.map(m => ({
        role: m.role === 'USER' ? 'user' : 'assistant' as 'user' | 'assistant',
        content: m.content,
      }))

      let fullResponse = ''

      if (this.useMock) {
        // ── Mock streaming ────────────────────────────────────────────────────
        const mockText = getMockResponse(message)
        for await (const char of mockStream(mockText)) {
          fullResponse += char
          sendEvent({ token: char })
        }
      } else {
        // ── Real Anthropic streaming ──────────────────────────────────────────
        const stream = this.client!.messages.stream({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [
            ...history,
            { role: 'user', content: message },
          ],
        })

        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            fullResponse += event.delta.text
            sendEvent({ token: event.delta.text })
          }
        }
      }

      // Save both messages to DB
      await this.prisma.aiChatMessage.createMany({
        data: [
          { sessionId: session.id, role: 'USER',      content: message       },
          { sessionId: session.id, role: 'ASSISTANT', content: fullResponse  },
        ],
      })

      // Update session updatedAt
      await this.prisma.aiChatSession.update({
        where: { id: session.id },
        data: { updatedAt: new Date() },
      })

      sendEvent({ done: true, sessionId: session.id })
    } catch (err: any) {
      this.logger.error('streamChat error', err?.message)
      sendEvent({ error: err?.message ?? 'Có lỗi xảy ra, vui lòng thử lại.' })
    } finally {
      res.end()
    }
  }
}
