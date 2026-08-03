import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Điều khoản dịch vụ — TuyenDung.vn',
  description: 'Điều khoản và điều kiện sử dụng dịch vụ tuyển dụng TuyenDung.vn.',
}

const SECTIONS = [
  {
    title: '1. Chấp nhận điều khoản',
    content: 'Bằng việc truy cập và sử dụng TuyenDung.vn, bạn đồng ý bị ràng buộc bởi các Điều khoản Dịch vụ này. Nếu không đồng ý với bất kỳ điều khoản nào, vui lòng ngừng sử dụng dịch vụ. Chúng tôi có thể cập nhật điều khoản theo thời gian và sẽ thông báo qua email khi có thay đổi quan trọng.',
  },
  {
    title: '2. Đủ điều kiện sử dụng',
    content: 'Dịch vụ dành cho người dùng từ 15 tuổi trở lên. Người dưới 18 tuổi cần có sự đồng ý của phụ huynh hoặc người giám hộ hợp pháp. Bằng việc đăng ký, bạn xác nhận rằng thông tin cung cấp là chính xác và đầy đủ.',
  },
  {
    title: '3. Tài khoản người dùng',
    content: `• Bạn chịu trách nhiệm bảo mật thông tin đăng nhập và tất cả hoạt động xảy ra dưới tài khoản của mình.
• Không được chia sẻ tài khoản với người khác hoặc tạo nhiều tài khoản cho cùng một mục đích.
• Thông báo ngay cho chúng tôi nếu nghi ngờ tài khoản bị xâm phạm qua email security@tuyendung.vn.
• Chúng tôi có quyền tạm khóa hoặc xóa tài khoản vi phạm điều khoản mà không cần báo trước.`,
  },
  {
    title: '4. Quy tắc ứng xử',
    content: `Người dùng cam kết không thực hiện các hành vi sau:

• Đăng thông tin giả mạo, gian lận hoặc gây hiểu nhầm.
• Spam, gửi tin nhắn quảng cáo không được phép đến người dùng khác.
• Thu thập dữ liệu người dùng bằng bot hoặc kỹ thuật tự động mà không được phép.
• Đăng nội dung vi phạm pháp luật, phân biệt đối xử, bạo lực hoặc khiêu dâm.
• Sử dụng dịch vụ để lừa đảo, chiếm đoạt tài sản hoặc tuyển dụng cho mục đích bất hợp pháp.
• Can thiệp vào hệ thống hoặc làm gián đoạn dịch vụ của người dùng khác.`,
  },
  {
    title: '5. Quyền sở hữu trí tuệ',
    content: 'Tất cả nội dung trên TuyenDung.vn (logo, giao diện, bài viết, dữ liệu) thuộc quyền sở hữu của Công ty TuyenDung hoặc được cấp phép hợp lệ. Bạn không được sao chép, phân phối hoặc sử dụng nội dung này cho mục đích thương mại mà không có sự đồng ý bằng văn bản. Nội dung bạn đăng tải (CV, mô tả công việc) vẫn thuộc quyền sở hữu của bạn, nhưng bạn cấp cho chúng tôi giấy phép không độc quyền để hiển thị và xử lý nhằm cung cấp dịch vụ.',
  },
  {
    title: '6. Miễn trừ trách nhiệm',
    content: `TuyenDung.vn không chịu trách nhiệm về:

• Tính chính xác của thông tin do nhà tuyển dụng hoặc ứng viên đăng tải.
• Kết quả tuyển dụng hoặc quyết định tuyển dụng của nhà tuyển dụng.
• Thiệt hại phát sinh từ việc sử dụng hoặc không thể sử dụng dịch vụ do nguyên nhân ngoài tầm kiểm soát.
• Nội dung từ các liên kết bên ngoài trên nền tảng.

Dịch vụ được cung cấp theo nguyên tắc "như hiện có" (as-is) và chúng tôi không đảm bảo dịch vụ hoạt động liên tục, không có lỗi.`,
  },
  {
    title: '7. Thanh toán và hoàn tiền',
    content: `• Tất cả giao dịch thanh toán cho gói dịch vụ nhà tuyển dụng được xử lý qua cổng thanh toán an toàn.
• Sau khi kích hoạt gói dịch vụ, chúng tôi không hoàn tiền trừ khi có lỗi kỹ thuật từ phía chúng tôi.
• Trong trường hợp tranh chấp, hãy liên hệ billing@tuyendung.vn trong vòng 7 ngày kể từ ngày phát sinh.
• Giá dịch vụ có thể thay đổi và sẽ được thông báo trước 30 ngày.`,
  },
  {
    title: '8. Chấm dứt dịch vụ',
    content: 'Bạn có thể xóa tài khoản bất kỳ lúc nào trong phần Cài đặt tài khoản. Chúng tôi có thể chấm dứt hoặc đình chỉ quyền truy cập của bạn ngay lập tức nếu bạn vi phạm các Điều khoản này. Khi tài khoản bị xóa, dữ liệu sẽ được xử lý theo Chính sách bảo mật.',
  },
  {
    title: '9. Luật áp dụng',
    content: 'Các Điều khoản này chịu sự điều chỉnh của pháp luật Việt Nam. Mọi tranh chấp phát sinh sẽ được giải quyết tại Tòa án nhân dân có thẩm quyền tại TP. Hồ Chí Minh. Các bên ưu tiên giải quyết tranh chấp thông qua thương lượng trước khi khởi kiện.',
  },
  {
    title: '10. Liên hệ',
    content: 'Mọi thắc mắc về Điều khoản Dịch vụ, vui lòng liên hệ:\n• Email: legal@tuyendung.vn\n• Địa chỉ: 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
  },
]

export default function TermsPage() {
  return (
    <>
      <div className="border-b border-gray-100 bg-gradient-to-br from-brand/5 via-white to-emerald-50">
        <div className="mx-auto max-w-3xl px-4 py-14">
          <p className="mb-2 text-xs font-bold uppercase tracking-widest text-brand">Pháp lý</p>
          <h1 className="mb-3 text-3xl font-extrabold text-gray-900">Điều khoản dịch vụ</h1>
          <p className="text-sm text-gray-500">Có hiệu lực từ ngày 01/01/2024 — Cập nhật lần cuối: 01/06/2024</p>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="mb-8 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800">
          Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ. Bằng việc đăng ký tài khoản, bạn xác nhận đã đọc, hiểu và đồng ý với toàn bộ nội dung bên dưới.
        </div>

        <div className="space-y-8">
          {SECTIONS.map(section => (
            <div key={section.title}>
              <h2 className="mb-3 text-base font-bold text-gray-900">{section.title}</h2>
              <p className="text-sm text-gray-600 leading-7 whitespace-pre-line">{section.content}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
