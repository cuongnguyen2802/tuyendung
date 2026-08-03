'use client'

import { useState } from 'react'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const SECTIONS = [
  {
    title: 'Tài khoản & Đăng ký',
    items: [
      {
        q: 'Làm sao để tạo tài khoản trên TuyenDung.vn?',
        a: 'Bạn có thể đăng ký bằng email hoặc liên kết tài khoản Google/Facebook. Truy cập trang Đăng ký, chọn vai trò (Ứng viên hoặc Nhà tuyển dụng), điền thông tin và xác nhận qua email.',
      },
      {
        q: 'Tôi quên mật khẩu, phải làm gì?',
        a: 'Nhấn vào liên kết "Quên mật khẩu" ở trang đăng nhập. Nhập email đã đăng ký, chúng tôi sẽ gửi link đặt lại mật khẩu trong vài phút. Kiểm tra cả thư mục Spam nếu không thấy email.',
      },
      {
        q: 'Tôi có thể có cả tài khoản ứng viên và nhà tuyển dụng không?',
        a: 'Hiện tại mỗi email chỉ liên kết với một vai trò. Nếu bạn cần cả hai, hãy dùng hai email khác nhau để đăng ký.',
      },
      {
        q: 'Dữ liệu cá nhân của tôi được bảo vệ như thế nào?',
        a: 'TuyenDung.vn tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân. Thông tin của bạn được mã hóa và không được bán cho bên thứ ba. Xem chi tiết tại trang Chính sách bảo mật.',
      },
    ],
  },
  {
    title: 'Dành cho Ứng viên',
    items: [
      {
        q: 'Tìm kiếm việc làm như thế nào?',
        a: 'Sử dụng thanh tìm kiếm trên trang chủ, nhập từ khóa vị trí, địa điểm hoặc tên công ty. Bạn cũng có thể lọc theo mức lương, kinh nghiệm, loại công việc và ngành nghề.',
      },
      {
        q: 'Tôi có thể nộp hồ sơ bao nhiêu tin tuyển dụng?',
        a: 'Không giới hạn số lượng. Bạn có thể nộp hồ sơ cho tất cả tin tuyển dụng phù hợp. Hệ thống sẽ theo dõi trạng thái ứng tuyển của bạn trong mục "Việc làm đã ứng tuyển".',
      },
      {
        q: 'Nhà tuyển dụng có thể xem CV của tôi khi tôi chưa nộp đơn không?',
        a: 'Chỉ khi bạn bật tính năng "Để nhà tuyển dụng tìm thấy tôi" trong phần cài đặt hồ sơ. Nếu tắt, CV chỉ hiển thị khi bạn chủ động ứng tuyển.',
      },
      {
        q: 'Làm sao để thiết lập thông báo việc làm?',
        a: 'Vào mục "Cài đặt thông báo" sau khi đăng nhập. Thiết lập từ khóa, địa điểm và mức lương mong muốn. Hệ thống sẽ gửi email hoặc thông báo đẩy khi có tin phù hợp.',
      },
    ],
  },
  {
    title: 'Dành cho Nhà tuyển dụng',
    items: [
      {
        q: 'Đăng tin tuyển dụng mất bao lâu để được duyệt?',
        a: 'Tin tuyển dụng thường được duyệt trong 2–4 giờ làm việc. Tin vi phạm quy định có thể bị từ chối và bạn sẽ nhận được thông báo qua email với lý do cụ thể.',
      },
      {
        q: 'Gói dịch vụ của TuyenDung.vn có những loại nào?',
        a: 'Chúng tôi cung cấp gói Cơ bản (miễn phí), Tiêu chuẩn và Pro. Xem chi tiết tại trang Bảng giá. Doanh nghiệp cũng có thể liên hệ để được tư vấn gói Enterprise tùy chỉnh.',
      },
      {
        q: 'Tôi có thể quản lý nhiều tin tuyển dụng cùng lúc không?',
        a: 'Có. Dashboard nhà tuyển dụng cho phép quản lý tất cả tin đang chạy, xem ứng viên theo từng vị trí, chuyển trạng thái ứng viên và xuất báo cáo.',
      },
    ],
  },
  {
    title: 'Thanh toán & Hóa đơn',
    items: [
      {
        q: 'TuyenDung.vn chấp nhận những phương thức thanh toán nào?',
        a: 'Chúng tôi chấp nhận chuyển khoản ngân hàng, thẻ Visa/Mastercard, ví điện tử (MoMo, ZaloPay, VNPay) và thanh toán qua cổng VNPT.',
      },
      {
        q: 'Tôi có thể xuất hóa đơn VAT không?',
        a: 'Có. Sau khi thanh toán thành công, vào mục Hóa đơn trong Dashboard và điền thông tin xuất hóa đơn. Hóa đơn điện tử sẽ được gửi qua email trong 3–5 ngày làm việc.',
      },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-start justify-between gap-4 py-4 text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{q}</span>
        <ChevronDownIcon className={cn('mt-0.5 h-4 w-4 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <p className="pb-4 text-sm text-gray-500 leading-relaxed">{a}</p>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Hỏi đáp</p>
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900">Câu hỏi thường gặp</h1>
          <p className="text-gray-500">Tìm câu trả lời nhanh cho những thắc mắc phổ biến nhất.</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        {SECTIONS.map(section => (
          <div key={section.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-base font-bold text-gray-900">{section.title}</h2>
            {section.items.map(item => (
              <FaqItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        ))}

        <div className="rounded-2xl bg-gradient-to-r from-brand to-emerald-600 p-6 text-center text-white">
          <p className="mb-1 font-semibold">Không tìm thấy câu trả lời?</p>
          <p className="mb-4 text-sm text-white/80">Đội hỗ trợ của chúng tôi luôn sẵn sàng giúp bạn.</p>
          <a href="/contact" className="inline-block rounded-lg bg-white px-5 py-2 text-sm font-bold text-brand hover:bg-gray-50 transition">
            Liên hệ ngay
          </a>
        </div>
      </div>
    </>
  )
}
