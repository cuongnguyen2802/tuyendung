import type { Metadata } from 'next'
import { BriefcaseIcon, UsersIcon, BuildingIcon, TrendingUpIcon, HeartIcon, ShieldIcon, ZapIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Về TuyenDung.vn — Nền tảng tuyển dụng hàng đầu Việt Nam',
  description: 'TuyenDung.vn kết nối hơn 1 triệu ứng viên với hàng nghìn nhà tuyển dụng uy tín trên toàn quốc.',
}

const STATS = [
  { icon: UsersIcon,      value: '1M+',   label: 'Ứng viên đăng ký' },
  { icon: BuildingIcon,   value: '50.000+', label: 'Công ty đối tác' },
  { icon: BriefcaseIcon,  value: '200.000+', label: 'Tin tuyển dụng' },
  { icon: TrendingUpIcon, value: '95%',   label: 'Tỷ lệ hài lòng' },
]

const VALUES = [
  {
    icon: HeartIcon,
    title: 'Lấy con người làm trung tâm',
    desc: 'Chúng tôi tin rằng mỗi người đều xứng đáng có một công việc phù hợp. Mọi quyết định đều hướng đến lợi ích lâu dài của ứng viên và nhà tuyển dụng.',
  },
  {
    icon: ShieldIcon,
    title: 'Minh bạch & đáng tin cậy',
    desc: 'Thông tin tuyển dụng được kiểm duyệt kỹ lưỡng. Chúng tôi cam kết không có tin giả, không lừa đảo và bảo vệ dữ liệu cá nhân theo quy định pháp luật.',
  },
  {
    icon: ZapIcon,
    title: 'Đổi mới liên tục',
    desc: 'Áp dụng AI và công nghệ hiện đại để gợi ý việc làm phù hợp, tự động hóa quy trình tuyển dụng và mang lại trải nghiệm tốt nhất cho người dùng.',
  },
]

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <div className="bg-gradient-to-br from-brand/5 via-white to-emerald-50 border-b border-gray-100">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <p className="mb-3 text-sm font-bold uppercase tracking-widest text-brand">Về chúng tôi</p>
          <h1 className="mb-4 text-4xl font-extrabold text-gray-900">
            Nền tảng tuyển dụng<br />
            <span className="text-brand">hàng đầu Việt Nam</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-500 leading-relaxed">
            TuyenDung.vn ra đời với sứ mệnh kết nối ứng viên tài năng với những cơ hội nghề nghiệp phù hợp nhất, giúp doanh nghiệp tìm được nhân tài đúng lúc, đúng người.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12 space-y-16">

        {/* Stats */}
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {STATS.map(({ icon: Icon, value, label }) => (
            <div key={label} className="rounded-2xl border border-gray-100 bg-white p-6 text-center shadow-sm">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                <Icon className="h-6 w-6 text-brand" />
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{value}</p>
              <p className="mt-1 text-sm text-gray-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Story */}
        <div className="grid gap-10 lg:grid-cols-2 items-center">
          <div>
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Câu chuyện</p>
            <h2 className="mb-4 text-2xl font-bold text-gray-900">Từ ý tưởng đến nền tảng hàng triệu người dùng</h2>
            <div className="space-y-3 text-sm text-gray-600 leading-relaxed">
              <p>
                TuyenDung.vn được thành lập năm 2018 bởi nhóm kỹ sư và chuyên gia nhân sự với mong muốn giải quyết bài toán nan giải của thị trường lao động Việt Nam: khoảng cách giữa ứng viên tiềm năng và nhà tuyển dụng phù hợp.
              </p>
              <p>
                Sau hơn 6 năm phát triển, chúng tôi đã trở thành một trong những nền tảng tuyển dụng lớn nhất Việt Nam với hơn 1 triệu ứng viên đăng ký, hơn 50.000 doanh nghiệp đối tác từ startup đến tập đoàn đa quốc gia.
              </p>
              <p>
                Hiện tại, TuyenDung.vn không chỉ là nơi đăng tin và nộp hồ sơ, mà còn là hệ sinh thái phát triển nghề nghiệp toàn diện: từ xây dựng CV, luyện phỏng vấn, đến tư vấn lộ trình sự nghiệp.
              </p>
            </div>
          </div>
          <div className="rounded-2xl bg-gradient-to-br from-brand/10 to-emerald-100 p-8">
            <div className="space-y-4">
              {[
                { year: '2018', event: 'Thành lập công ty, ra mắt phiên bản beta' },
                { year: '2019', event: 'Đạt 100.000 ứng viên đăng ký đầu tiên' },
                { year: '2021', event: 'Ra mắt tính năng AI gợi ý việc làm' },
                { year: '2022', event: 'Hợp tác với 10.000 doanh nghiệp đối tác' },
                { year: '2024', event: 'Vượt mốc 1 triệu người dùng' },
              ].map(({ year, event }) => (
                <div key={year} className="flex gap-4">
                  <span className="shrink-0 text-sm font-bold text-brand">{year}</span>
                  <span className="text-sm text-gray-700">{event}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Values */}
        <div>
          <p className="mb-2 text-center text-xs font-bold uppercase tracking-widest text-brand">Giá trị cốt lõi</p>
          <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">Những gì chúng tôi tin tưởng</h2>
          <div className="grid gap-6 sm:grid-cols-3">
            {VALUES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand/10">
                  <Icon className="h-6 w-6 text-brand" />
                </div>
                <h3 className="mb-2 font-bold text-gray-900">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Team */}
        <div className="rounded-2xl bg-gradient-to-r from-brand to-emerald-600 p-8 text-center text-white">
          <h2 className="mb-3 text-2xl font-bold">Cùng chúng tôi xây dựng tương lai</h2>
          <p className="mb-6 text-brand-100 text-sm">
            TuyenDung.vn đang tìm kiếm những người tài năng, nhiệt huyết để cùng phát triển nền tảng tuyển dụng tốt nhất Việt Nam.
          </p>
          <a
            href="/careers"
            className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-brand transition hover:bg-gray-50"
          >
            Xem vị trí tuyển dụng →
          </a>
        </div>

      </div>
    </>
  )
}
