import Link from 'next/link'
import { ChevronRightIcon, CheckCircleIcon, ClockIcon, BookOpenIcon } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hướng dẫn viết CV chuẩn — TuyenDung.vn',
  description: 'Bí quyết viết CV xin việc chuyên nghiệp, được nhà tuyển dụng chú ý ngay lần đầu.',
}

const SECTIONS = [
  {
    id: 'basics',
    title: '1. CV là gì và tại sao nó quan trọng?',
    content: [
      'CV (Curriculum Vitae) là tài liệu tóm tắt quá trình học vấn, kinh nghiệm làm việc và kỹ năng của bạn. Đây là ấn tượng đầu tiên bạn tạo ra với nhà tuyển dụng.',
      'Một CV tốt sẽ giúp bạn vượt qua vòng lọc hồ sơ (ATS - Applicant Tracking System) và được nhà tuyển dụng mời phỏng vấn.',
    ],
    tips: [
      'Nhà tuyển dụng trung bình chỉ dành 7 giây để xem qua một CV',
      'Hơn 75% CV bị loại trước khi đến tay nhà tuyển dụng do ATS',
      'CV cá nhân hóa có tỷ lệ mời phỏng vấn cao hơn 40%',
    ],
  },
  {
    id: 'structure',
    title: '2. Cấu trúc CV chuẩn',
    content: [
      'Một CV hiệu quả cần có các phần chính theo thứ tự sau để nhà tuyển dụng dễ dàng nắm bắt thông tin.',
    ],
    list: [
      { label: 'Thông tin cá nhân', desc: 'Họ tên, số điện thoại, email, địa chỉ, LinkedIn/GitHub' },
      { label: 'Mục tiêu nghề nghiệp', desc: '2-3 câu ngắn gọn về mục tiêu và điểm mạnh của bạn' },
      { label: 'Kinh nghiệm làm việc', desc: 'Liệt kê theo thứ tự ngược (việc gần nhất lên đầu)' },
      { label: 'Học vấn', desc: 'Trường học, bằng cấp, chuyên ngành, năm tốt nghiệp' },
      { label: 'Kỹ năng', desc: 'Kỹ năng cứng (kỹ thuật) và kỹ năng mềm liên quan đến vị trí' },
      { label: 'Chứng chỉ và giải thưởng', desc: 'Bằng chứng nhận, dự án nổi bật, thành tích' },
    ],
  },
  {
    id: 'writing',
    title: '3. Cách viết từng phần',
    content: [
      'Phần kinh nghiệm làm việc là quan trọng nhất. Dùng công thức CAR (Challenge - Action - Result) để mô tả từng vị trí:',
    ],
    example: {
      bad: 'Phụ trách marketing cho sản phẩm.',
      good: 'Triển khai chiến dịch email marketing cho 50.000 khách hàng, tăng tỷ lệ mở email 35% và doanh số quý tăng 18%.',
    },
    tips: [
      'Bắt đầu mỗi bullet point bằng động từ hành động: "Tăng", "Giảm", "Xây dựng", "Quản lý"',
      'Luôn đính kèm số liệu cụ thể khi có thể',
      'Tập trung vào kết quả, không chỉ mô tả nhiệm vụ',
    ],
  },
  {
    id: 'design',
    title: '4. Thiết kế và trình bày',
    content: [
      'Thiết kế đơn giản và dễ đọc luôn tốt hơn thiết kế phức tạp. ATS thường không đọc được bảng biểu hay đồ họa phức tạp.',
    ],
    tips: [
      'Font chữ: Arial, Calibri, hoặc Times New Roman, cỡ 10-12pt',
      'Lề trang: 2-2.5cm để tạo không gian thoáng',
      'Độ dài: 1 trang với dưới 5 năm kinh nghiệm, 2 trang với senior',
      'Màu sắc: 1-2 màu, không dùng màu neon hay quá nhiều màu',
      'Lưu file PDF để đảm bảo định dạng khi gửi email',
    ],
  },
  {
    id: 'ats',
    title: '5. Tối ưu CV cho hệ thống ATS',
    content: [
      'ATS là phần mềm lọc CV tự động. Để CV của bạn không bị loại sớm:',
    ],
    tips: [
      'Dùng từ khóa từ bản mô tả công việc (JD) trong CV',
      'Không dùng header/footer cho thông tin quan trọng',
      'Tên section phải rõ ràng: "Kinh nghiệm làm việc", "Học vấn"',
      'Không nhúng hình ảnh chứa text quan trọng',
      'Lưu file dạng .docx hoặc .pdf thuần (không scan)',
    ],
  },
  {
    id: 'mistakes',
    title: '6. Lỗi thường gặp cần tránh',
    content: [
      'Những lỗi nhỏ trong CV có thể khiến bạn mất điểm ngay lập tức:',
    ],
    mistakes: [
      'Ảnh chụp kém chất lượng hoặc ảnh selfie',
      'Sai chính tả, ngữ pháp (dùng Grammarly để kiểm tra)',
      'Email thiếu chuyên nghiệp (vd: cungbeme2000@gmail.com)',
      'Khai thông tin không trung thực',
      'Copy CV chung chung không tùy chỉnh cho từng công ty',
      'Liệt kê quá nhiều kỹ năng không liên quan',
    ],
  },
]

export default function HandbookCVPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto max-w-4xl px-4 py-10">
          <nav className="mb-4 flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-brand">Trang chủ</Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <Link href="/blog" className="hover:text-brand">Cẩm nang nghề nghiệp</Link>
            <ChevronRightIcon className="h-3.5 w-3.5" />
            <span className="text-gray-600">Hướng dẫn viết CV</span>
          </nav>
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand/10 text-brand">
              <BookOpenIcon className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-snug text-gray-900 md:text-3xl">
                Hướng dẫn viết CV xin việc<br className="hidden sm:block" /> từ A đến Z
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><ClockIcon className="h-3.5 w-3.5" /> Đọc trong 8 phút</span>
                <span>•</span>
                <span>Cập nhật tháng 6/2025</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
          {/* Article */}
          <article className="space-y-8">
            {SECTIONS.map((section) => (
              <div key={section.id} id={section.id} className="rounded-2xl border border-gray-200 bg-white p-6">
                <h2 className="mb-4 text-lg font-bold text-gray-900">{section.title}</h2>

                {section.content.map((p, i) => (
                  <p key={i} className="mb-3 text-sm leading-relaxed text-gray-600">{p}</p>
                ))}

                {section.list && (
                  <div className="mt-3 space-y-2">
                    {section.list.map((item, i) => (
                      <div key={i} className="flex gap-3 rounded-xl bg-gray-50 px-4 py-3">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{i + 1}</span>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {section.example && (
                  <div className="mt-4 space-y-3">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-3">
                      <p className="mb-1 text-xs font-bold text-red-600">❌ Không nên:</p>
                      <p className="text-sm text-red-700">{section.example.bad}</p>
                    </div>
                    <div className="rounded-xl border border-brand/30 bg-brand-50 p-3">
                      <p className="mb-1 text-xs font-bold text-brand">✅ Nên làm:</p>
                      <p className="text-sm text-brand">{section.example.good}</p>
                    </div>
                  </div>
                )}

                {section.tips && (
                  <ul className="mt-3 space-y-2">
                    {section.tips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <CheckCircleIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand" />
                        {tip}
                      </li>
                    ))}
                  </ul>
                )}

                {section.mistakes && (
                  <ul className="mt-3 space-y-2">
                    {section.mistakes.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="mt-0.5 h-4 w-4 shrink-0 text-center text-xs text-red-400">✕</span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}

            {/* CTA */}
            <div className="rounded-2xl bg-brand p-6 text-center text-white">
              <p className="mb-1 text-lg font-bold">Áp dụng ngay với mẫu CV có sẵn</p>
              <p className="mb-4 text-sm text-white/80">Hàng trăm mẫu chuyên nghiệp, miễn phí</p>
              <Link href="/resumes/templates"
                className="inline-block rounded-xl bg-white px-6 py-2.5 text-sm font-bold text-brand hover:bg-gray-50">
                Xem mẫu CV →
              </Link>
            </div>
          </article>

          {/* TOC sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-6 space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Nội dung</p>
                <nav className="space-y-1">
                  {SECTIONS.map((s) => (
                    <a key={s.id} href={`#${s.id}`}
                      className="block rounded-lg px-3 py-1.5 text-sm text-gray-600 transition hover:bg-brand/5 hover:text-brand">
                      {s.title}
                    </a>
                  ))}
                </nav>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="mb-3 text-sm font-semibold text-gray-800">Tạo CV ngay</p>
                <p className="mb-3 text-xs text-gray-500">Áp dụng các mẹo trên với mẫu CV chuyên nghiệp</p>
                <Link href="/resumes/templates"
                  className="block w-full rounded-xl bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand/90">
                  Chọn mẫu CV
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
