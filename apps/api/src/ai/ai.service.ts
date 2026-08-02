import { Injectable, Logger, BadRequestException } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Anthropic from '@anthropic-ai/sdk'
import { JobType, WorkMode } from '@tuyendung/types'

export interface ParsedJD {
  title?: string
  description?: string
  requirements?: string
  benefits?: string
  city?: string
  location?: string
  jobType?: JobType
  workMode?: WorkMode
  salaryMin?: number
  salaryMax?: number
  salaryNegotiable?: boolean
  experienceMin?: number
}

export interface AISuggestParams {
  position: string
  categoryId?: string
  experienceMin?: number
  skills?: string[]
  context?: string
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)
  private client: Anthropic | null = null

  private useMock: boolean

  constructor(private config: ConfigService) {
    const apiKey = config.get<string>('ANTHROPIC_API_KEY')
    const mockMode = config.get<string>('AI_MOCK') === 'true'

    if (apiKey && !mockMode) {
      this.client = new Anthropic({ apiKey })
      this.useMock = false
      this.logger.log('AI: using Anthropic Claude')
    } else {
      this.useMock = true
      this.logger.warn(mockMode ? 'AI: mock mode ON (AI_MOCK=true)' : 'AI: ANTHROPIC_API_KEY not set — falling back to mock')
    }
  }

  private ensureClient(): Anthropic {
    if (!this.client) throw new BadRequestException('Tính năng AI chưa được cấu hình.')
    return this.client
  }

  // ── Mock data ──────────────────────────────────────────────────────────────

  private mockParseJD(text: string): ParsedJD {
    const lower = text.toLowerCase()
    const isRemote = lower.includes('remote') || lower.includes('từ xa')
    const isPartTime = lower.includes('part-time') || lower.includes('bán thời gian')
    return {
      title: 'Senior Frontend Developer',
      city: 'Hà Nội',
      location: 'Quận Cầu Giấy, Hà Nội',
      jobType: isPartTime ? JobType.PART_TIME : JobType.FULL_TIME,
      workMode: isRemote ? WorkMode.REMOTE : WorkMode.HYBRID,
      salaryMin: 20_000_000,
      salaryMax: 35_000_000,
      experienceMin: 3,
      description: `<p>Chúng tôi đang tìm kiếm <strong>Senior Frontend Developer</strong> tài năng để gia nhập đội ngũ kỹ thuật năng động.</p>
<ul>
  <li>Phát triển và duy trì các ứng dụng web hiệu suất cao</li>
  <li>Tham gia thiết kế kiến trúc frontend và đưa ra các quyết định kỹ thuật</li>
  <li>Cộng tác với đội ngũ Backend, Designer và Product Manager</li>
  <li>Review code và hướng dẫn các thành viên junior trong nhóm</li>
</ul>`,
      requirements: `<ul>
  <li>Tối thiểu 3 năm kinh nghiệm với React / Next.js</li>
  <li>Thành thạo TypeScript, HTML5, CSS3</li>
  <li>Hiểu biết sâu về REST API và GraphQL</li>
  <li>Kinh nghiệm với Git, CI/CD pipeline</li>
  <li>Kỹ năng giao tiếp tốt, làm việc nhóm hiệu quả</li>
</ul>`,
      benefits: `<ul>
  <li>Lương cạnh tranh: 20 – 35 triệu VND</li>
  <li>Thưởng dự án và thưởng cuối năm hấp dẫn</li>
  <li>Bảo hiểm sức khỏe cao cấp cho bản thân và gia đình</li>
  <li>Làm việc hybrid: 3 ngày văn phòng / 2 ngày remote</li>
  <li>Ngân sách học tập & phát triển cá nhân 5 triệu/năm</li>
</ul>`,
    }
  }

  private mockSuggestJD(params: AISuggestParams): ParsedJD {
    const { position, experienceMin, skills } = params
    const expText = experienceMin ? `${experienceMin} năm` : 'phù hợp'
    const skillText = skills?.length ? skills.slice(0, 3).join(', ') : 'các công nghệ liên quan'
    return {
      title: position,
      description: `<p>Chúng tôi đang tìm kiếm <strong>${position}</strong> có kinh nghiệm ${expText} để tham gia vào các dự án thú vị và có tầm ảnh hưởng lớn.</p>
<h3>Bạn sẽ làm gì?</h3>
<ul>
  <li>Tham gia trực tiếp vào quá trình phát triển sản phẩm từ ý tưởng đến triển khai</li>
  <li>Làm việc với ${skillText} trong môi trường Agile năng động</li>
  <li>Đề xuất và áp dụng các giải pháp kỹ thuật tối ưu</li>
  <li>Phối hợp chặt chẽ với các team liên quan để đảm bảo chất lượng sản phẩm</li>
</ul>`,
      requirements: `<ul>
  <li>Kinh nghiệm ${expText} ở vị trí ${position} hoặc tương đương</li>
  <li>Thành thạo ${skillText}</li>
  <li>Tư duy logic, khả năng phân tích và giải quyết vấn đề tốt</li>
  <li>Có tinh thần trách nhiệm, chủ động trong công việc</li>
  <li>Kỹ năng giao tiếp và làm việc nhóm tốt</li>
  <li>Ưu tiên ứng viên có portfolio hoặc dự án thực tế</li>
</ul>`,
      benefits: `<ul>
  <li>Mức lương cạnh tranh, xem xét tăng lương định kỳ 6 tháng/lần</li>
  <li>Thưởng hiệu suất và thưởng dự án</li>
  <li>Bảo hiểm xã hội, bảo hiểm y tế theo quy định</li>
  <li>Môi trường làm việc trẻ trung, sáng tạo và cởi mở</li>
  <li>Hỗ trợ đào tạo và phát triển chuyên môn</li>
  <li>Team building, du lịch hàng năm</li>
</ul>`,
    }
  }

  async parseJD(text: string): Promise<ParsedJD> {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 1200))
      return this.mockParseJD(text)
    }
    const client = this.ensureClient()

    const systemPrompt = `Bạn là hệ thống trích xuất thông tin từ Job Description (JD).
Phân tích đoạn văn bản JD và trả về JSON với các trường sau (bỏ qua nếu không có):
- title: string — tên vị trí tuyển dụng
- city: string — thành phố làm việc (một trong các tỉnh/thành Việt Nam)
- location: string — địa chỉ cụ thể
- jobType: "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERNSHIP" | "FREELANCE"
- workMode: "ONSITE" | "REMOTE" | "HYBRID"
- salaryMin: number — lương tối thiểu (VND, số nguyên)
- salaryMax: number — lương tối đa (VND, số nguyên)
- salaryNegotiable: boolean — true nếu lương thỏa thuận
- experienceMin: number — số năm kinh nghiệm tối thiểu
- description: string — mô tả công việc dưới dạng HTML (dùng <ul><li> cho danh sách)
- requirements: string — yêu cầu ứng viên dưới dạng HTML
- benefits: string — quyền lợi dưới dạng HTML

Chỉ trả về JSON, không giải thích thêm.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: `Phân tích JD sau:\n\n${text.slice(0, 8000)}` }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new BadRequestException('Không thể phân tích nội dung JD. Vui lòng kiểm tra lại định dạng.')

    try {
      return JSON.parse(jsonMatch[0]) as ParsedJD
    } catch {
      throw new BadRequestException('Kết quả phân tích không hợp lệ. Vui lòng thử lại.')
    }
  }

  async suggestJD(params: AISuggestParams): Promise<ParsedJD> {
    if (this.useMock) {
      await new Promise(r => setTimeout(r, 1800))
      return this.mockSuggestJD(params)
    }
    const client = this.ensureClient()

    const { position, experienceMin, skills, context } = params
    const skillsText  = skills?.length ? `Kỹ năng/Công nghệ: ${skills.join(', ')}` : ''
    const expText     = experienceMin != null ? `Kinh nghiệm tối thiểu: ${experienceMin} năm` : ''
    const contextText = context ? `Ghi chú thêm: ${context}` : ''

    const userPrompt = [
      `Tạo nội dung JD cho vị trí: **${position}**`,
      expText, skillsText, contextText,
    ].filter(Boolean).join('\n')

    const systemPrompt = `Bạn là chuyên gia HR tại Việt Nam, chuyên viết JD hấp dẫn và chuyên nghiệp.
Tạo nội dung JD bằng tiếng Việt cho vị trí được yêu cầu.
Trả về JSON với đúng 3 trường:
- description: string — mô tả chi tiết công việc, dùng HTML (<h3>, <ul><li>, <p>), khoảng 200-350 từ
- requirements: string — yêu cầu ứng viên dạng HTML, 6-10 điểm dạng <ul><li>
- benefits: string — quyền lợi hấp dẫn dạng HTML, 5-8 điểm dạng <ul><li>

Nội dung phải cụ thể, không chung chung. Chỉ trả về JSON thuần, không markdown code block.`

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    })

    const raw = message.content[0].type === 'text' ? message.content[0].text : ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new BadRequestException('AI không thể tạo nội dung. Vui lòng thử lại.')

    try {
      const result = JSON.parse(jsonMatch[0]) as Pick<ParsedJD, 'description' | 'requirements' | 'benefits'>
      return { ...result, title: position }
    } catch {
      throw new BadRequestException('Kết quả AI không hợp lệ. Vui lòng thử lại.')
    }
  }
}
