export interface SystemNotification {
  id: number
  category: string
  date: string
  title: string
  isNew: boolean
  content: string
}

export const SYSTEM_NOTIFICATIONS: SystemNotification[] = [
  {
    id: 1,
    category: 'Thông báo',
    date: '16/07/2026',
    title: 'Thông báo về thời gian hỗ trợ khách hàng ngày 16/07/2026',
    isNew: true,
    content: 'Kính gửi Quý khách hàng, nhân dịp nghỉ lễ, bộ phận hỗ trợ khách hàng của chúng tôi sẽ hoạt động theo giờ rút gọn từ 8:00 – 12:00. Chúng tôi xin lỗi vì sự bất tiện này và sẽ phản hồi mọi yêu cầu ngay khi trở lại làm việc bình thường.',
  },
  {
    id: 2,
    category: 'Thông báo',
    date: '14/07/2026',
    title: 'CHÍNH THỨC MỞ KHẢO SÁT BÁO CÁO TRIỂN VỌNG NHÂN LỰC VIỆT NAM 2026 - 2027',
    isNew: true,
    content: 'TopCV chính thức mở khảo sát Báo cáo Triển vọng Nhân lực Việt Nam 2026 - 2027. Hãy chia sẻ góc nhìn của bạn để cùng nhau xây dựng bức tranh toàn cảnh thị trường lao động Việt Nam.',
  },
  {
    id: 3,
    category: 'Thông báo',
    date: '29/05/2026',
    title: '[CẢNH BÁO BẢO MẬT] Lưu ý an toàn khi truy cập các liên kết lạ từ Hồ sơ ứng viên (CV)',
    isNew: false,
    content: 'Gần đây, một số tài khoản nhà tuyển dụng đã báo cáo về việc nhận được CV có chứa liên kết độc hại. Chúng tôi khuyến cáo quý nhà tuyển dụng không click vào các đường link lạ trong CV ứng viên và luôn xác minh thông tin qua kênh chính thức.',
  },
  {
    id: 4,
    category: 'Thông báo',
    date: '29/05/2026',
    title: 'TopCV áp dụng Bộ tiêu chuẩn hiển thị thông tin công ty và tin đăng',
    isNew: false,
    content: 'Từ ngày 01/06/2026, TopCV sẽ áp dụng bộ tiêu chuẩn mới về hiển thị thông tin công ty và tin tuyển dụng nhằm nâng cao trải nghiệm ứng viên. Các tin tuyển dụng không đáp ứng tiêu chuẩn sẽ được yêu cầu bổ sung thông tin trước khi được duyệt đăng.',
  },
  {
    id: 5,
    category: 'Thông báo',
    date: '13/05/2026',
    title: '[THÔNG BÁO] TOPCV RA MẮT TỔNG ĐÀI HỖ TRỢ MỚI 1900 068 889',
    isNew: false,
    content: 'TopCV chính thức ra mắt tổng đài hỗ trợ khách hàng mới 1900 068 889 (1.000đ/phút). Đường dây hoạt động từ 8:00 – 18:00, thứ Hai đến thứ Sáu (trừ ngày lễ). Đây là kênh hỗ trợ trực tiếp dành riêng cho nhà tuyển dụng.',
  },
  {
    id: 6,
    category: 'Thông báo',
    date: '24/04/2026',
    title: 'THÔNG BÁO LỊCH NGHỈ GIỖ TỔ HÙNG VƯƠNG (10/3 ÂM LỊCH) & 30/4 – 01/05',
    isNew: false,
    content: 'Kính thông báo lịch nghỉ lễ Giỗ Tổ Hùng Vương (ngày 07/04/2026) và lễ 30/4 – 01/05 (từ 28/04 đến 02/05/2026). Trong thời gian này, đội ngũ hỗ trợ sẽ không làm việc. Mọi yêu cầu sẽ được xử lý sau kỳ nghỉ.',
  },
  {
    id: 7,
    category: 'Thông báo',
    date: '15/04/2026',
    title: 'Tặng ngày dịch vụ dịp nghỉ lễ tháng 4/2026',
    isNew: false,
    content: 'Nhân dịp nghỉ lễ 30/4 – 01/05, TopCV xin trân trọng tặng 03 ngày dịch vụ miễn phí đến toàn bộ nhà tuyển dụng đang sử dụng gói đăng tin trả phí. Ngày tặng sẽ được cộng tự động vào tài khoản của bạn trong vòng 3 ngày làm việc.',
  },
  {
    id: 8,
    category: 'Thông báo',
    date: '04/03/2026',
    title: '[TOPCV] 8/3 – SHINE YOUR WAY WITH TOPCV',
    isNew: false,
    content: 'Nhân ngày Quốc tế Phụ nữ 8/3, TopCV gửi lời chúc tốt đẹp nhất đến tất cả các nữ nhà tuyển dụng và ứng viên. Để tri ân, chúng tôi dành tặng ưu đãi đặc biệt 20% cho gói đăng tin Premium từ 8/3 – 10/3/2026.',
  },
  {
    id: 9,
    category: 'Thông báo',
    date: '26/02/2026',
    title: 'Ra mắt Chương trình Gia tăng Sự hài lòng Khách hàng',
    isNew: false,
    content: 'TopCV chính thức triển khai Chương trình Gia tăng Sự hài lòng Khách hàng 2026. Nhà tuyển dụng có thể đánh giá chất lượng dịch vụ sau mỗi đợt sử dụng và nhận ưu đãi đặc biệt dựa trên điểm tích lũy hàng quý.',
  },
  {
    id: 10,
    category: 'Thông báo',
    date: '14/02/2026',
    title: "[TOPCV] Happy Valentine's Day 14/2 – Tặng ưu đãi tuyển dụng",
    isNew: false,
    content: 'Nhân ngày Lễ tình nhân, TopCV tặng voucher giảm 14% cho tất cả gói dịch vụ đăng tin khi thanh toán từ ngày 14/02 đến 16/02/2026. Mã voucher: LOVE2026. Áp dụng cho mọi gói dịch vụ, không giới hạn số lần dùng mỗi tài khoản.',
  },
  {
    id: 11,
    category: 'Thông báo',
    date: '20/01/2026',
    title: 'Thông báo nâng cấp hệ thống tối 20/01/2026 (22:00 – 02:00)',
    isNew: false,
    content: 'Để nâng cao trải nghiệm người dùng, TopCV sẽ thực hiện nâng cấp hệ thống trong khoảng thời gian từ 22:00 ngày 20/01 đến 02:00 ngày 21/01/2026. Trong thời gian này, một số tính năng có thể bị gián đoạn. Chúng tôi xin lỗi vì sự bất tiện này.',
  },
  {
    id: 12,
    category: 'Thông báo',
    date: '02/01/2026',
    title: 'Chúc mừng Năm Mới 2026 – Ưu đãi Đặc biệt Đầu Năm',
    isNew: false,
    content: 'TopCV kính chúc toàn thể nhà tuyển dụng Năm Mới 2026 An Khang Thịnh Vượng! Nhân dịp đầu năm, chúng tôi tặng ưu đãi 30% cho gói đăng tin khi đăng ký trong tháng 1/2026. Liên hệ đội sale để biết thêm chi tiết.',
  },
]

export const NEW_SYSTEM_NOTIFICATIONS = SYSTEM_NOTIFICATIONS.filter(n => n.isNew)
