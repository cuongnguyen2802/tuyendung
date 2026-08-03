import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Chính sách bảo mật — TuyenDung.vn',
  description: 'Chính sách bảo vệ dữ liệu cá nhân của TuyenDung.vn theo Nghị định 13/2023/NĐ-CP.',
}

const SECTIONS = [
  {
    title: '1. Thông tin chúng tôi thu thập',
    content: `Khi bạn sử dụng TuyenDung.vn, chúng tôi có thể thu thập các thông tin sau:

• **Thông tin tài khoản**: Họ tên, địa chỉ email, số điện thoại, mật khẩu (được mã hóa).
• **Thông tin hồ sơ**: Kinh nghiệm làm việc, trình độ học vấn, kỹ năng, ảnh đại diện, file CV.
• **Thông tin sử dụng**: Lịch sử tìm kiếm, tin đã xem, vị trí đã ứng tuyển, thời gian truy cập.
• **Thông tin thiết bị**: Địa chỉ IP, loại trình duyệt, hệ điều hành, ID thiết bị di động.
• **Thông tin thanh toán**: Tên chủ thẻ, 4 số cuối thẻ (không lưu số thẻ đầy đủ).`,
  },
  {
    title: '2. Mục đích sử dụng thông tin',
    content: `Chúng tôi sử dụng thông tin thu thập để:

• Cung cấp, vận hành và cải thiện dịch vụ tuyển dụng.
• Kết nối ứng viên với nhà tuyển dụng phù hợp thông qua thuật toán gợi ý.
• Gửi thông báo về tin tuyển dụng mới, trạng thái ứng tuyển và tin tức liên quan.
• Phân tích hành vi người dùng để cải thiện trải nghiệm sản phẩm.
• Phát hiện và ngăn chặn gian lận, lạm dụng dịch vụ.
• Tuân thủ các quy định pháp luật hiện hành.`,
  },
  {
    title: '3. Chia sẻ thông tin',
    content: `Chúng tôi **không bán** thông tin cá nhân của bạn. Thông tin có thể được chia sẻ với:

• **Nhà tuyển dụng**: Khi bạn ứng tuyển, thông tin CV được gửi đến nhà tuyển dụng đó.
• **Đối tác dịch vụ**: Các đơn vị cung cấp hạ tầng kỹ thuật, thanh toán, gửi email — bị ràng buộc bảo mật.
• **Cơ quan nhà nước**: Khi có yêu cầu hợp pháp từ cơ quan có thẩm quyền.

Thông tin hồ sơ chỉ hiển thị với nhà tuyển dụng khi bạn bật tính năng "Cho phép nhà tuyển dụng tìm thấy tôi".`,
  },
  {
    title: '4. Bảo mật dữ liệu',
    content: `Chúng tôi áp dụng các biện pháp kỹ thuật và tổ chức phù hợp để bảo vệ dữ liệu:

• Mã hóa dữ liệu truyền tải bằng TLS 1.3.
• Mật khẩu được băm bằng bcrypt, không lưu dưới dạng plaintext.
• Hạn chế quyền truy cập nội bộ theo nguyên tắc tối thiểu đặc quyền.
• Sao lưu dữ liệu định kỳ và kiểm tra bảo mật hàng năm.
• Hệ thống phát hiện xâm nhập và giám sát 24/7.`,
  },
  {
    title: '5. Quyền của bạn',
    content: `Theo Nghị định 13/2023/NĐ-CP, bạn có các quyền sau:

• **Quyền biết**: Được thông báo về việc thu thập và xử lý dữ liệu cá nhân.
• **Quyền đồng ý**: Cho phép hoặc từ chối xử lý dữ liệu cá nhân.
• **Quyền truy cập**: Xem thông tin cá nhân mà chúng tôi đang lưu giữ.
• **Quyền chỉnh sửa**: Cập nhật thông tin không chính xác hoặc lỗi thời.
• **Quyền xóa**: Yêu cầu xóa dữ liệu cá nhân (trong phạm vi pháp luật cho phép).
• **Quyền phản đối**: Phản đối việc xử lý dữ liệu vì mục đích tiếp thị trực tiếp.

Để thực hiện các quyền này, liên hệ: privacy@tuyendung.vn`,
  },
  {
    title: '6. Cookie và công nghệ theo dõi',
    content: `Chúng tôi sử dụng cookie để:

• Duy trì phiên đăng nhập của bạn.
• Ghi nhớ tùy chọn tìm kiếm và bộ lọc.
• Phân tích lưu lượng truy cập qua Google Analytics (dữ liệu ẩn danh).
• Cải thiện hiệu suất tải trang.

Bạn có thể tắt cookie trong cài đặt trình duyệt, tuy nhiên một số tính năng có thể không hoạt động đầy đủ.`,
  },
  {
    title: '7. Lưu giữ dữ liệu',
    content: `Chúng tôi lưu giữ dữ liệu cá nhân trong thời gian bạn còn tài khoản hoặc cần thiết để cung cấp dịch vụ. Khi bạn xóa tài khoản:

• Thông tin hồ sơ và CV bị xóa ngay lập tức.
• Lịch sử giao dịch và hóa đơn được lưu trong 5 năm theo quy định kế toán.
• Dữ liệu log hệ thống (ẩn danh) được lưu trong 12 tháng.`,
  },
  {
    title: '8. Thay đổi chính sách',
    content: `Chúng tôi có thể cập nhật Chính sách bảo mật này theo thời gian. Khi có thay đổi quan trọng, chúng tôi sẽ thông báo qua email đã đăng ký hoặc hiển thị thông báo nổi bật trên website.

Việc tiếp tục sử dụng dịch vụ sau khi chính sách được cập nhật đồng nghĩa với việc bạn chấp nhận các thay đổi đó.`,
  },
  {
    title: '9. Liên hệ',
    content: `Nếu có câu hỏi về chính sách này hoặc muốn thực hiện các quyền của mình, vui lòng liên hệ:

• **Email**: privacy@tuyendung.vn
• **Địa chỉ**: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh
• **Hotline**: 1900 068 889 — Nhánh 2 (Giờ hành chính)

Chúng tôi sẽ phản hồi trong vòng 30 ngày kể từ ngày nhận được yêu cầu.`,
  },
]

export default function PrivacyPage() {
  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Pháp lý</p>
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900">Chính sách bảo mật</h1>
          <p className="text-sm text-gray-500">Có hiệu lực từ ngày 01/01/2024 — Cập nhật lần cuối: 01/06/2024</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Chính sách bảo mật này áp dụng cho tất cả người dùng TuyenDung.vn và tuân thủ Nghị định 13/2023/NĐ-CP về bảo vệ dữ liệu cá nhân của Chính phủ Việt Nam.
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h2 className="mb-3 text-base font-bold text-gray-900">{section.title}</h2>
              <div className="text-sm text-gray-600 leading-7 whitespace-pre-line">
                {section.content.split('**').map((part, i) =>
                  i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-800">{part}</strong> : part
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
