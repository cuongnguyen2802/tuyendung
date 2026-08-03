import type { Metadata } from 'next'
import { NewspaperIcon, DownloadIcon } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Góc báo chí — TuyenDung.vn',
  description: 'Tin tức, thông cáo báo chí và tài nguyên truyền thông của TuyenDung.vn.',
}

const NEWS = [
  {
    date: '15/07/2024',
    source: 'VnExpress',
    title: 'TuyenDung.vn vượt mốc 1 triệu ứng viên đăng ký trong năm 2024',
    excerpt: 'Nền tảng tuyển dụng TuyenDung.vn công bố đạt cột mốc 1 triệu người dùng, khẳng định vị thế trong thị trường HR Tech Việt Nam.',
  },
  {
    date: '03/05/2024',
    source: 'CafeF',
    title: 'Top 5 nền tảng tuyển dụng được nhà tuyển dụng tin dùng nhất 2024',
    excerpt: 'Khảo sát trên 500 doanh nghiệp cho thấy TuyenDung.vn nằm trong top 5 nền tảng được lựa chọn nhất nhờ chất lượng ứng viên và tốc độ tuyển dụng.',
  },
  {
    date: '20/02/2024',
    source: 'Báo Lao Động',
    title: 'Thị trường việc làm quý 1/2024: ngành IT và tài chính dẫn đầu nhu cầu tuyển dụng',
    excerpt: 'Theo dữ liệu từ TuyenDung.vn, tin tuyển dụng ngành IT tăng 45% so với cùng kỳ năm ngoái, tiếp theo là tài chính-ngân hàng với mức tăng 32%.',
  },
  {
    date: '10/01/2024',
    source: 'Nhịp Cầu Đầu Tư',
    title: 'TuyenDung.vn huy động vốn Series A để mở rộng sang thị trường miền Trung',
    excerpt: 'Startup HR Tech TuyenDung.vn hoàn thành vòng gọi vốn Series A, dự kiến mở văn phòng tại Đà Nẵng và Huế trong năm 2024.',
  },
]

const PRESS_RELEASES = [
  { date: '01/07/2024', title: 'TuyenDung.vn ra mắt tính năng CV Builder với hỗ trợ AI' },
  { date: '15/04/2024', title: 'Hợp tác chiến lược với Hiệp hội Doanh nghiệp Việt Nam' },
  { date: '01/02/2024', title: 'Báo cáo thị trường lao động Việt Nam Q4/2023' },
  { date: '10/01/2024', title: 'TuyenDung.vn hoàn thành vòng gọi vốn Series A' },
]

export default function PressPage() {
  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-4xl px-4 py-14">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Báo chí</p>
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900">Góc báo chí</h1>
          <p className="text-gray-500">Tin tức, thông cáo báo chí và tài nguyên truyền thông về TuyenDung.vn.</p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_300px]">

          {/* News */}
          <div>
            <h2 className="mb-5 text-lg font-bold text-gray-900">TuyenDung.vn trên báo chí</h2>
            <div className="space-y-5">
              {NEWS.map(item => (
                <div key={item.title} className="flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
                  <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand/10">
                    <NewspaperIcon className="h-5 w-5 text-brand" />
                  </div>
                  <div>
                    <div className="mb-1 flex items-center gap-2">
                      <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-semibold text-gray-600">{item.source}</span>
                      <span className="text-xs text-gray-400">{item.date}</span>
                    </div>
                    <h3 className="mb-1 font-semibold text-gray-900 text-sm">{item.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{item.excerpt}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Press contact */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-bold text-gray-900">Liên hệ báo chí</h3>
              <p className="mb-3 text-sm text-gray-500">
                Để phỏng vấn, đặt câu hỏi hoặc yêu cầu thông tin, vui lòng liên hệ đội truyền thông.
              </p>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium text-gray-700">Email:</span> <a href="mailto:press@tuyendung.vn" className="text-brand hover:underline">press@tuyendung.vn</a></p>
                <p><span className="font-medium text-gray-700">Hotline:</span> <a href="tel:19001234" className="text-brand hover:underline">1900 1234</a> (nhánh 3)</p>
              </div>
            </div>

            {/* Press releases */}
            <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <h3 className="mb-3 font-bold text-gray-900">Thông cáo báo chí</h3>
              <div className="space-y-3">
                {PRESS_RELEASES.map(pr => (
                  <div key={pr.title} className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-gray-400">{pr.date}</p>
                      <p className="text-sm font-medium text-gray-700">{pr.title}</p>
                    </div>
                    <button type="button" className="mt-1 shrink-0 text-brand hover:text-brand/80">
                      <DownloadIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Brand kit */}
            <div className="rounded-2xl border border-brand/20 bg-brand/5 p-5">
              <h3 className="mb-2 font-bold text-brand">Bộ nhận diện thương hiệu</h3>
              <p className="mb-3 text-sm text-gray-500">Logo, màu sắc và hướng dẫn sử dụng thương hiệu TuyenDung.vn.</p>
              <button type="button" className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand/90 transition">
                <DownloadIcon className="h-4 w-4" />
                Tải Brand Kit
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}
