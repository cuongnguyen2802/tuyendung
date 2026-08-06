import { Injectable, Logger, NotFoundException, ForbiddenException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { GoogleGenerativeAI, Content } from '@google/generative-ai'
import { Response } from 'express'
import { PrismaService } from '../prisma/prisma.service'

const MAX_CONTEXT_MESSAGES = 20

const SYSTEM_PROMPT = `Bạn là trợ lý AI của TuyenDung.vn — nền tảng tuyển dụng hàng đầu Việt Nam.
Nhiệm vụ của bạn là hỗ trợ cả ứng viên và nhà tuyển dụng với các vấn đề liên quan đến tuyển dụng.

Bạn có thể giúp:
- Ứng viên: tìm việc làm phù hợp, tư vấn viết CV chuyên nghiệp, chuẩn bị phỏng vấn, đàm phán lương, phát triển kỹ năng
- Nhà tuyển dụng: viết tin tuyển dụng hấp dẫn, xây dựng tiêu chí tuyển dụng, cải thiện quy trình tuyển chọn, thu hút nhân tài
- Chung: giải đáp thắc mắc về thị trường lao động Việt Nam, xu hướng ngành nghề, mức lương tham khảo

Phong cách:
- Trả lời ngắn gọn, thực tế, đúng trọng tâm — KHÔNG lặp lại lời chào hay giới thiệu bản thân
- Dùng tiếng Việt tự nhiên, thân thiện nhưng chuyên nghiệp
- Dùng danh sách gạch đầu dòng (•) khi liệt kê nhiều điểm
- Đề xuất tính năng cụ thể của TuyenDung.vn khi phù hợp
- Nếu câu hỏi không liên quan đến tuyển dụng, hãy khéo léo chuyển hướng về chủ đề chính`

// ── Mock responses (fallback khi không có API key) ─────────────────────────────

const MOCK_RESPONSES: Record<string, string> = {
  job: `Để tìm việc phù hợp, bạn cần:

**1. Xác định mục tiêu**
• Vị trí, ngành nghề, địa điểm mong muốn
• Mức lương kỳ vọng

**2. Chuẩn bị hồ sơ**
• CV cập nhật, tập trung vào thành tích cụ thể
• Bật **"Đang tìm việc"** trên profile TuyenDung.vn

**3. Tìm kiếm hiệu quả**
• Dùng bộ lọc: ngành, lương, kinh nghiệm, remote/onsite
• Bật thông báo việc làm mới theo keyword

Bạn đang tìm vị trí nào? Tôi tư vấn cụ thể hơn được!`,

  salary: `Mức lương tham khảo tại Việt Nam (2025):

**IT / Công nghệ**
• Junior Dev: 12–20 triệu • Senior Dev: 25–50 triệu • Lead: 50–100 triệu+

**Marketing / Sales**
• Executive: 8–15 triệu • Manager: 20–40 triệu

**Kế toán / Tài chính**
• Nhân viên: 8–15 triệu • Trưởng phòng: 20–35 triệu

**Tips đàm phán:** Đề xuất cao hơn 10-20% kỳ vọng, nhấn mạnh giá trị bạn mang lại.`,

  cv: `Bí quyết viết CV ấn tượng:

• **Tóm tắt**: 2-3 câu nêu bật điểm mạnh và mục tiêu
• **Kinh nghiệm**: Dùng số liệu cụ thể — "tăng 30% doanh thu", "quản lý 10 người"
• **Kỹ năng**: Hard skills + soft skills phù hợp vị trí
• **Độ dài**: 1-2 trang, tailored cho từng vị trí

💡 Dùng **CV Builder** của TuyenDung.vn để tạo CV đẹp miễn phí!`,

  interview: `Chuẩn bị phỏng vấn hiệu quả:

**Trước:** Nghiên cứu công ty, luyện STAR method, chuẩn bị câu hỏi ngược
**Trong:** Đến sớm 10 phút, lắng nghe kỹ, dùng ví dụ thực tế
**Câu hỏi hay gặp:** Điểm mạnh/yếu • Kỳ vọng lương • Tại sao muốn làm đây`,

  employer: `Để tuyển dụng hiệu quả:

• **Tiêu đề** rõ ràng + có mức lương cụ thể (tăng 40% ứng tuyển)
• **Mô tả** chi tiết, tránh copy mẫu chung chung
• **Quyền lợi** nổi bật: remote, thưởng, bảo hiểm
• Phản hồi ứng viên trong 3-5 ngày làm việc

Bạn đang tuyển vị trí nào?`,

  fallback: `Tôi có thể giúp bạn về:
• Tìm việc làm phù hợp
• Viết CV chuyên nghiệp
• Chuẩn bị phỏng vấn
• Tham khảo mức lương
• Đăng tin tuyển dụng

Hãy đặt câu hỏi cụ thể hơn nhé!`,
}

function getMockResponse(message: string): string {
  const lower = message.toLowerCase()
  if (lower.includes('cv') || lower.includes('hồ sơ') || lower.includes('resume')) return MOCK_RESPONSES.cv
  if (lower.includes('phỏng vấn') || lower.includes('interview')) return MOCK_RESPONSES.interview
  if (lower.includes('lương') || lower.includes('salary') || lower.includes('đàm phán')) return MOCK_RESPONSES.salary
  if (lower.includes('tìm việc') || lower.includes('tìm job') || lower.includes('việc làm') || lower.includes('muốn làm')) return MOCK_RESPONSES.job
  if (lower.includes('tuyển dụng') || lower.includes('đăng tin') || lower.includes('employer')) return MOCK_RESPONSES.employer
  return MOCK_RESPONSES.fallback
}

async function* mockStream(text: string, delayMs = 15) {
  for (const char of text) {
    yield char
    await new Promise(r => setTimeout(r, delayMs))
  }
}

// ── Service ────────────────────────────────────────────────────────────────────

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name)
  private genAI: GoogleGenerativeAI | null = null
  private readonly useMock: boolean

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    const apiKey = config.get<string>('GEMINI_API_KEY')
    const isMock  = config.get<string>('AI_MOCK') === 'true'

    if (apiKey && !isMock) {
      this.genAI   = new GoogleGenerativeAI(apiKey)
      this.useMock = false
      this.logger.log('ChatService: using Google Gemini')
    } else {
      this.useMock = true
      this.logger.warn(isMock ? 'ChatService: mock mode ON' : 'ChatService: no GEMINI_API_KEY — mock fallback')
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
      if (userId && session.userId && session.userId !== userId) throw new ForbiddenException()
      if (!userId && guestId && session.guestId && session.guestId !== guestId) throw new ForbiddenException()
      return session
    }

    return this.prisma.aiChatSession.create({
      data: { userId: userId ?? null, guestId: userId ? null : (guestId ?? null) },
      include: { messages: true },
    })
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

  async streamChat(opts: {
    message:   string
    sessionId?: string
    guestId?:  string
    userId?:   string
    res:       Response
  }) {
    const { message, guestId, userId, res } = opts

    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8')
    res.setHeader('Cache-Control', 'no-cache, no-transform')
    res.setHeader('Connection', 'keep-alive')
    res.setHeader('X-Accel-Buffering', 'no')
    res.flushHeaders?.()

    const sendEvent = (payload: object) => {
      res.write(`data: ${JSON.stringify(payload)}\n\n`)
      ;(res as any).flush?.()
    }

    try {
      const session      = await this.getOrCreateSession(opts.sessionId, guestId, userId)
      let   fullResponse = ''

      if (this.useMock) {
        // ── Mock streaming ──────────────────────────────────────────────────
        const mockText = getMockResponse(message)
        for await (const char of mockStream(mockText)) {
          fullResponse += char
          sendEvent({ token: char })
        }
      } else {
        // ── Gemini streaming ────────────────────────────────────────────────
        const model = this.genAI!.getGenerativeModel({
          model: 'gemini-2.0-flash',
          systemInstruction: SYSTEM_PROMPT,
        })

        // Convert stored messages to Gemini history format
        // Gemini uses 'user' / 'model' roles (not 'assistant')
        const history: Content[] = session.messages.map(m => ({
          role: m.role === 'USER' ? 'user' : 'model',
          parts: [{ text: m.content }],
        }))

        const chat   = model.startChat({ history })
        const result = await chat.sendMessageStream(message)

        for await (const chunk of result.stream) {
          const text = chunk.text()
          if (text) {
            fullResponse += text
            sendEvent({ token: text })
          }
        }
      }

      // Persist both messages
      await this.prisma.aiChatMessage.createMany({
        data: [
          { sessionId: session.id, role: 'USER',      content: message       },
          { sessionId: session.id, role: 'ASSISTANT', content: fullResponse  },
        ],
      })
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
