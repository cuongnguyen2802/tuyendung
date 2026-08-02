'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { ArrowRightIcon, ArrowLeftIcon, RefreshCcwIcon, CompassIcon } from 'lucide-react'

// ── Career categories ──────────────────────────────────────────────────────────

const CAREERS = {
  tech:       { label: 'Công nghệ & Phần mềm',  emoji: '💻', desc: 'Lập trình, phân tích dữ liệu, AI, DevOps, bảo mật. Ngành có nhu cầu tuyển dụng cao nhất hiện nay với mức lương hấp dẫn.' },
  creative:   { label: 'Sáng tạo & Truyền thông', emoji: '🎨', desc: 'Thiết kế đồ họa, content marketing, copywriting, sản xuất video. Phù hợp người có tư duy sáng tạo và thẩm mỹ.' },
  business:   { label: 'Kinh doanh & Bán hàng',  emoji: '📈', desc: 'Sales, business development, account management. Phù hợp người thích kết nối, đàm phán và đạt mục tiêu doanh số.' },
  finance:    { label: 'Tài chính & Kế toán',    emoji: '💰', desc: 'Kế toán, kiểm toán, phân tích tài chính, đầu tư. Đòi hỏi tư duy phân tích số liệu và chú ý đến chi tiết.' },
  people:     { label: 'Nhân sự & Phát triển',   emoji: '🤝', desc: 'HR, L&D, tuyển dụng, văn hóa doanh nghiệp. Phù hợp người thích làm việc với con người và xây dựng tổ chức.' },
  operations: { label: 'Vận hành & Logistics',   emoji: '⚙️', desc: 'Quản lý chuỗi cung ứng, vận hành, sản xuất. Phù hợp người có tư duy hệ thống và kỹ năng tổ chức tốt.' },
  healthcare: { label: 'Y tế & Chăm sóc sức khỏe', emoji: '🏥', desc: 'Y, dược, điều dưỡng, thiết bị y tế. Ngành có ý nghĩa xã hội lớn và nhu cầu nhân lực ổn định.' },
  education:  { label: 'Giáo dục & Đào tạo',     emoji: '📚', desc: 'Giảng dạy, huấn luyện, thiết kế chương trình học. Phù hợp người có khả năng truyền đạt và kiên nhẫn.' },
} as const

type CareerKey = keyof typeof CAREERS

// ── Quiz questions ─────────────────────────────────────────────────────────────

interface Question {
  q: string
  options: { label: string; scores: Partial<Record<CareerKey, number>> }[]
}

const QUESTIONS: Question[] = [
  {
    q: 'Bạn thích loại công việc nào nhất?',
    options: [
      { label: '🔧 Giải quyết vấn đề kỹ thuật phức tạp',       scores: { tech: 3, finance: 1, operations: 1 } },
      { label: '🎨 Tạo ra những thứ đẹp và ấn tượng',           scores: { creative: 3, education: 1 } },
      { label: '💬 Thuyết phục và xây dựng quan hệ',            scores: { business: 3, people: 2 } },
      { label: '📊 Phân tích dữ liệu và đưa ra quyết định',     scores: { finance: 3, tech: 1, operations: 1 } },
    ],
  },
  {
    q: 'Môi trường làm việc lý tưởng của bạn?',
    options: [
      { label: '🚀 Startup năng động, thay đổi liên tục',        scores: { tech: 2, creative: 2, business: 1 } },
      { label: '🏢 Doanh nghiệp lớn, quy trình rõ ràng',         scores: { finance: 2, operations: 2, people: 1 } },
      { label: '🏠 Làm việc từ xa, linh hoạt thời gian',          scores: { creative: 2, tech: 2 } },
      { label: '🏫 Có sứ mệnh xã hội rõ ràng',                   scores: { healthcare: 2, education: 2, people: 1 } },
    ],
  },
  {
    q: 'Kỹ năng nào bạn tự tin nhất?',
    options: [
      { label: '🧠 Tư duy logic, lập trình hoặc phân tích',      scores: { tech: 3, finance: 2 } },
      { label: '✍️ Viết lách, kể chuyện, thuyết trình',          scores: { creative: 2, education: 2, business: 1 } },
      { label: '🤝 Lắng nghe, đồng cảm, giải quyết xung đột',    scores: { people: 3, healthcare: 2 } },
      { label: '📋 Tổ chức, lập kế hoạch, quản lý dự án',        scores: { operations: 3, finance: 1, business: 1 } },
    ],
  },
  {
    q: 'Điều gì quan trọng nhất với bạn trong công việc?',
    options: [
      { label: '💵 Thu nhập cao và cơ hội tăng lương nhanh',     scores: { tech: 2, finance: 2, business: 2 } },
      { label: '🌟 Được thể hiện bản thân và sáng tạo',          scores: { creative: 3, education: 1 } },
      { label: '❤️ Tạo ra giá trị và ý nghĩa cho xã hội',        scores: { healthcare: 3, education: 2, people: 1 } },
      { label: '📈 Lộ trình thăng tiến rõ ràng và ổn định',      scores: { finance: 2, operations: 2, people: 1 } },
    ],
  },
  {
    q: 'Bạn xử lý áp lực như thế nào?',
    options: [
      { label: '🎯 Chia nhỏ vấn đề và giải quyết từng bước',     scores: { tech: 2, finance: 1, operations: 2 } },
      { label: '💡 Tìm kiếm giải pháp sáng tạo, cách tiếp cận mới', scores: { creative: 2, business: 2 } },
      { label: '👥 Nhờ team hỗ trợ và làm việc cùng nhau',       scores: { people: 2, operations: 1, healthcare: 1 } },
      { label: '📚 Nghiên cứu kỹ trước khi quyết định',          scores: { finance: 2, education: 2, healthcare: 1 } },
    ],
  },
  {
    q: 'Bạn muốn ảnh hưởng đến ai nhiều nhất qua công việc?',
    options: [
      { label: '🏢 Tổ chức và doanh nghiệp',                      scores: { business: 2, finance: 2, operations: 2 } },
      { label: '👨‍💻 Cộng đồng công nghệ và người dùng sản phẩm',  scores: { tech: 3, creative: 1 } },
      { label: '🧑‍🤝‍🧑 Cá nhân và cộng đồng xung quanh',              scores: { healthcare: 2, education: 3, people: 1 } },
      { label: '🌍 Xã hội và cộng đồng rộng lớn hơn',            scores: { education: 2, healthcare: 2, creative: 1 } },
    ],
  },
]

// ── Score calculator ───────────────────────────────────────────────────────────

function calcResults(answers: number[]): [CareerKey, number][] {
  const scores: Record<string, number> = {}
  answers.forEach((ans, qi) => {
    const q = QUESTIONS[qi]
    if (ans === -1) return
    const opt = q.options[ans]
    for (const [k, v] of Object.entries(opt.scores)) {
      scores[k] = (scores[k] ?? 0) + v
    }
  })
  return Object.entries(scores)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3) as [CareerKey, number][]
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function CareerTestPage() {
  const [step, setStep]       = useState<'intro' | 'quiz' | 'result'>('intro')
  const [current, setCurrent] = useState(0)
  const [answers, setAnswers] = useState<number[]>(new Array(QUESTIONS.length).fill(-1))

  function selectAnswer(optIdx: number) {
    const next = [...answers]
    next[current] = optIdx
    setAnswers(next)
  }

  function goNext() {
    if (current < QUESTIONS.length - 1) setCurrent(c => c + 1)
    else setStep('result')
  }

  function goPrev() {
    if (current > 0) setCurrent(c => c - 1)
  }

  function restart() {
    setAnswers(new Array(QUESTIONS.length).fill(-1))
    setCurrent(0)
    setStep('intro')
  }

  const results = step === 'result' ? calcResults(answers) : []
  const progress = Math.round((current / QUESTIONS.length) * 100)

  // ── Intro ──
  if (step === 'intro') {
    return (
      <div className="min-h-screen bg-gray-50/40">
        <div className="bg-gradient-to-br from-[#042616] to-[#0a3d20] py-14 text-white">
          <div className="mx-auto max-w-3xl px-4 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold">
              <CompassIcon className="h-3.5 w-3.5 text-amber-400" />
              Trắc nghiệm hướng nghiệp
            </div>
            <h1 className="mb-3 text-3xl font-extrabold md:text-4xl">Khám phá nghề nghiệp phù hợp</h1>
            <p className="text-white/60">
              6 câu hỏi nhanh để tìm ra ngành nghề phù hợp với tính cách và kỹ năng của bạn
            </p>
          </div>
        </div>
        <div className="mx-auto max-w-xl px-4 py-12">
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm text-center">
            <div className="mb-6 text-6xl">🧭</div>
            <h2 className="mb-3 text-xl font-bold text-gray-900">Bạn phù hợp với ngành gì?</h2>
            <p className="mb-8 text-sm leading-relaxed text-gray-500">
              Không có câu trả lời đúng hay sai. Hãy chọn câu trả lời phản ánh đúng nhất cảm nhận và sở thích thực sự của bạn để có kết quả chính xác nhất.
            </p>
            <div className="mb-8 grid grid-cols-4 gap-3 text-center text-xs text-gray-500">
              {[['6', 'câu hỏi'], ['2 phút', 'hoàn thành'], ['8', 'ngành nghề'], ['Miễn phí', '100%']].map(([v, l]) => (
                <div key={l} className="rounded-xl bg-gray-50 p-3">
                  <div className="text-lg font-bold text-gray-800">{v}</div>
                  <div>{l}</div>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep('quiz')}
              className="inline-flex items-center gap-2 rounded-xl bg-brand px-8 py-3.5 text-sm font-bold text-white hover:bg-brand/90"
            >
              Bắt đầu ngay <ArrowRightIcon className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Quiz ──
  if (step === 'quiz') {
    const q = QUESTIONS[current]
    return (
      <div className="min-h-screen bg-gray-50/40 py-10">
        <div className="mx-auto max-w-xl px-4">
          {/* Progress */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="font-semibold text-gray-700">Câu {current + 1}/{QUESTIONS.length}</span>
              <span className="text-gray-400">{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question */}
          <div className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
            <h2 className="mb-6 text-lg font-bold text-gray-900">{q.q}</h2>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <button
                  key={i}
                  onClick={() => selectAnswer(i)}
                  className={cn(
                    'w-full rounded-xl border px-5 py-3.5 text-left text-sm font-medium transition',
                    answers[current] === i
                      ? 'border-brand bg-brand/5 text-brand ring-2 ring-brand/20'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50',
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="mt-7 flex gap-3">
              {current > 0 && (
                <button
                  onClick={goPrev}
                  className="flex items-center gap-1.5 rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  <ArrowLeftIcon className="h-4 w-4" /> Quay lại
                </button>
              )}
              <button
                onClick={goNext}
                disabled={answers[current] === -1}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-brand px-4 py-3 text-sm font-bold text-white hover:bg-brand/90 disabled:opacity-50"
              >
                {current < QUESTIONS.length - 1 ? 'Tiếp theo' : 'Xem kết quả'}
                <ArrowRightIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Result ──
  return (
    <div className="min-h-screen bg-gray-50/40 py-10">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-6 text-center">
          <div className="mb-2 text-4xl">{results[0] ? CAREERS[results[0][0]].emoji : '🎯'}</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Kết quả của bạn</h1>
          <p className="mt-1 text-sm text-gray-500">Dựa trên câu trả lời, đây là 3 ngành nghề phù hợp nhất với bạn</p>
        </div>

        <div className="space-y-4">
          {results.map(([key, score], i) => {
            const career = CAREERS[key]
            const maxScore = results[0][1]
            const pct = Math.round((score / maxScore) * 100)
            return (
              <div key={key} className={cn(
                'rounded-2xl border p-6',
                i === 0 ? 'border-brand/30 bg-brand/5 shadow-sm' : 'border-gray-100 bg-white',
              )}>
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl">{career.emoji}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{career.label}</h3>
                      {i === 0 && (
                        <span className="rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                          Phù hợp nhất
                        </span>
                      )}
                    </div>
                    <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn('h-full rounded-full transition-all', i === 0 ? 'bg-brand' : 'bg-gray-300')}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-bold text-gray-500">{pct}%</span>
                </div>
                <p className="text-sm leading-relaxed text-gray-600">{career.desc}</p>
                <Link
                  href={`/jobs?industry=${key}`}
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-brand hover:underline"
                >
                  Xem việc làm ngành này <ArrowRightIcon className="h-3 w-3" />
                </Link>
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={restart}
            className="flex items-center gap-2 rounded-xl border border-gray-200 px-6 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            <RefreshCcwIcon className="h-4 w-4" /> Làm lại
          </button>
          <Link
            href="/jobs"
            className="flex items-center gap-2 rounded-xl bg-brand px-6 py-3 text-sm font-bold text-white hover:bg-brand/90"
          >
            Tìm việc phù hợp <ArrowRightIcon className="h-4 w-4" />
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-gray-400">
          Kết quả mang tính định hướng. Hãy kết hợp với sở thích, học vấn và kinh nghiệm thực tế của bạn.
        </p>
      </div>
    </div>
  )
}
