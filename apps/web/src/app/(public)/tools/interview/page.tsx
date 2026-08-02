'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import {
  ClipboardListIcon, BrainIcon, UsersIcon, MessageSquareIcon,
  ChevronDownIcon, CheckCircleIcon, ArrowRightIcon, StarIcon,
} from 'lucide-react'

// ── Data ──────────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { id: 'general', label: 'Câu hỏi chung', Icon: UsersIcon },
  { id: 'hr',      label: 'HR / Hành vi',   Icon: MessageSquareIcon },
  { id: 'tech',    label: 'Chuyên môn',      Icon: BrainIcon },
  { id: 'tips',    label: 'Mẹo & checklist', Icon: ClipboardListIcon },
]

const QA: Record<string, Array<{ q: string; a: string }>> = {
  general: [
    {
      q: 'Hãy giới thiệu về bản thân bạn.',
      a: 'Trình bày theo công thức Present–Past–Future: hiện tại bạn đang làm gì / chuyên môn gì, trước đây bạn đã làm gì và đạt kết quả gì, tương lai bạn muốn đóng góp gì cho vị trí này. Giữ trong 60–90 giây.',
    },
    {
      q: 'Tại sao bạn muốn làm việc tại công ty chúng tôi?',
      a: 'Nghiên cứu kỹ về công ty trước (sản phẩm, văn hóa, tin tức gần đây) và kết nối với mục tiêu nghề nghiệp của bạn. Tránh trả lời chung chung như "công ty có tiếng" hay "lương cao".',
    },
    {
      q: 'Điểm mạnh lớn nhất của bạn là gì?',
      a: 'Chọn 1–2 điểm mạnh thực sự liên quan đến vị trí ứng tuyển và minh chứng bằng ví dụ cụ thể (số liệu, kết quả). Không nêu điểm mạnh chung chung hoặc quá "hoàn hảo".',
    },
    {
      q: 'Điểm yếu của bạn là gì?',
      a: 'Nêu một điểm yếu thật nhưng không quá nghiêm trọng với công việc, sau đó quan trọng hơn là nói về cách bạn đang cải thiện nó. Điều này thể hiện sự tự nhận thức và khả năng phát triển.',
    },
    {
      q: 'Kỳ vọng lương của bạn là bao nhiêu?',
      a: 'Nếu có thể, hỏi lại ngân sách họ đặt ra trước. Nếu phải trả lời, hãy đưa ra một khoảng (range) dựa trên nghiên cứu thị trường và nêu rõ bạn coi trọng tổng thể gói phúc lợi, không chỉ lương cứng.',
    },
  ],
  hr: [
    {
      q: 'Kể về một lần bạn xử lý xung đột với đồng nghiệp.',
      a: 'Dùng cấu trúc STAR (Situation – Task – Action – Result). Mô tả tình huống cụ thể, vai trò của bạn, hành động bạn đã thực hiện (tập trung vào giao tiếp và lắng nghe), và kết quả đạt được.',
    },
    {
      q: 'Kể về lần bạn thất bại và bài học rút ra.',
      a: 'Chọn một thất bại có thật nhưng không quá nghiêm trọng. Tập trung vào những gì bạn đã học được và cách bạn áp dụng bài học đó sau này. Điều này thể hiện sự trưởng thành và tư duy phát triển.',
    },
    {
      q: 'Bạn xử lý áp lực và deadline như thế nào?',
      a: 'Đưa ra ví dụ thực tế về cách bạn ưu tiên công việc, giao tiếp với team khi gặp vấn đề, và các công cụ/phương pháp bạn dùng để quản lý thời gian hiệu quả.',
    },
    {
      q: 'Sau 3–5 năm, bạn thấy mình ở đâu?',
      a: 'Kết nối lộ trình phát triển của bạn với vị trí và công ty này. Thể hiện sự tham vọng nhưng thực tế, và tránh đề cập tới việc tự mở công ty hay chuyển sang đối thủ.',
    },
    {
      q: 'Bạn làm việc tốt hơn trong team hay độc lập?',
      a: 'Hầu hết vị trí cần cả hai. Hãy nêu bạn thoải mái với cả hai hình thức, sau đó điều chỉnh tùy yêu cầu vị trí. Minh chứng bằng ví dụ về cả hai.',
    },
  ],
  tech: [
    {
      q: 'Quy trình làm việc khi nhận một dự án mới của bạn là gì?',
      a: 'Trình bày quy trình có cấu trúc: thu thập yêu cầu → phân tích → lên kế hoạch → thực hiện → kiểm tra → báo cáo. Nhấn mạnh khả năng giao tiếp với stakeholder và quản lý rủi ro.',
    },
    {
      q: 'Bạn cập nhật kiến thức chuyên môn như thế nào?',
      a: 'Kể cụ thể: theo dõi blog/newsletter nào, tham gia cộng đồng nào, học khóa học nào, đọc sách gì, tham dự sự kiện gì. Điều này thể hiện sự chủ động trong việc phát triển bản thân.',
    },
    {
      q: 'Kể về dự án kỹ thuật/chuyên môn bạn tự hào nhất.',
      a: 'Dùng STAR: Bối cảnh dự án, vai trò và trách nhiệm cụ thể của bạn, những thách thức kỹ thuật bạn đã giải quyết, và kết quả định lượng được (tăng X%, giảm Y%, phục vụ Z người dùng).',
    },
    {
      q: 'Bạn xử lý feedback/code review như thế nào?',
      a: 'Thể hiện sự cởi mở với feedback, khả năng đặt câu hỏi để hiểu rõ hơn, và cách bạn cải thiện dựa trên góp ý. Đồng thời, bạn cũng sẵn sàng bảo vệ quyết định của mình với lý lẽ rõ ràng.',
    },
  ],
  tips: [],
}

const TIPS = [
  { category: 'Chuẩn bị', items: [
    'Nghiên cứu kỹ về công ty: sản phẩm, văn hóa, tin tức gần đây, đối thủ cạnh tranh',
    'Đọc kỹ JD và chuẩn bị ví dụ cho từng yêu cầu chính',
    'Chuẩn bị 3–5 câu hỏi thông minh để hỏi nhà tuyển dụng',
    'Luyện tập trả lời 10 câu hỏi phổ biến (nói to hoặc quay video)',
    'Chuẩn bị 3–5 tình huống STAR cụ thể từ kinh nghiệm của bạn',
  ]},
  { category: 'Trong buổi phỏng vấn', items: [
    'Đến sớm 10–15 phút hoặc vào phòng họp online trước 5 phút',
    'Nghe kỹ câu hỏi, nếu chưa hiểu hãy hỏi lại trước khi trả lời',
    'Trả lời cụ thể, dùng số liệu khi có thể, tránh câu trả lời quá dài',
    'Duy trì giao tiếp bằng mắt và ngôn ngữ cơ thể tự tin',
    'Ghi chép ngắn gọn những điểm quan trọng của cuộc trò chuyện',
  ]},
  { category: 'Sau phỏng vấn', items: [
    'Gửi email cảm ơn trong vòng 24 giờ, nhắc lại điểm bạn ấn tượng',
    'Ghi lại những câu hỏi khó để chuẩn bị tốt hơn cho lần sau',
    'Nếu chưa nhận hồi âm sau 1 tuần, hãy follow up lịch sự',
    'Đánh giá trung thực buổi phỏng vấn để rút kinh nghiệm',
  ]},
]

function QAAccordion({ items }: { items: Array<{ q: string; a: string }> }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          <button
            className="flex w-full items-center justify-between px-5 py-4 text-left"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <span className="pr-4 text-sm font-semibold text-gray-900">{item.q}</span>
            <ChevronDownIcon className={cn(
              'h-4 w-4 shrink-0 text-gray-400 transition-transform',
              open === i && 'rotate-180',
            )} />
          </button>
          {open === i && (
            <div className="border-t border-gray-50 bg-gray-50/50 px-5 py-4">
              <p className="text-sm leading-relaxed text-gray-600">{item.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function InterviewToolPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#042616] to-[#0a3d20] py-14 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold">
            <StarIcon className="h-3.5 w-3.5 text-amber-400" />
            Cẩm nang phỏng vấn
          </div>
          <h1 className="mb-3 text-3xl font-extrabold md:text-4xl">Chuẩn bị phỏng vấn thành công</h1>
          <p className="text-white/60">
            Câu hỏi thường gặp, gợi ý trả lời và checklist chuẩn bị đầy đủ
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        {/* Tabs */}
        <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
          {CATEGORIES.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={cn(
                'flex shrink-0 items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition',
                activeTab === id
                  ? 'border-brand bg-brand/5 text-brand'
                  : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Q&A tabs */}
        {activeTab !== 'tips' && (
          <div>
            <p className="mb-4 text-sm text-gray-500">
              Nhấn vào từng câu hỏi để xem gợi ý trả lời
            </p>
            <QAAccordion items={QA[activeTab] ?? []} />
          </div>
        )}

        {/* Tips tab */}
        {activeTab === 'tips' && (
          <div className="space-y-5">
            {TIPS.map(({ category, items }) => (
              <div key={category} className="rounded-2xl border border-gray-100 bg-white p-6">
                <h3 className="mb-4 font-bold text-gray-900">{category}</h3>
                <ul className="space-y-2.5">
                  {items.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                      <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-8 rounded-2xl bg-gradient-to-r from-brand/5 to-emerald-50 border border-brand/10 p-6">
          <h3 className="mb-2 font-bold text-gray-900">Sẵn sàng ứng tuyển chưa?</h3>
          <p className="mb-4 text-sm text-gray-600">
            Tìm những cơ hội việc làm phù hợp và áp dụng những gì bạn vừa học!
          </p>
          <Link
            href="/jobs"
            className="inline-flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand/90"
          >
            Xem việc làm ngay <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  )
}
