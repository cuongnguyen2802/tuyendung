import Link from 'next/link'

const FOOTER_COLS = [
  {
    heading: 'Về TuyenDung.vn',
    links: [
      { label: 'Giới thiệu', href: '/about' },
      { label: 'Góc báo chí', href: '/press' },
      { label: 'Tuyển dụng', href: '/careers' },
      { label: 'Liên hệ', href: '/contact' },
      { label: 'Hỏi đáp', href: '/faq' },
      { label: 'Chính sách bảo mật', href: '/privacy' },
      { label: 'Điều khoản dịch vụ', href: '/terms' },
    ],
  },
  {
    heading: 'Hồ sơ và CV',
    links: [
      { label: 'Quản lý CV của bạn', href: '/profile/resumes' },
      { label: 'Hướng dẫn viết CV', href: '/blog/tips/huong-dan-viet-cv' },
      { label: 'Thư viện CV theo ngành nghề', href: '/cv-templates' },
      { label: 'Review CV', href: '/cv-review' },
    ],
    subHeading: 'Khám phá',
    subLinks: [
      { label: 'Tính lương Gross - Net', href: '/tools/gross-net' },
      { label: 'Tính lãi suất kép', href: '/tools/compound-interest' },
      { label: 'Tính bảo hiểm thất nghiệp', href: '/tools/unemployment-insurance' },
      { label: 'Trắc nghiệm MBTI', href: '/tools/mbti' },
      { label: 'Trắc nghiệm MI', href: '/tools/mi' },
    ],
  },
  {
    heading: 'Xây dựng sự nghiệp',
    links: [
      { label: 'Việc làm tốt nhất', href: '/jobs?sortBy=newest' },
      { label: 'Việc làm lương cao', href: '/jobs?salaryMin=30000000' },
      { label: 'Việc làm quản lý', href: '/jobs?keyword=quản+lý' },
      { label: 'Việc làm IT', href: '/jobs/viec-lam-it-phan-mem' },
      { label: 'Việc làm Senior', href: '/jobs?keyword=senior' },
      { label: 'Việc làm bán thời gian', href: '/jobs?jobType=PART_TIME' },
    ],
    subHeading: 'Quy tắc chung',
    subLinks: [
      { label: 'Điều kiện giao dịch chung', href: '/terms' },
      { label: 'Giá dịch vụ & Cách thanh toán', href: '/pricing' },
    ],
  },
]

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-10 lg:grid-cols-[280px_1fr]">

          {/* ── Brand column ───────────────────────────────────────── */}
          <div className="space-y-5">
            {/* Logo */}
            <Link href="/" className="inline-flex items-center gap-1.5">
              <span className="text-2xl font-extrabold tracking-tight text-brand">TuyenDung</span>
              <span className="text-2xl font-extrabold tracking-tight text-gray-800">.vn</span>
            </Link>
            <p className="text-sm font-medium text-gray-600">Tiếp lợi thế, nối thành công</p>

            {/* Contact */}
            <div className="space-y-1.5 text-sm text-gray-500">
              <p className="font-semibold text-gray-700">Liên hệ</p>
              <p>
                Hotline:{' '}
                <a href="tel:19001234" className="font-bold text-gray-800 hover:text-brand">
                  1900 1234
                </a>{' '}
                <span className="text-gray-400">| Nhánh 2 (Giờ hành chính)</span>
              </p>
              <p>
                Email:{' '}
                <a href="mailto:hotro@tuyendung.vn" className="font-medium text-gray-700 hover:text-brand">
                  hotro@tuyendung.vn
                </a>
              </p>
              <p>
                Zalo hỗ trợ ứng viên:{' '}
                <a href="#" className="font-semibold text-brand hover:underline">
                  Kết nối ngay →
                </a>
              </p>
              <p>
                Fanpage:{' '}
                <a href="#" className="font-semibold text-gray-700 hover:text-brand">
                  TuyenDung Vietnam
                </a>
              </p>
              <p>
                LinkedIn:{' '}
                <a href="#" className="font-semibold text-gray-700 hover:text-brand">
                  TuyenDung Vietnam
                </a>
              </p>
            </div>

            {/* App download */}
            <div>
              <p className="mb-2.5 text-sm font-semibold text-gray-700">Ứng dụng tải xuống</p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="#"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-900 px-3 py-2 transition hover:bg-gray-800"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="leading-tight">
                    <p className="text-[10px] text-gray-300">Download on the</p>
                    <p className="text-xs font-semibold text-white">App Store</p>
                  </div>
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-900 px-3 py-2 transition hover:bg-gray-800"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-white">
                    <path d="M3.18 23.76c.3.17.64.22.99.15l12.6-7.29-2.73-2.73-10.86 9.87zm-1.18-20.1v20.68l11.37-10.34-11.37-10.34zm20.01 8.64l-2.74-1.58-3.06 2.79 3.06 2.78 2.77-1.6c.79-.46.79-1.93-.03-2.39zM4.17.24l12.6 7.28-2.73 2.73-9.87-10.01z" />
                  </svg>
                  <div className="leading-tight">
                    <p className="text-[10px] text-gray-300">GET IT ON</p>
                    <p className="text-xs font-semibold text-white">Google Play</p>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* ── Link columns ────────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {FOOTER_COLS.map((col) => (
              <div key={col.heading} className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900">{col.heading}</h3>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-sm text-gray-500 transition hover:text-brand"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {col.subHeading && (
                  <>
                    <h3 className="pt-3 text-sm font-bold text-gray-900">{col.subHeading}</h3>
                    <ul className="space-y-2">
                      {col.subLinks?.map((link) => (
                        <li key={link.href}>
                          <Link
                            href={link.href}
                            className="text-sm text-gray-500 transition hover:text-brand"
                          >
                            {link.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom bar ────────────────────────────────────────────── */}
        <div className="mt-10 border-t border-gray-100 pt-6 space-y-3">
          <div className="flex flex-col items-center justify-between gap-3 text-xs text-gray-400 sm:flex-row">
            <p>© {year} TuyenDung.vn — Nền tảng tuyển dụng hàng đầu Việt Nam</p>
            <p>Dự án Demo — Không có giá trị pháp lý</p>
          </div>

          {/* Demo disclaimer */}
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-center text-xs text-amber-700">
            ⚠️ <strong>Trang web này chỉ là bản Demo</strong> — được xây dựng cho mục đích học tập và trình diễn kỹ thuật.
            Mọi thông tin công ty, tin tuyển dụng, dữ liệu người dùng đều là <strong>giả lập</strong>.
            Không có giao dịch thực tế nào được thực hiện trên nền tảng này.
          </div>
        </div>
      </div>
    </footer>
  )
}
