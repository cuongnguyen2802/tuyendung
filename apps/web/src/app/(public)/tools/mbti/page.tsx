'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

const QUESTIONS: { q: string; a: string; b: string; dim: 'EI' | 'SN' | 'TF' | 'JP' }[] = [
  { q: 'Sau một ngày dài, bạn thường muốn...', a: 'Gặp gỡ bạn bè, ra ngoài vui chơi', b: 'Ở nhà một mình để nạp lại năng lượng', dim: 'EI' },
  { q: 'Khi tiếp cận vấn đề mới, bạn thường...', a: 'Dựa vào kinh nghiệm thực tế và dữ liệu cụ thể', b: 'Tin vào trực giác và các khả năng có thể xảy ra', dim: 'SN' },
  { q: 'Khi đưa ra quyết định quan trọng, bạn ưu tiên...', a: 'Logic, phân tích khách quan', b: 'Cảm xúc và tác động đến mọi người xung quanh', dim: 'TF' },
  { q: 'Bạn thích lập kế hoạch từ trước hay...', a: 'Lên kế hoạch rõ ràng và bám sát kế hoạch', b: 'Linh hoạt và thích nghi theo tình huống', dim: 'JP' },
  { q: 'Trong nhóm, bạn thường...', a: 'Là người khởi xướng và dẫn dắt cuộc trò chuyện', b: 'Lắng nghe nhiều hơn và phát biểu khi cần thiết', dim: 'EI' },
  { q: 'Bạn tin tưởng hơn vào...', a: 'Những gì bạn có thể thấy, chạm, đo lường được', b: 'Cảm nhận, linh cảm và ý nghĩa sâu xa của sự vật', dim: 'SN' },
  { q: 'Khi bạn bè gặp khó khăn, bạn thường...', a: 'Đưa ra giải pháp thực tế và lời khuyên cụ thể', b: 'Đồng cảm, lắng nghe và chia sẻ cảm xúc', dim: 'TF' },
  { q: 'Không gian làm việc lý tưởng của bạn là...', a: 'Có cấu trúc rõ ràng, deadline cụ thể', b: 'Tự do sáng tạo, không bị gò bó bởi quy tắc cứng', dim: 'JP' },
  { q: 'Bạn cảm thấy thoải mái khi...', a: 'Ở trong đám đông và giao lưu nhiều người', b: 'Có thời gian riêng tư để suy nghĩ và phản ánh', dim: 'EI' },
  { q: 'Khi học điều mới, bạn thích...', a: 'Học từng bước một, có ví dụ cụ thể', b: 'Hiểu tổng thể trước, nắm bắt bức tranh lớn', dim: 'SN' },
  { q: 'Bạn thường được mô tả là người...', a: 'Thẳng thắn, trực tiếp và khách quan', b: 'Ấm áp, đồng cảm và quan tâm đến cảm xúc người khác', dim: 'TF' },
  { q: 'Cuối tuần không có kế hoạch, bạn...', a: 'Cảm thấy khó chịu vì không có định hướng', b: 'Cảm thấy thoải mái vì có tự do để làm gì cũng được', dim: 'JP' },
]

const TYPES: Record<string, { title: string; desc: string; strengths: string[]; careers: string[]; color: string }> = {
  INTJ: { title: 'Kiến trúc sư', desc: 'Chiến lược gia đầy tưởng tượng với một kế hoạch cho mọi thứ.', strengths: ['Tư duy chiến lược', 'Quyết đoán', 'Sáng tạo'], careers: ['Kỹ sư phần mềm', 'Nhà khoa học', 'Luật sư', 'CEO'], color: 'from-purple-500 to-indigo-600' },
  INTP: { title: 'Nhà tư duy', desc: 'Nhà phát minh sáng tạo với khát vọng hiểu biết không ngừng nghỉ.', strengths: ['Phân tích', 'Logic', 'Sáng tạo'], careers: ['Lập trình viên', 'Nhà nghiên cứu', 'Toán học', 'Triết học'], color: 'from-blue-500 to-cyan-600' },
  ENTJ: { title: 'Chỉ huy', desc: 'Những nhà lãnh đạo táo bạo, giàu trí tưởng tượng và ý chí mạnh mẽ.', strengths: ['Lãnh đạo', 'Hiệu quả', 'Tự tin'], careers: ['CEO', 'Luật sư', 'Quản lý cấp cao', 'Doanh nhân'], color: 'from-red-500 to-orange-500' },
  ENTP: { title: 'Nhà tranh luận', desc: 'Những người thách thức kẻ thù thông minh và tràn đầy ý tưởng.', strengths: ['Tư duy nhanh', 'Sáng tạo', 'Hùng biện'], careers: ['Luật sư', 'Nhà tư vấn', 'Doanh nhân', 'Marketing'], color: 'from-amber-500 to-yellow-500' },
  INFJ: { title: 'Người vận động', desc: 'Những nhà lý tưởng điềm tĩnh và thần bí nhưng rất truyền cảm hứng.', strengths: ['Sâu sắc', 'Đồng cảm', 'Tầm nhìn'], careers: ['Tư vấn', 'Nhà văn', 'Nhà tâm lý học', 'Giáo dục'], color: 'from-green-500 to-teal-600' },
  INFP: { title: 'Người hòa giải', desc: 'Những người lý tưởng thơ mộng, luôn tìm kiếm điều tốt đẹp.', strengths: ['Sáng tạo', 'Đồng cảm', 'Cởi mở'], careers: ['Nhà văn', 'Nhà thiết kế', 'Tư vấn', 'Giáo dục'], color: 'from-pink-400 to-rose-500' },
  ENFJ: { title: 'Nhân vật chính', desc: 'Những nhà lãnh đạo đầy lôi cuốn và truyền cảm hứng.', strengths: ['Lãnh đạo', 'Giao tiếp', 'Đồng cảm'], careers: ['Giáo viên', 'Nhà trị liệu', 'HR', 'Chính trị gia'], color: 'from-emerald-500 to-green-600' },
  ENFP: { title: 'Người vận động', desc: 'Những người tự do đầy nhiệt huyết, sáng tạo và xã giao.', strengths: ['Nhiệt huyết', 'Sáng tạo', 'Giao tiếp'], careers: ['Marketing', 'Nhà báo', 'Diễn viên', 'Doanh nhân'], color: 'from-orange-400 to-yellow-500' },
  ISTJ: { title: 'Nhà hậu cần', desc: 'Những cá nhân thực tế và đáng tin cậy với quyết tâm không lay chuyển.', strengths: ['Kỷ luật', 'Đáng tin', 'Tổ chức'], careers: ['Kế toán', 'Quản lý dự án', 'Luật sư', 'Quân đội'], color: 'from-slate-500 to-gray-600' },
  ISFJ: { title: 'Người bảo vệ', desc: 'Những người bảo vệ tận tụy và ấm áp, sẵn sàng bảo vệ người thân.', strengths: ['Tận tâm', 'Kiên nhẫn', 'Đáng tin'], careers: ['Y tá', 'Giáo viên', 'Nhân viên xã hội', 'Quản lý văn phòng'], color: 'from-teal-500 to-cyan-600' },
  ESTJ: { title: 'Giám đốc điều hành', desc: 'Những người quản lý xuất sắc, không ai giỏi hơn họ trong việc điều hành.', strengths: ['Tổ chức', 'Lãnh đạo', 'Truyền thống'], careers: ['Quản lý', 'Kinh doanh', 'Luật sư', 'Ngân hàng'], color: 'from-blue-600 to-indigo-700' },
  ESFJ: { title: 'Người tư vấn', desc: 'Những người chăm sóc hết mực, hòa đồng và phổ biến.', strengths: ['Thân thiện', 'Tổ chức', 'Chăm sóc'], careers: ['Y tế', 'Giáo dục', 'PR', 'Nhân sự'], color: 'from-pink-500 to-rose-600' },
  ISTP: { title: 'Người thợ thủ công', desc: 'Những người thử nghiệm gan dạ và thực tế với đôi bàn tay khéo léo.', strengths: ['Phân tích', 'Thực tế', 'Linh hoạt'], careers: ['Kỹ sư', 'Thợ cơ khí', 'Lập trình viên', 'Phi công'], color: 'from-gray-500 to-zinc-600' },
  ISFP: { title: 'Nghệ sĩ', desc: 'Những nhà thám hiểm uyển chuyển và quyến rũ, luôn sẵn sàng khám phá.', strengths: ['Sáng tạo', 'Đồng cảm', 'Linh hoạt'], careers: ['Nghệ sĩ', 'Nhà thiết kế', 'Đầu bếp', 'Y tá'], color: 'from-violet-400 to-purple-500' },
  ESTP: { title: 'Doanh nhân', desc: 'Những người thông minh, năng động và rất nhạy bén trước nguy cơ.', strengths: ['Năng động', 'Thực tế', 'Quan sát'], careers: ['Kinh doanh', 'Marketing', 'Thám tử', 'Diễn viên'], color: 'from-red-400 to-orange-500' },
  ESFP: { title: 'Người giải trí', desc: 'Những người biểu diễn tự phát, năng động và nhiệt tình.', strengths: ['Lạc quan', 'Vui vẻ', 'Thực tế'], careers: ['Diễn viên', 'Nhân viên sự kiện', 'Y tế', 'Giáo dục trẻ em'], color: 'from-yellow-400 to-amber-500' },
}

export default function MbtiPage() {
  const [answers, setAnswers] = useState<Record<number, 'a' | 'b'>>({})
  const [result, setResult] = useState<string | null>(null)

  const answered = Object.keys(answers).length
  const total = QUESTIONS.length

  function calcResult() {
    const scores = { E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 }
    QUESTIONS.forEach((q, i) => {
      const ans = answers[i]
      if (!ans) return
      if (q.dim === 'EI') ans === 'a' ? scores.E++ : scores.I++
      if (q.dim === 'SN') ans === 'a' ? scores.S++ : scores.N++
      if (q.dim === 'TF') ans === 'a' ? scores.T++ : scores.F++
      if (q.dim === 'JP') ans === 'a' ? scores.J++ : scores.P++
    })
    const type =
      (scores.E >= scores.I ? 'E' : 'I') +
      (scores.S >= scores.N ? 'S' : 'N') +
      (scores.T >= scores.F ? 'T' : 'F') +
      (scores.J >= scores.P ? 'J' : 'P')
    setResult(type)
  }

  if (result) {
    const info = TYPES[result]
    return (
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className={`rounded-2xl bg-gradient-to-br ${info.color} p-8 text-white text-center mb-6`}>
          <p className="text-5xl font-black mb-2">{result}</p>
          <p className="text-xl font-bold mb-1">{info.title}</p>
          <p className="text-white/80 text-sm">{info.desc}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 mb-6">
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-800 text-sm">Điểm mạnh nổi bật</h3>
            <ul className="space-y-1">
              {info.strengths.map(s => <li key={s} className="text-sm text-gray-600 flex gap-2"><span className="text-brand">✓</span>{s}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <h3 className="mb-2 font-semibold text-gray-800 text-sm">Nghề nghiệp phù hợp</h3>
            <ul className="space-y-1">
              {info.careers.map(c => <li key={c} className="text-sm text-gray-600 flex gap-2"><span className="text-brand">→</span>{c}</li>)}
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => { setResult(null); setAnswers({}) }} className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-brand hover:text-brand transition">
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
          <h1 className="mb-2 text-3xl font-extrabold text-gray-900">Trắc nghiệm tính cách MBTI</h1>
          <p className="text-gray-500 text-sm">12 câu hỏi · ~3 phút · Khám phá trong 16 kiểu tính cách</p>
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
            <p className="mb-4 font-semibold text-gray-800 text-sm">{i + 1}. {q.q}</p>
            <div className="space-y-2">
              {(['a', 'b'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setAnswers(prev => ({ ...prev, [i]: opt }))}
                  className={cn(
                    'w-full rounded-xl border-2 px-4 py-3 text-left text-sm transition',
                    answers[i] === opt
                      ? 'border-brand bg-brand/5 text-brand font-semibold'
                      : 'border-gray-200 text-gray-600 hover:border-gray-300',
                  )}
                >
                  {opt === 'a' ? q.a : q.b}
                </button>
              ))}
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
