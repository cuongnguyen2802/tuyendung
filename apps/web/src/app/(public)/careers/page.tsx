import type { Metadata } from 'next'
import Link from 'next/link'
import { MapPinIcon, BriefcaseIcon, ClockIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Tuyển dụng nội bộ — TuyenDung.vn',
  description: 'Gia nhập đội ngũ TuyenDung.vn — xây dựng nền tảng tuyển dụng hàng đầu Việt Nam.',
}

const PERKS = [
  { emoji: '💰', title: 'Lương cạnh tranh', desc: 'Review lương 2 lần/năm, thưởng theo hiệu suất và cổ phần cho nhân sự cấp cao.' },
  { emoji: '🏖️', title: 'Nghỉ phép linh hoạt', desc: '15 ngày phép/năm, không cần xin phép cứng nhắc — miễn không ảnh hưởng công việc.' },
  { emoji: '📚', title: 'Học tập & phát triển', desc: 'Ngân sách đào tạo 10 triệu/năm, khóa học, hội thảo và sách chuyên ngành.' },
  { emoji: '🏥', title: 'Bảo hiểm sức khỏe', desc: 'Bảo hiểm sức khỏe cho nhân viên và gia đình, khám định kỳ hàng năm.' },
  { emoji: '🍔', title: 'Phúc lợi hàng ngày', desc: 'Bữa trưa, cà phê miễn phí, team building hàng quý và các hoạt động gắn kết đội nhóm.' },
  { emoji: '🏡', title: 'Làm việc linh hoạt', desc: 'Hybrid 3 ngày/tuần tại văn phòng, giờ làm tự do từ 8h–10h sáng.' },
]

const JOBS = [
  {
    title: 'Senior Frontend Engineer',
    team: 'Engineering',
    location: 'TP. Hồ Chí Minh',
    type: 'Toàn thời gian',
    salary: '3.000 – 5.000 USD',
  },
  {
    title: 'Product Manager — Growth',
    team: 'Product',
    location: 'TP. Hồ Chí Minh',
    type: 'Toàn thời gian',
    salary: '40 – 60 triệu',
  },
  {
    title: 'Data Analyst',
    team: 'Data',
    location: 'TP. Hồ Chí Minh / Remote',
    type: 'Toàn thời gian',
    salary: '20 – 35 triệu',
  },
  {
    title: 'Account Manager (Nhà tuyển dụng)',
    team: 'Sales',
    location: 'Hà Nội',
    type: 'Toàn thời gian',
    salary: '15 – 25 triệu + hoa hồng',
  },
  {
    title: 'Content Writer — HR & Career',
    team: 'Marketing',
    location: 'Remote',
    type: 'Toàn thời gian / Part-time',
    salary: 'Thỏa thuận',
  },
]

export default function CareersPage() {
  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-gray-100 bg-gradient-to-br from-[#0d3d2a] to-[#1a4a35]">
        <svg aria-hidden className="absolute inset-0 h-full w-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="g" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M40 0L0 0 0 40" fill="none" stroke="white" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#g)" />
        </svg>
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-widest text-emerald-400">Gia nhập đội ngũ</p>
          <h1 className="mb-4 text-4xl font-extrabold text-white">
            Cùng chúng tôi xây dựng<br />
            <span className="text-emerald-400">tương lai nghề nghiệp Việt Nam</span>
          </h1>
          <p className="mx-auto max-w-xl text-white/70">
            TuyenDung.vn đang tìm kiếm những người tài năng, nhiệt huyết và muốn tạo ra tác động thực sự đến thị trường lao động.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-14">

        {/* Perks */}
        <div>
          <h2 className="mb-6 text-center text-xl font-bold text-gray-900">Tại sao gia nhập TuyenDung.vn?</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PERKS.map(perk => (
              <div key={perk.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                <span className="mb-3 block text-2xl">{perk.emoji}</span>
                <h3 className="mb-1.5 font-semibold text-gray-900">{perk.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Open roles */}
        <div>
          <h2 className="mb-6 text-xl font-bold text-gray-900">Vị trí đang tuyển dụng</h2>
          <div className="space-y-3">
            {JOBS.map(job => (
              <div
                key={job.title}
                className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-brand/30 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <span className="rounded-full bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">{job.team}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><ClockIcon className="h-3 w-3" />{job.type}</span>
                    <span className="flex items-center gap-1"><BriefcaseIcon className="h-3 w-3" />{job.salary}</span>
                  </div>
                </div>
                <Link
                  href="/contact"
                  className="shrink-0 rounded-xl border border-brand/30 px-4 py-2 text-sm font-semibold text-brand transition hover:bg-brand hover:text-white"
                >
                  Ứng tuyển
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-brand to-emerald-600 p-8 text-center text-white">
          <h2 className="mb-2 text-xl font-bold">Không thấy vị trí phù hợp?</h2>
          <p className="mb-5 text-sm text-white/80">Gửi CV của bạn cho chúng tôi. Nếu phù hợp, chúng tôi sẽ liên hệ khi có vị trí thích hợp.</p>
          <Link href="/contact" className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-brand transition hover:bg-gray-50">
            Gửi CV ứng tuyển chung
          </Link>
        </div>

      </div>
    </>
  )
}
