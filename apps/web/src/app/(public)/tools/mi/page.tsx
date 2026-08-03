'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const INTELLIGENCES = [
  { key: 'linguistic',      label: 'Ngôn ngữ',        emoji: '📝', desc: 'Đọc, viết, kể chuyện, học ngoại ngữ', careers: ['Nhà văn', 'Nhà báo', 'Giáo viên', 'Luật sư'] },
  { key: 'logical',         label: 'Logic–Toán học',  emoji: '🔢', desc: 'Tư duy logic, giải toán, lập trình',   careers: ['Lập trình viên', 'Kế toán', 'Nhà khoa học', 'Kỹ sư'] },
  { key: 'spatial',         label: 'Không gian',       emoji: '🎨', desc: 'Hình dung 3D, thiết kế, định hướng',  careers: ['Kiến trúc sư', 'Nhà thiết kế', 'Phi công', 'Nhiếp ảnh gia'] },
  { key: 'musical',         label: 'Âm nhạc',          emoji: '🎵', desc: 'Cảm thụ âm nhạc, nhịp điệu, giai điệu', careers: ['Nhạc sĩ', 'Ca sĩ', 'Nhà sản xuất âm nhạc'] },
  { key: 'bodily',          label: 'Thể chất–Vận động',emoji: '🏃', desc: 'Điều khiển cơ thể, khéo tay, thể thao', careers: ['Vận động viên', 'Diễn viên', 'Thợ thủ công', 'Bác sĩ phẫu thuật'] },
  { key: 'interpersonal',   label: 'Giao tiếp xã hội', emoji: '🤝', desc: 'Hiểu người khác, lãnh đạo, hợp tác',  careers: ['Quản lý', 'Giáo viên', 'Bán hàng', 'Nhân sự'] },
  { key: 'intrapersonal',   label: 'Nội tâm',          emoji: '🧘', desc: 'Tự hiểu mình, cảm xúc, tự định hướng', careers: ['Nhà tâm lý học', 'Triết học', 'Nhà văn', 'Nhà nghiên cứu'] },
  { key: 'naturalist',      label: 'Thiên nhiên',       emoji: '🌿', desc: 'Yêu thiên nhiên, động thực vật, môi trường', careers: ['Nhà sinh thái học', 'Nông nghiệp', 'Bác sĩ thú y'] },
]

const QUESTIONS: { q: string; intel: string }[] = [
  { q: 'Tôi thích đọc sách và diễn đạt ý tưởng bằng lời nói hoặc văn bản.', intel: 'linguistic' },
  { q: 'Tôi thích giải đố, tính toán và suy luận logic.', intel: 'logical' },
  { q: 'Tôi dễ hình dung bản đồ, sơ đồ và không gian 3 chiều.', intel: 'spatial' },
  { q: 'Tôi nhớ giai điệu dễ dàng và thường ngân nga khi làm việc.', intel: 'musical' },
  { q: 'Tôi thích thể thao, múa hoặc làm việc bằng tay (lắp ráp, điêu khắc...).', intel: 'bodily' },
  { q: 'Tôi dễ kết bạn và hiểu cảm xúc của người xung quanh.', intel: 'interpersonal' },
  { q: 'Tôi thường suy ngẫm về bản thân, cảm xúc và mục tiêu của mình.', intel: 'intrapersonal' },
  { q: 'Tôi yêu thiên nhiên, cây cối, động vật và thích hoạt động ngoài trời.', intel: 'naturalist' },
  { q: 'Tôi học tốt nhất khi đọc hoặc nghe giải thích.', intel: 'linguistic' },
  { q: 'Tôi thích phân tích dữ liệu và tìm ra quy luật trong thông tin.', intel: 'logical' },
  { q: 'Tôi vẽ hoặc phác thảo khi muốn ghi nhớ hoặc giải thích điều gì đó.', intel: 'spatial' },
  { q: 'Nhạc nền giúp tôi tập trung và làm việc hiệu quả hơn.', intel: 'musical' },
  { q: 'Tôi học tốt hơn khi được thực hành, di chuyển, không ngồi yên lâu.', intel: 'bodily' },
  { q: 'Tôi giỏi thuyết phục, dẫn dắt nhóm và giải quyết mâu thuẫn.', intel: 'interpersonal' },
  { q: 'Tôi cần thời gian một mình để nạp lại năng lượng và suy nghĩ sâu.', intel: 'intrapersonal' },
  { q: 'Tôi quan sát tốt các thay đổi trong thiên nhiên và thời tiết.', intel: 'naturalist' },
]

const SCALE = [1, 2, 3, 4, 5]
const SCALE_LABELS: Record<number, string> = { 1: 'Rất không đồng ý', 3: 'Trung lập', 5: 'Rất đồng ý' }

export default function MiPage() {
  const [scores, setScores] = useState<Record<number, number>>({})
  const [result, setResult] = useState<{ key: string; score: number }[] | null>(null)

  const answered = Object.keys(scores).length
  const total = QUESTIONS.length

  function calcResult() {
    const totals: Record<string, number> = {}
    const counts: Record<string, number> = {}
    QUESTIONS.forEach((q, i) => {
      const s = scores[i] ?? 0
      totals[q.intel] = (totals[q.intel] ?? 0) + s
      counts[q.intel] = (counts[q.intel] ?? 0) + 1
    })
    const ranked = INTELLIGENCES.map(intel => ({
      key: intel.key,
      score: Math.round(((totals[intel.key] ?? 0) / (counts[intel.key] ?? 1)) * 20),
    })).sort((a, b) => b.score - a.score)
    setResult(ranked)
  }

  if (result) {
    const top3 = result.slice(0, 3)
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 font-bold text-gray-900">Kết quả trắc nghiệm MI của bạn</h2>
          <div className="space-y-3">
            {result.map(({ key, score }) => {
              const intel = INTELLIGENCES.find(i => i.key === key)!
              const isTop = top3.some(t => t.key === key)
              return (
                <div key={key}>
                  <div className="mb-1 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {intel.emoji} {intel.label}
                      {isTop && top3.indexOf(result.find(r => r.key === key)!) === 0 && (
                        <span className="ml-2 text-xs font-bold text-brand">Nổi trội nhất</span>
                      )}
                    </span>
                    <span className="text-xs font-bold text-gray-500 tabular-nums">{score}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100">
                    <div
                      className={cn('h-full rounded-full transition-all', isTop ? 'bg-brand' : 'bg-gray-300')}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="mb-6 space-y-3">
          <h2 className="font-bold text-gray-900">Trí tuệ nổi bật của bạn</h2>
          {top3.map(({ key }) => {
            const intel = INTELLIGENCES.find(i => i.key === key)!
            return (
              <div key={key} className="rounded-xl border border-brand/20 bg-brand/5 p-4">
                <p className="mb-1 font-semibold text-brand">{intel.emoji} {intel.label}</p>
                <p className="mb-2 text-sm text-gray-600">{intel.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {intel.careers.map(c => (
                    <span key={c} className="rounded-full bg-white border border-brand/20 px-2.5 py-0.5 text-xs font-medium text-brand">{c}</span>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setResult(null); setScores({}) }} className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand hover:text-brand transition">
            Làm lại
          </button>
          <a href="/jobs" className="rounded-xl bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand/90 transition">
            Tìm việc phù hợp →
          </a>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Trắc nghiệm</p>
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Trắc nghiệm đa trí tuệ (MI)</h1>
          <p className="text-gray-500 text-sm">16 câu hỏi · ~4 phút · Khám phá 8 loại trí tuệ theo Howard Gardner</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 py-8 space-y-4">
        <div className="mb-4 flex items-center gap-3">
          <div className="h-2 flex-1 rounded-full bg-gray-100 overflow-hidden">
            <div className="h-full rounded-full bg-brand transition-all" style={{ width: `${(answered / total) * 100}%` }} />
          </div>
          <span className="text-xs text-gray-400">{answered}/{total}</span>
        </div>

        {QUESTIONS.map((q, i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <p className="mb-4 text-sm font-semibold text-gray-800">{i + 1}. {q.q}</p>
            <div className="flex items-center justify-between gap-1">
              {SCALE.map(v => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setScores(prev => ({ ...prev, [i]: v }))}
                  className={cn(
                    'flex h-9 w-9 flex-col items-center justify-center rounded-xl border-2 text-sm font-bold transition',
                    scores[i] === v
                      ? 'border-brand bg-brand text-white'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300',
                  )}
                >
                  {v}
                </button>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-[10px] text-gray-400">
              <span>{SCALE_LABELS[1]}</span>
              <span>{SCALE_LABELS[3]}</span>
              <span>{SCALE_LABELS[5]}</span>
            </div>
          </div>
        ))}

        <button
          type="button"
          disabled={answered < total}
          onClick={calcResult}
          className="w-full rounded-xl bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand/90 disabled:opacity-40"
        >
          {answered < total ? `Hãy trả lời ${total - answered} câu hỏi còn lại` : 'Xem kết quả →'}
        </button>
      </div>
    </>
  )
}
