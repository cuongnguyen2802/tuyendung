import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircleIcon, ClockIcon, StarIcon, UploadIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Review CV — Nhận đánh giá CV miễn phí | TuyenDung.vn',
  description: 'Gửi CV để nhận phản hồi từ chuyên gia HR và AI — giúp bạn tăng cơ hội được gọi phỏng vấn.',
}

const BENEFITS = [
  { icon: StarIcon,        title: 'Chuyên gia HR thực chiến', desc: 'Phản hồi từ các chuyên gia nhân sự có kinh nghiệm tuyển dụng tại doanh nghiệp lớn.' },
  { icon: ClockIcon,       title: 'Nhanh chóng trong 24h',    desc: 'Bạn nhận được báo cáo đánh giá CV chi tiết trong vòng 24 giờ làm việc.' },
  { icon: CheckCircleIcon, title: 'Phân tích toàn diện',      desc: 'Kiểm tra định dạng, nội dung, từ khóa ATS và lời khuyên cải thiện cụ thể.' },
]

const WHAT_YOU_GET = [
  'Điểm số tổng thể CV (0–100)',
  'Đánh giá từng phần: mục tiêu, kinh nghiệm, kỹ năng, học vấn',
  'Phân tích từ khóa ATS — kiểm tra CV có qua được bộ lọc tự động',
  'Gợi ý chỉnh sửa cụ thể theo từng dòng',
  'So sánh với CV trung bình ngành nghề của bạn',
  'Lời khuyên về format và thiết kế',
]

const TESTIMONIALS = [
  { name: 'Nguyễn Minh Tuấn', role: 'Software Engineer', quote: 'Sau khi sửa CV theo gợi ý, tỷ lệ gọi phỏng vấn của tôi tăng từ 10% lên 40%. Rất đáng!' },
  { name: 'Trần Thu Hà', role: 'Marketing Manager', quote: 'Chuyên gia chỉ ra những lỗi formatting nhỏ mà tôi không để ý. CV sau khi sửa trông chuyên nghiệp hơn nhiều.' },
  { name: 'Lê Văn Bình', role: 'Fresh Graduate', quote: 'Không biết cách viết CV lần đầu, dịch vụ review đã giúp tôi có việc làm trong 2 tuần.' },
]

export default function CvReviewPage() {
  return (
    <>
      {/* Hero */}
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-4xl px-4 py-14 text-center">
          <span className="mb-3 inline-block rounded-full bg-brand/10 px-3 py-1 text-xs font-bold text-brand">Miễn phí cho 50 hồ sơ đầu tiên mỗi tháng</span>
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">
            CV của bạn có đủ mạnh<br />
            <span className="text-brand">để được gọi phỏng vấn?</span>
          </h1>
          <p className="mx-auto mb-6 max-w-xl text-gray-500">
            Tải lên CV và nhận đánh giá chi tiết từ chuyên gia HR + phân tích AI trong vòng 24 giờ.
          </p>
          <Link
            href="/profile/resumes"
            className="inline-flex items-center gap-2 rounded-full bg-brand px-7 py-3.5 text-sm font-bold text-white shadow-lg shadow-brand/20 transition hover:bg-brand/90"
          >
            <UploadIcon className="h-4 w-4" />
            Tải CV lên ngay
          </Link>
          <p className="mt-3 text-xs text-gray-400">Hỗ trợ PDF, DOC, DOCX · Tối đa 5MB</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-14">

        {/* Benefits */}
        <div className="grid gap-6 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <Icon className="h-6 w-6 text-brand" />
              </div>
              <h3 className="mb-2 font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* What you get */}
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Báo cáo đánh giá</p>
            <h2 className="mb-5 text-2xl font-bold text-gray-900">Bạn sẽ nhận được gì?</h2>
            <ul className="space-y-3">
              {WHAT_YOU_GET.map(item => (
                <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                  <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand/5 to-emerald-50 p-6 border border-brand/10">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-gray-800">Điểm CV của bạn</span>
              <span className="text-2xl font-extrabold text-brand">?/100</span>
            </div>
            <div className="space-y-3 text-sm">
              {['Định dạng & Trình bày', 'Nội dung & Từ khóa', 'Kinh nghiệm & Thành tích', 'Kỹ năng & Chứng chỉ'].map(section => (
                <div key={section}>
                  <div className="mb-1 flex justify-between text-xs text-gray-500">
                    <span>{section}</span>
                    <span className="text-gray-300">—</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-200">
                    <div className="h-full w-0 rounded-full bg-brand" />
                  </div>
                </div>
              ))}
            </div>
            <Link href="/profile/resumes" className="mt-5 block rounded-xl bg-brand py-3 text-center text-sm font-bold text-white transition hover:bg-brand/90">
              Tải CV để nhận điểm
            </Link>
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900">Người dùng nói gì?</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {TESTIMONIALS.map(t => (
              <div key={t.name} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <p className="mb-4 text-sm text-gray-600 leading-relaxed italic">"{t.quote}"</p>
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-brand to-emerald-600 p-8 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold">Sẵn sàng cải thiện CV chưa?</h2>
          <p className="mb-6 text-sm text-white/80">Hàng nghìn ứng viên đã tăng tỷ lệ được gọi phỏng vấn nhờ dịch vụ này.</p>
          <Link
            href="/profile/resumes"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand transition hover:bg-gray-50"
          >
            <UploadIcon className="h-4 w-4" />
            Tải CV và nhận đánh giá miễn phí
          </Link>
        </div>

      </div>
    </>
  )
}
