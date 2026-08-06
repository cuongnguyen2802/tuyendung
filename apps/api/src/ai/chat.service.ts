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
  job: `Để tìm việc phù hợp, bạn cần làm rõ một số điểm:

**1. Xác định mục tiêu**
• Vị trí bạn nhắm đến là gì? (Senior, Junior, Manager...)
• Ngành nghề ưu tiên?
• Địa điểm: Hà Nội, TP.HCM hay remote?

**2. Chuẩn bị hồ sơ**
• CV cập nhật, tập trung vào thành tích cụ thể
• LinkedIn đầy đủ thông tin, ảnh chuyên nghiệp

**3. Tìm kiếm hiệu quả trên TuyenDung.vn**
• Dùng bộ lọc: ngành nghề, mức lương, kinh nghiệm
• Bật **Thông báo việc làm** để nhận tin mới mỗi ngày
• Đánh dấu ❤️ các tin yêu thích để theo dõi

Bạn đang tìm vị trí nào? Tôi có thể tư vấn cụ thể hơn!`,

  salary: `Mức lương tham khảo tại thị trường Việt Nam (2025):

**IT / Công nghệ**
• Junior Dev: 12–20 triệu
• Senior Dev: 25–50 triệu
• Tech Lead / Architect: 50–100 triệu+

**Marketing / Sales**
• Executive: 8–15 triệu
• Manager: 20–40 triệu

**Kế toán / Tài chính**
• Nhân viên: 8–15 triệu
• Trưởng phòng: 20–35 triệu

**Mẹo đàm phán lương:**
• Nghiên cứu mức lương thị trường trước
• Đề xuất mức cao hơn 10-20% kỳ vọng thực tế
• Nhấn mạnh vào giá trị bạn mang lại, không chỉ kinh nghiệm`,

  cv: `Bí quyết viết CV ấn tượng:

• **Thông tin cá nhân**: Họ tên, email chuyên nghiệp, SĐT, LinkedIn
• **Tóm tắt nghề nghiệp**: 2-3 câu nêu bật điểm mạnh và mục tiêu
• **Kinh nghiệm**: Dùng con số cụ thể — "tăng 30% doanh thu", "quản lý team 10 người"
• **Kỹ năng**: Hard skills + soft skills phù hợp vị trí ứng tuyển
• **Học vấn**: Trường, chuyên ngành, năm tốt nghiệp

**Lưu ý quan trọng:**
• Giữ CV trong 1-2 trang
• Tailored CV cho từng vị trí, đừng dùng CV chung
• Xuất PDF, đặt tên file rõ ràng: "HoTen_ViTri_CV.pdf"

💡 Dùng **CV Builder** của TuyenDung.vn để tạo CV đẹp miễn phí!`,

  interview: `Chuẩn bị phỏng vấn hiệu quả:

**Trước buổi phỏng vấn:**
• Nghiên cứu kỹ công ty: sản phẩm, văn hóa, tin tức gần đây
• Luyện tập câu trả lời theo phương pháp STAR
• Chuẩn bị 2-3 câu hỏi để hỏi lại nhà tuyển dụng

**Trong buổi phỏng vấn:**
• Đến sớm 10-15 phút
• Lắng nghe kỹ, không ngắt lời
• Dùng ví dụ thực tế để minh họa

**Câu hỏi thường gặp:**
• "Điểm mạnh/yếu của bạn?" → Chuẩn bị trả lời trung thực + giải pháp cải thiện
• "Kỳ vọng lương?" → Nghiên cứu thị trường trước, đưa ra khoảng
• "Tại sao muốn làm ở đây?" → Thể hiện hiểu biết về công ty`,

  employer: `Để tuyển dụng hiệu quả trên TuyenDung.vn:

**Viết tin tuyển dụng hấp dẫn:**
• Tiêu đề rõ ràng, có mức lương cụ thể (tăng 40% ứng tuyển)
• Mô tả công việc chi tiết, tránh copy mẫu chung chung
• Nêu rõ quyền lợi nổi bật: remote, thưởng, bảo hiểm...

**Quy trình tuyển chọn:**
• Phản hồi ứng viên trong 3-5 ngày làm việc
• Phỏng vấn tối đa 2-3 vòng
• Gửi offer letter bằng văn bản rõ ràng

Bạn đang tuyển vị trí nào? Tôi có thể giúp tối ưu tin đăng!`,

  fallback: `Tôi hiểu bạn đang cần hỗ trợ về vấn đề này.

Hiện tôi đang chạy ở chế độ demo. Để nhận câu trả lời chính xác và chi tiết nhất, vui lòng liên hệ:
• **Hotline**: 1900 1234 (T2-T6, 8:00-18:00)
• **Email**: support@tuyendung.vn

Hoặc thử hỏi tôi về: **tìm việc**, **viết CV**, **chuẩn bị phỏng vấn**, **mức lương**, **đăng tuyển dụng**.`,
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('cv') || lower.includes('hồ sơ') || lower.includes('resume')) return MOCK_RESPONSES.cv
  if (lower.includes('phỏng vấn') || lower.includes('interview')) return MOCK_RESPONSES.interview
  if (lower.includes('lương') || lower.includes('salary') || lower.includes('tiền') || lower.includes('đàm phán')) return MOCK_RESPONSES.salary
  if (lower.includes('tìm việc') || lower.includes('tìm job') || lower.includes('việc làm') || lower.includes('tuyển dụng') || lower.includes('ứng tuyển')) return MOCK_RESPONSES.job
  if (lower.includes('nhà tuyển dụng') || lower.includes('đăng tin') || lower.includes('tuyển nhân') || lower.includes('employer')) return MOCK_RESPONSES.employer
  return MOCK_RESPONSES.fallback
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
