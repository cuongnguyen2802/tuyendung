import { PrismaClient, Role, JobType, WorkMode, JobStatus, CompanySize, ApplicationStatus } from './generated/client'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'

const prisma = new PrismaClient()

function toSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

// HTML format matching Tiptap output
function html(...paragraphs: string[]): string {
  return paragraphs.map((p) => `<p>${p}</p>`).join('')
}

function htmlList(items: string[]): string {
  return `<ul class="list-disc pl-5">${items.map((i) => `<li class="my-0.5">${i}</li>`).join('')}</ul>`
}

function section(title: string, items: string[]): string {
  return `<h3>${title}</h3>${htmlList(items)}`
}

// ── Data ─────────────────────────────────────────────────────────────────────

const SKILL_NAMES = [
  'JavaScript', 'TypeScript', 'React', 'Next.js', 'Vue.js', 'Angular',
  'Node.js', 'NestJS', 'Express.js', 'Python', 'Django', 'FastAPI',
  'Java', 'Spring Boot', 'Go', 'PHP', 'Laravel',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Elasticsearch',
  'Docker', 'Kubernetes', 'AWS', 'Google Cloud', 'Azure', 'CI/CD',
  'Git', 'GraphQL', 'REST API', 'Microservices',
  'HTML/CSS', 'Tailwind CSS', 'SASS/SCSS',
  'Figma', 'Adobe XD', 'UI/UX Design', 'Photoshop',
  'Product Management', 'Agile/Scrum', 'Jira',
  'Data Analysis', 'Machine Learning', 'TensorFlow', 'PyTorch',
  'React Native', 'Flutter', 'Swift', 'Kotlin',
  'SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing',
  'Business Development', 'Sales Management', 'CRM', 'B2B Sales', 'Leadership',
  'Strategic Planning', 'Account Management', 'Negotiation',
]

const COMPANIES = [
  {
    email: 'hr@techcorp.vn',
    password: 'Employer@123',
    companyName: 'TechCorp Vietnam',
    slugBase: 'techcorp-vietnam',
    logoUrl: 'https://ui-avatars.com/api/?name=TC&background=1e40af&color=fff&bold=true&size=256&length=2',
    industry: 'Công nghệ thông tin',
    size: CompanySize.LARGE,
    city: 'Hà Nội',
    description: html(
      'TechCorp Vietnam là công ty công nghệ hàng đầu Việt Nam với hơn 500 nhân sự, chuyên phát triển các giải pháp phần mềm doanh nghiệp và nền tảng thương mại điện tử.',
      'Chúng tôi phục vụ hơn 200 doanh nghiệp trong và ngoài nước, với sứ mệnh ứng dụng công nghệ để thúc đẩy chuyển đổi số tại Việt Nam.',
    ),
    website: 'https://techcorp.vn',
    founded: 2015,
    verified: true,
  },
  {
    email: 'hr@startupxyz.vn',
    password: 'Employer@123',
    companyName: 'StartupXYZ Fintech',
    slugBase: 'startupxyz-fintech',
    logoUrl: 'https://ui-avatars.com/api/?name=SX&background=7c3aed&color=fff&bold=true&size=256&length=2',
    industry: 'Tài chính - Công nghệ',
    size: CompanySize.STARTUP,
    city: 'Hồ Chí Minh',
    description: html(
      'StartupXYZ là startup fintech với sứ mệnh số hóa tài chính cá nhân tại Đông Nam Á. Chúng tôi đã huy động được 5 triệu USD vòng Seed và đang mở rộng sang các thị trường mới.',
      'Văn hóa làm việc tại StartupXYZ đề cao sự sáng tạo, tốc độ và tinh thần khởi nghiệp — nơi mỗi cá nhân đều có thể tạo ra tác động lớn.',
    ),
    website: 'https://startupxyz.vn',
    founded: 2021,
    verified: true,
  },
  {
    email: 'hr@globalsoft.vn',
    password: 'Employer@123',
    companyName: 'GlobalSoft Solutions',
    slugBase: 'globalsoft-solutions',
    logoUrl: 'https://ui-avatars.com/api/?name=GS&background=059669&color=fff&bold=true&size=256&length=2',
    industry: 'Công nghệ thông tin',
    size: CompanySize.MEDIUM,
    city: 'Đà Nẵng',
    description: html(
      'GlobalSoft Solutions là công ty outsource phần mềm chất lượng cao, chuyên cung cấp dịch vụ phát triển phần mềm cho khách hàng Nhật Bản, Mỹ và châu Âu.',
      'Với 200+ kỹ sư kinh nghiệm và quy trình ISO 9001, chúng tôi đảm bảo chất lượng sản phẩm ở mức độ quốc tế.',
    ),
    website: 'https://globalsoft.vn',
    founded: 2018,
    verified: true,
  },
  {
    email: 'hr@ecommercevn.vn',
    password: 'Employer@123',
    companyName: 'EcommerceVN Group',
    slugBase: 'ecommercevn-group',
    logoUrl: 'https://ui-avatars.com/api/?name=EV&background=dc2626&color=fff&bold=true&size=256&length=2',
    industry: 'Thương mại điện tử',
    size: CompanySize.ENTERPRISE,
    city: 'Hồ Chí Minh',
    description: html(
      'EcommerceVN Group là tập đoàn thương mại điện tử hàng đầu Đông Nam Á với hơn 3.000 nhân viên tại 5 quốc gia. Chúng tôi vận hành các nền tảng mua sắm trực tuyến, logistics và thanh toán điện tử.',
      'Chúng tôi đầu tư mạnh mẽ vào công nghệ và con người, tạo ra môi trường làm việc đẳng cấp quốc tế ngay tại Việt Nam.',
    ),
    website: 'https://ecommercevn.vn',
    founded: 2012,
    verified: true,
  },
  // companyIndex: 4
  {
    email: 'hr@congtyabc.vn',
    password: 'Employer@123',
    companyName: 'Công ty ABC',
    slugBase: 'cong-ty-abc',
    logoUrl: 'https://ui-avatars.com/api/?name=ABC&background=f59e0b&color=fff&bold=true&size=256&length=3',
    industry: 'Thương mại - Phân phối',
    size: CompanySize.MEDIUM,
    city: 'Hà Nội',
    description: html(
      'Công ty ABC là doanh nghiệp phân phối và thương mại hàng đầu miền Bắc với 15 năm kinh nghiệm. Chúng tôi vận hành mạng lưới 200+ đối tác và nhà phân phối tại 30 tỉnh thành.',
      'Với tầm nhìn mở rộng sang thị trường Đông Nam Á, chúng tôi đang xây dựng đội ngũ lãnh đạo kinh doanh mạnh mẽ để dẫn dắt chiến lược tăng trưởng giai đoạn 2025–2030.',
    ),
    website: 'https://congtyabc.vn',
    founded: 2009,
    verified: true,
  },
]

interface JobSeed {
  title: string
  city: string
  location: string
  jobType: JobType
  workMode: WorkMode
  salaryMin?: number
  salaryMax?: number
  salaryNegotiable?: boolean
  experienceMin?: number
  quantity?: number
  skills: string[]
  description: string
  requirements: string
  benefits: string
  companyIndex: number
  daysUntilDeadline?: number
}

const JOBS: JobSeed[] = [
  // TechCorp Vietnam
  {
    title: 'Senior Frontend Developer (React/Next.js)',
    city: 'Hà Nội',
    location: 'Tầng 12, Tòa nhà TechCorp, 21 Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 25_000_000,
    salaryMax: 45_000_000,
    experienceMin: 3,
    quantity: 2,
    skills: ['React', 'Next.js', 'TypeScript', 'HTML/CSS', 'Tailwind CSS'],
    description:
      html(
        'TechCorp Vietnam đang tìm kiếm <strong>Senior Frontend Developer</strong> tài năng để tham gia đội ngũ kỹ thuật đang phát triển mạnh mẽ của chúng tôi.',
        'Bạn sẽ chịu trách nhiệm xây dựng và tối ưu hóa các giao diện người dùng hiệu suất cao, làm việc trực tiếp với đội ngũ thiết kế và backend để ra mắt sản phẩm cho hơn 1 triệu người dùng.',
      ),
    requirements:
      section('Yêu cầu kỹ năng', [
        'Ít nhất 3 năm kinh nghiệm phát triển frontend với React.js',
        'Thành thạo TypeScript và các tính năng ES6+',
        'Kinh nghiệm với Next.js (App Router, SSR, SSG)',
        'Hiểu biết vững về HTML5, CSS3, và responsive design',
        'Quen thuộc với Tailwind CSS hoặc các CSS-in-JS framework',
        'Kinh nghiệm làm việc với REST API và GraphQL',
        'Sử dụng thành thạo Git và quy trình code review',
      ]) +
      section('Yêu cầu khác', [
        'Tư duy phân tích và giải quyết vấn đề tốt',
        'Có khả năng đọc và viết tài liệu bằng tiếng Anh',
        'Kinh nghiệm trong môi trường Agile/Scrum là lợi thế',
      ]),
    benefits:
      section('Chế độ đãi ngộ', [
        'Mức lương cạnh tranh từ 25 - 45 triệu VNĐ/tháng',
        'Thưởng hiệu suất hàng quý, thưởng tháng 13',
        'Bảo hiểm sức khỏe cao cấp cho nhân viên và gia đình',
        'Hybrid làm việc: 3 ngày văn phòng, 2 ngày remote',
        '15 ngày phép/năm có lương, tăng theo thâm niên',
        'Budget học tập và phát triển cá nhân 10 triệu/năm',
        'Laptop MacBook Pro được cung cấp',
      ]),
    companyIndex: 0,
    daysUntilDeadline: 30,
  },
  {
    title: 'Backend Developer (Node.js/NestJS)',
    city: 'Hà Nội',
    location: 'Tầng 12, Tòa nhà TechCorp, 21 Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 20_000_000,
    salaryMax: 38_000_000,
    experienceMin: 2,
    quantity: 3,
    skills: ['Node.js', 'NestJS', 'PostgreSQL', 'Redis', 'Docker', 'REST API'],
    description:
      html(
        'Chúng tôi tìm kiếm <strong>Backend Developer</strong> có đam mê xây dựng hệ thống backend hiệu năng cao và khả năng mở rộng.',
        'Bạn sẽ tham gia phát triển microservices cho nền tảng thương mại điện tử, xử lý hàng triệu giao dịch mỗi ngày, và cải thiện kiến trúc hệ thống hiện tại.',
      ),
    requirements:
      section('Yêu cầu kỹ năng', [
        'Từ 2 năm kinh nghiệm phát triển backend với Node.js',
        'Kinh nghiệm với NestJS hoặc Express.js',
        'Thành thạo SQL và tối ưu hóa truy vấn PostgreSQL',
        'Kinh nghiệm với Redis (caching, pub/sub)',
        'Hiểu biết về Docker và containerization',
        'Quen thuộc với RESTful API design và tài liệu Swagger',
      ]) +
      section('Ưu tiên', [
        'Kinh nghiệm với message queue (RabbitMQ, Kafka)',
        'Đã từng làm việc với kiến trúc microservices',
        'Kinh nghiệm deploy trên AWS hoặc GCP',
      ]),
    benefits:
      section('Quyền lợi', [
        'Lương thỏa thuận theo năng lực (20 - 38 triệu VNĐ/tháng)',
        'Thưởng dự án và hiệu suất',
        'Bảo hiểm xã hội, y tế đầy đủ theo quy định',
        'Môi trường kỹ thuật hiện đại, stack công nghệ mới nhất',
        'Mentoring từ các senior engineer có nhiều năm kinh nghiệm',
        'Team building hàng quý và du lịch công ty hàng năm',
      ]),
    companyIndex: 0,
    daysUntilDeadline: 25,
  },
  {
    title: 'Product Manager - Nền tảng B2B SaaS',
    city: 'Hà Nội',
    location: 'Tầng 12, Tòa nhà TechCorp, 21 Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 30_000_000,
    salaryMax: 55_000_000,
    experienceMin: 4,
    quantity: 1,
    skills: ['Product Management', 'Agile/Scrum', 'Jira', 'Figma'],
    description:
      html(
        '<strong>Product Manager</strong> tại TechCorp Vietnam sẽ dẫn dắt roadmap sản phẩm B2B SaaS, làm việc trực tiếp với CEO và CTO để định hình chiến lược sản phẩm.',
        'Bạn sẽ là cầu nối giữa khách hàng, đội thiết kế và kỹ thuật, đảm bảo sản phẩm giải quyết đúng vấn đề của người dùng doanh nghiệp.',
      ),
    requirements:
      section('Yêu cầu', [
        'Ít nhất 4 năm kinh nghiệm Product Management',
        'Đã từng quản lý sản phẩm B2B hoặc SaaS',
        'Kỹ năng phân tích dữ liệu và ra quyết định dựa trên data',
        'Kinh nghiệm làm việc với Agile/Scrum',
        'Khả năng giao tiếp và thuyết trình tốt bằng tiếng Việt và tiếng Anh',
        'Hiểu biết cơ bản về kỹ thuật để làm việc hiệu quả với đội dev',
      ]),
    benefits:
      section('Quyền lợi', [
        'Lương hấp dẫn từ 30 - 55 triệu VNĐ/tháng',
        'Cổ phần công ty (ESOP)',
        'Được tham gia vào các quyết định chiến lược',
        'Budget conference và hội thảo quốc tế',
        'Hybrid linh hoạt',
      ]),
    companyIndex: 0,
    daysUntilDeadline: 45,
  },

  // StartupXYZ Fintech
  {
    title: 'Full Stack Developer (React + Python/FastAPI)',
    city: 'Hồ Chí Minh',
    location: 'WeWork Saigon, 3B Đường Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    salaryMin: 30_000_000,
    salaryMax: 55_000_000,
    experienceMin: 4,
    quantity: 2,
    skills: ['React', 'Python', 'FastAPI', 'PostgreSQL', 'Docker', 'AWS'],
    description:
      html(
        'StartupXYZ đang xây dựng nền tảng fintech thế hệ mới và tìm kiếm <strong>Full Stack Developer</strong> có kinh nghiệm và tinh thần startup.',
        'Bạn sẽ làm việc trực tiếp với founder và đội kỹ thuật nhỏ gọn, có cơ hội tác động lớn đến kiến trúc và công nghệ của sản phẩm.',
      ),
    requirements:
      section('Yêu cầu kỹ năng', [
        'Ít nhất 4 năm kinh nghiệm full stack development',
        'Frontend: React.js, TypeScript, state management (Redux/Zustand)',
        'Backend: Python với FastAPI hoặc Django',
        'Database: PostgreSQL, thiết kế schema và tối ưu hóa',
        'Kinh nghiệm với Docker, CI/CD pipeline',
        'Đã deploy ứng dụng lên AWS hoặc GCP',
      ]) +
      section('Ưu tiên', [
        'Kinh nghiệm trong lĩnh vực fintech hoặc payment',
        'Hiểu biết về bảo mật ứng dụng web (OWASP)',
        'Từng làm việc trong môi trường startup',
      ]),
    benefits:
      section('Quyền lợi đặc biệt', [
        'Remote 100% — làm việc từ bất kỳ đâu tại Việt Nam',
        'Lương USD hoặc VNĐ tùy chọn (30 - 55 triệu VNĐ/tháng)',
        'Cổ phần công ty (stock options) có vesting schedule',
        'MacBook Pro M3 và thiết bị làm việc cao cấp',
        'Budget tự do cho khóa học và chứng chỉ',
        'Không KPI cứng nhắc — đánh giá theo kết quả thực tế',
      ]),
    companyIndex: 1,
    daysUntilDeadline: 60,
  },
  {
    title: 'Mobile Developer (React Native)',
    city: 'Hồ Chí Minh',
    location: 'WeWork Saigon, 3B Đường Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 22_000_000,
    salaryMax: 40_000_000,
    experienceMin: 2,
    quantity: 1,
    skills: ['React Native', 'TypeScript', 'React', 'REST API'],
    description:
      html(
        'Chúng tôi cần <strong>Mobile Developer</strong> giàu kinh nghiệm để phát triển ứng dụng mobile fintech cho iOS và Android.',
        'Ứng dụng phục vụ hơn 50.000 người dùng với các tính năng quản lý tài chính cá nhân, thanh toán và đầu tư.',
      ),
    requirements:
      section('Yêu cầu', [
        'Từ 2 năm kinh nghiệm phát triển React Native',
        'Thành thạo TypeScript',
        'Kinh nghiệm publish ứng dụng lên App Store và Google Play',
        'Hiểu biết về native modules và performance optimization',
        'Kinh nghiệm tích hợp payment gateway (MoMo, VNPay, ZaloPay)',
      ]),
    benefits:
      section('Quyền lợi', [
        'Lương từ 22 - 40 triệu VNĐ/tháng',
        'Làm việc với sản phẩm có người dùng thực tế lớn',
        'Cơ hội học hỏi và phát triển trong lĩnh vực fintech',
        'Team nhỏ, quyết định nhanh, ít bureaucracy',
      ]),
    companyIndex: 1,
    daysUntilDeadline: 35,
  },

  // GlobalSoft Solutions
  {
    title: 'Java Developer (Spring Boot) - Dự án Nhật Bản',
    city: 'Đà Nẵng',
    location: 'Tầng 5, Tòa nhà Da Nang IT Park, Nguyễn Văn Linh, Đà Nẵng',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 18_000_000,
    salaryMax: 35_000_000,
    experienceMin: 2,
    quantity: 5,
    skills: ['Java', 'Spring Boot', 'PostgreSQL', 'MySQL', 'Git', 'Docker'],
    description:
      html(
        '<strong>GlobalSoft Solutions</strong> đang tuyển Java Developer tham gia dự án phát triển hệ thống quản lý ERP cho khách hàng Nhật Bản.',
        'Dự án kéo dài 2 năm với khả năng gia hạn, làm việc theo quy trình Agile với đội ngũ technical review từ phía Nhật Bản.',
      ),
    requirements:
      section('Yêu cầu kỹ thuật', [
        'Từ 2 năm kinh nghiệm phát triển Java (Java 11+)',
        'Thành thạo Spring Boot, Spring MVC, Spring Data JPA',
        'Kinh nghiệm với cơ sở dữ liệu quan hệ (PostgreSQL hoặc MySQL)',
        'Hiểu biết về RESTful API và tích hợp hệ thống',
        'Sử dụng thành thạo Git',
      ]) +
      section('Kỹ năng khác', [
        'Có thể đọc tài liệu kỹ thuật bằng tiếng Anh',
        'Kỹ năng giao tiếp tốt, làm việc nhóm hiệu quả',
        'Có kiến thức về Tiếng Nhật (N4 trở lên) là lợi thế lớn',
      ]),
    benefits:
      section('Chế độ đãi ngộ', [
        'Lương từ 18 - 35 triệu VNĐ/tháng',
        'Phụ cấp tiếng Nhật lên đến 3 triệu/tháng',
        'Cơ hội onsite Nhật Bản từ 3-6 tháng',
        'Đóng BHXH, BHYT, BHTN đầy đủ',
        'Hỗ trợ học tiếng Nhật tại công ty',
        'Môi trường làm việc chuyên nghiệp theo chuẩn ISO',
      ]),
    companyIndex: 2,
    daysUntilDeadline: 40,
  },
  {
    title: 'UI/UX Designer',
    city: 'Đà Nẵng',
    location: 'Tầng 5, Tòa nhà Da Nang IT Park, Nguyễn Văn Linh, Đà Nẵng',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 15_000_000,
    salaryMax: 28_000_000,
    experienceMin: 2,
    quantity: 2,
    skills: ['Figma', 'Adobe XD', 'UI/UX Design', 'Photoshop', 'HTML/CSS'],
    description:
      html(
        'GlobalSoft tìm kiếm <strong>UI/UX Designer</strong> sáng tạo để thiết kế trải nghiệm người dùng cho các sản phẩm phần mềm doanh nghiệp.',
        'Bạn sẽ làm việc trong đội ngũ đa quốc gia, thiết kế interface cho cả web và mobile app, đảm bảo trải nghiệm người dùng nhất quán và trực quan.',
      ),
    requirements:
      section('Yêu cầu', [
        'Ít nhất 2 năm kinh nghiệm UI/UX Design',
        'Thành thạo Figma (bắt buộc)',
        'Portfolio thể hiện ít nhất 3 dự án thực tế',
        'Hiểu biết về Design System và Component Library',
        'Kiến thức về User Research và Usability Testing',
        'Có thể làm prototype tương tác',
      ]),
    benefits:
      section('Quyền lợi', [
        'Lương từ 15 - 28 triệu VNĐ/tháng',
        'Creative environment với team design chuyên nghiệp',
        'Budget mua fonts, plugins, software design',
        'Tham gia các dự án đa dạng từ mobile đến enterprise',
        'Mentoring từ Senior Designer có kinh nghiệm quốc tế',
      ]),
    companyIndex: 2,
    daysUntilDeadline: 50,
  },

  // EcommerceVN Group
  {
    title: 'Data Engineer - Nền tảng Big Data',
    city: 'Hồ Chí Minh',
    location: 'Tòa nhà Viettel Complex, Số 285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 35_000_000,
    salaryMax: 65_000_000,
    experienceMin: 3,
    quantity: 3,
    skills: ['Python', 'Data Analysis', 'PostgreSQL', 'Elasticsearch', 'Docker', 'AWS'],
    description:
      html(
        'EcommerceVN Group đang xây dựng hạ tầng Big Data xử lý hàng tỷ sự kiện mỗi ngày từ các nền tảng thương mại điện tử của chúng tôi.',
        'Bạn sẽ là thành viên của đội Data Engineering gồm 20+ kỹ sư, xây dựng data pipeline, data warehouse và các công cụ phân tích phục vụ quyết định kinh doanh.',
      ),
    requirements:
      section('Yêu cầu kỹ thuật', [
        'Từ 3 năm kinh nghiệm Data Engineering hoặc Backend Engineering',
        'Thành thạo Python (PySpark, Pandas)',
        'Kinh nghiệm với Apache Spark, Kafka hoặc Flink',
        'Quen thuộc với cloud data warehouses (BigQuery, Redshift, hoặc Snowflake)',
        'Kinh nghiệm với SQL nâng cao và tối ưu hóa truy vấn',
        'Hiểu biết về ETL/ELT pipeline design',
      ]) +
      section('Ưu tiên', [
        'Kinh nghiệm với Airflow hoặc Prefect',
        'Kiến thức về dbt (data build tool)',
        'Từng làm việc trong môi trường e-commerce hoặc fintech',
      ]),
    benefits:
      section('Quyền lợi', [
        'Gói lương hấp dẫn từ 35 - 65 triệu VNĐ/tháng',
        'Thưởng KPI hàng quý, thưởng tháng 13-14',
        'Bảo hiểm sức khỏe cao cấp Bảo Việt cho cả gia đình',
        'Làm việc với dataset khổng lồ, công nghệ tiên tiến nhất',
        'Cơ hội onsite Singapore, Thái Lan hàng năm',
        '18 ngày phép/năm',
        'Gym membership, bữa trưa miễn phí tại văn phòng',
      ]),
    companyIndex: 3,
    daysUntilDeadline: 30,
  },
  {
    title: 'DevOps Engineer (AWS/Kubernetes)',
    city: 'Hồ Chí Minh',
    location: 'Tòa nhà Viettel Complex, Số 285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 28_000_000,
    salaryMax: 50_000_000,
    experienceMin: 3,
    quantity: 2,
    skills: ['AWS', 'Kubernetes', 'Docker', 'CI/CD', 'Python', 'Git'],
    description:
      html(
        'Chúng tôi tuyển <strong>DevOps Engineer</strong> để vận hành và cải thiện hạ tầng cloud phục vụ hàng triệu người dùng mỗi ngày trên các nền tảng EcommerceVN.',
        'Bạn sẽ làm việc với đội Infrastructure gồm 15 kỹ sư, chịu trách nhiệm tính sẵn sàng (uptime 99.9%), khả năng mở rộng và bảo mật của hệ thống.',
      ),
    requirements:
      section('Yêu cầu kỹ năng', [
        'Từ 3 năm kinh nghiệm DevOps hoặc Site Reliability Engineering',
        'Kinh nghiệm vận hành AWS (EC2, EKS, RDS, S3, CloudFront)',
        'Thành thạo Kubernetes và Docker',
        'Kinh nghiệm thiết lập CI/CD pipeline (Jenkins, GitHub Actions, hoặc GitLab CI)',
        'Kỹ năng scripting với Python hoặc Bash',
        'Kiến thức về monitoring và alerting (Prometheus, Grafana, ELK)',
      ]) +
      section('Ưu tiên', [
        'Chứng chỉ AWS (Solutions Architect hoặc DevOps Professional)',
        'Kinh nghiệm với Infrastructure as Code (Terraform, Pulumi)',
        'Từng xử lý sự cố hệ thống quy mô lớn (incident management)',
      ]),
    benefits:
      section('Quyền lợi', [
        'Lương từ 28 - 50 triệu VNĐ/tháng theo năng lực',
        'On-call allowance phụ cấp hấp dẫn',
        'Đào tạo và thi chứng chỉ AWS/GCP được công ty tài trợ 100%',
        'Thiết bị làm việc hiện đại',
        'Bảo hiểm sức khỏe toàn diện',
        'Môi trường kỹ thuật quy mô enterprise thực sự',
      ]),
    companyIndex: 3,
    daysUntilDeadline: 20,
  },
  {
    title: 'Thực tập sinh Marketing Digital',
    city: 'Hồ Chí Minh',
    location: 'Tòa nhà Viettel Complex, Số 285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh',
    jobType: JobType.INTERNSHIP,
    workMode: WorkMode.ONSITE,
    salaryMin: 4_000_000,
    salaryMax: 7_000_000,
    experienceMin: 0,
    quantity: 3,
    skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing'],
    description:
      html(
        'EcommerceVN Group tuyển <strong>Thực tập sinh Marketing Digital</strong> để tham gia vào đội ngũ marketing của nền tảng thương mại điện tử hàng đầu.',
        'Đây là cơ hội tuyệt vời để học hỏi thực tế trong môi trường doanh nghiệp lớn, làm việc với budget marketing hàng tỷ đồng.',
      ),
    requirements:
      section('Yêu cầu', [
        'Sinh viên năm 3-4 hoặc vừa tốt nghiệp ngành Marketing, Truyền thông, Kinh tế',
        'Đam mê với digital marketing và thương mại điện tử',
        'Có thể thực tập ít nhất 3 tháng, 5 ngày/tuần',
        'Kỹ năng viết nội dung tốt, sáng tạo',
        'Biết cơ bản về Google Analytics, Facebook Ads Manager là lợi thế',
      ]),
    benefits:
      section('Quyền lợi', [
        'Trợ cấp 4 - 7 triệu VNĐ/tháng',
        'Được mentor bởi các chuyên gia marketing có kinh nghiệm',
        'Cơ hội chuyển thành nhân viên chính thức sau thực tập',
        'Học hỏi với ngân sách quảng cáo thực tế hàng tỷ đồng',
        'Môi trường trẻ, năng động, sáng tạo',
        'Bữa trưa miễn phí và bãi đỗ xe',
      ]),
    companyIndex: 3,
    daysUntilDeadline: 15,
  },

  // Công ty ABC
  {
    title: 'Giám đốc Kinh doanh (Sales Director)',
    city: 'Hà Nội',
    location: 'Tầng 8, Tòa nhà Hà Thành Plaza, 102 Thái Thịnh, Đống Đa, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 50_000_000,
    salaryMax: 100_000_000,
    salaryNegotiable: true,
    experienceMin: 7,
    quantity: 1,
    skills: ['Business Development', 'Sales Management', 'CRM', 'Leadership', 'B2B Sales', 'Strategic Planning'],
    description:
      html(
        '<strong>Công ty ABC</strong> đang tìm kiếm <strong>Giám đốc Kinh doanh</strong> tài năng để dẫn dắt toàn bộ hoạt động kinh doanh và mở rộng thị phần trong giai đoạn phát triển chiến lược 2025–2030.',
        'Đây là vị trí cấp cao trong ban lãnh đạo, chịu trách nhiệm xây dựng chiến lược doanh thu, quản lý đội ngũ kinh doanh 50+ người và thiết lập quan hệ đối tác chiến lược mới.',
      ),
    requirements:
      section('Yêu cầu kinh nghiệm', [
        'Ít nhất 7 năm kinh nghiệm trong lĩnh vực kinh doanh, thương mại hoặc phân phối',
        'Ít nhất 3 năm kinh nghiệm ở vị trí quản lý cấp cao (Trưởng phòng kinh doanh trở lên)',
        'Đã từng xây dựng và quản lý đội ngũ kinh doanh từ 20 người trở lên',
        'Kinh nghiệm phát triển kênh phân phối B2B hoặc quản lý đối tác chiến lược',
        'Có mạng lưới quan hệ rộng trong ngành thương mại, phân phối là lợi thế lớn',
      ]) +
      section('Năng lực cần có', [
        'Tư duy chiến lược, khả năng phân tích thị trường và lập kế hoạch kinh doanh',
        'Kỹ năng đàm phán và thuyết phục ở cấp độ lãnh đạo doanh nghiệp',
        'Khả năng xây dựng văn hóa đội nhóm và phát triển nhân tài',
        'Tiếng Anh giao tiếp tốt (làm việc với đối tác quốc tế)',
        'Có kiến thức về CRM và các công cụ quản lý kinh doanh hiện đại',
      ]),
    benefits:
      section('Chế độ đãi ngộ hấp dẫn', [
        'Lương cơ bản từ 50 – 100 triệu VNĐ/tháng (thương lượng theo năng lực)',
        'Thưởng KPI hàng quý không giới hạn theo kết quả doanh thu',
        'Cổ phần ưu đãi (ESOP) sau 12 tháng làm việc',
        'Xe công ty hoặc phụ cấp xe hàng tháng',
        'Bảo hiểm sức khỏe toàn diện cho cả gia đình (gói Bảo Việt cao cấp)',
        '18 ngày phép/năm có lương, tăng theo thâm niên',
        'Cơ hội phát triển sự nghiệp lên vị trí Phó Tổng Giám đốc trong 3 năm',
      ]),
    companyIndex: 4,
    daysUntilDeadline: 45,
  },
]

// ── Article data ─────────────────────────────────────────────────────────────

const ARTICLE_CATEGORIES = [
  { name: 'Định hướng nghề nghiệp',          slug: 'dinh-huong-nghe-nghiep',      icon: 'compass',        order: 1 },
  { name: 'Bí kíp tìm việc',                  slug: 'bi-kip-tim-viec',             icon: 'lightbulb',      order: 2 },
  { name: 'Chế độ lương thưởng',              slug: 'che-do-luong-thuong',         icon: 'banknote',       order: 3 },
  { name: 'Kiến thức chuyên ngành',            slug: 'kien-thuc-chuyen-nganh',      icon: 'graduation-cap', order: 4 },
  { name: 'Hành trang nghề nghiệp',           slug: 'hanh-trang-nghe-nghiep',      icon: 'briefcase',      order: 5 },
  { name: 'Thị trường & xu hướng tuyển dụng', slug: 'thi-truong-xu-huong-tuyen-dung', icon: 'trending-up', order: 6 },
]

const ARTICLES = [
  {
    title: '7 kỹ năng mềm nhà tuyển dụng muốn nhìn thấy nhất năm 2025',
    slug: '7-ky-nang-mem-nha-tuyen-dung-can-2025',
    categorySlug: 'hanh-trang-nghe-nghiep',
    imageUrl: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&q=80&fit=crop',
    excerpt: 'Thị trường lao động 2025 ngày càng cạnh tranh. Ngoài chuyên môn, nhà tuyển dụng đang tìm kiếm những kỹ năng mềm nào ở ứng viên?',
    content:
      html(
        'Trong bối cảnh tự động hóa và AI đang thay thế nhiều công việc lặp lại, kỹ năng mềm trở thành yếu tố giúp ứng viên nổi bật và không thể bị máy móc thay thế.',
      ) +
      section('1. Tư duy phản biện (Critical Thinking)', [
        'Khả năng phân tích vấn đề từ nhiều góc độ và đưa ra quyết định có cơ sở',
        'Không chấp nhận thông tin một chiều, luôn đặt câu hỏi "tại sao"',
        'Biết đánh giá độ tin cậy của các nguồn thông tin',
      ]) +
      section('2. Giao tiếp hiệu quả', [
        'Trình bày ý tưởng rõ ràng, súc tích cả bằng lời nói và văn bản',
        'Lắng nghe chủ động và hiểu đúng ý người khác',
        'Điều chỉnh phong cách giao tiếp phù hợp với đối tượng (sếp, đồng nghiệp, khách hàng)',
      ]) +
      section('3. Khả năng thích nghi (Adaptability)', [
        'Sẵn sàng học công cụ, quy trình mới trong thời gian ngắn',
        'Giữ bình tĩnh và hiệu quả khi môi trường thay đổi đột ngột',
        'Coi thay đổi là cơ hội thay vì mối đe dọa',
      ]) +
      section('4. Làm việc nhóm và cộng tác từ xa', [
        'Kỹ năng làm việc hiệu quả trên các nền tảng như Slack, Notion, Jira',
        'Chủ động cập nhật tiến độ và đồng bộ thông tin với nhóm',
        'Xây dựng lòng tin trong môi trường hybrid/remote',
      ]) +
      section('5. Quản lý thời gian và ưu tiên công việc', [
        'Phân biệt việc khẩn cấp và quan trọng (ma trận Eisenhower)',
        'Không bị phân tâm bởi thông báo và cuộc họp không cần thiết',
        'Biết nói "không" để bảo vệ thời gian cho công việc ưu tiên cao',
      ]) +
      section('6. Trí tuệ cảm xúc (EQ)', [
        'Nhận biết và điều tiết cảm xúc của bản thân trong tình huống áp lực',
        'Đồng cảm và xây dựng mối quan hệ bền vững với đồng nghiệp',
        'Giải quyết xung đột một cách xây dựng, không cá nhân hóa vấn đề',
      ]) +
      section('7. Tư duy tăng trưởng (Growth Mindset)', [
        'Coi thất bại là bài học, không phải sự chấm dứt',
        'Chủ động tìm feedback và áp dụng để cải thiện',
        'Luôn tìm cách học thêm kỹ năng mới dù đã có kinh nghiệm',
      ]) +
      html('Kết hợp 7 kỹ năng mềm trên với chuyên môn vững chắc, bạn sẽ có hồ sơ rất hấp dẫn trong mắt nhà tuyển dụng năm 2025.'),
  },
  {
    title: 'Bí quyết vượt qua vòng phỏng vấn HR không phải ai cũng biết',
    slug: 'bi-quyet-vuot-qua-vong-phong-van-hr',
    categorySlug: 'bi-kip-tim-viec',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=800&q=80&fit=crop',
    excerpt: 'Vòng phỏng vấn HR tưởng đơn giản nhưng nhiều ứng viên giỏi chuyên môn lại bị loại ở đây. Bài viết chia sẻ những gì HR thực sự đang đánh giá.',
    content:
      html(
        'Vòng phỏng vấn với HR (Human Resources) là bước sàng lọc đầu tiên trong quy trình tuyển dụng. Nhiều ứng viên giỏi về chuyên môn lại bị loại ở đây vì không hiểu HR đang tìm kiếm điều gì.',
        'Dưới đây là những điều HR thực sự đánh giá và cách bạn có thể chuẩn bị tốt nhất.',
      ) +
      section('Những gì HR thực sự đánh giá', [
        '<strong>Văn hóa phù hợp (Culture fit):</strong> Giá trị cá nhân của bạn có phù hợp với văn hóa công ty không?',
        '<strong>Động lực ứng tuyển:</strong> Bạn muốn vị trí này vì tiền hay vì muốn đóng góp cho công ty?',
        '<strong>Ổn định và cam kết:</strong> Bạn có khả năng gắn bó lâu dài không?',
        '<strong>Khả năng giao tiếp:</strong> Cách bạn diễn đạt và lắng nghe trong cuộc trò chuyện',
      ]) +
      section('5 câu hỏi thường gặp và cách trả lời hay', [
        '<strong>"Hãy giới thiệu về bản thân"</strong> — Nói 2-3 phút, tập trung vào kinh nghiệm liên quan và lý do ứng tuyển, không đọc lại CV',
        '<strong>"Tại sao bạn muốn rời công ty cũ?"</strong> — Tập trung vào cơ hội phát triển, không nói xấu công ty/sếp cũ',
        '<strong>"Điểm yếu của bạn là gì?"</strong> — Chọn điểm yếu thật nhưng không ảnh hưởng core job, và chia sẻ cách bạn đang cải thiện',
        '<strong>"Bạn kỳ vọng mức lương bao nhiêu?"</strong> — Nghiên cứu thị trường trước, đưa ra range thay vì con số cứng',
        '<strong>"Bạn có câu hỏi gì không?"</strong> — Luôn chuẩn bị 2-3 câu hỏi thông minh về team, công việc cụ thể, định hướng phát triển',
      ]) +
      section('Những lỗi cần tránh', [
        'Không nghiên cứu về công ty trước khi đến phỏng vấn',
        'Đến muộn hoặc gửi lý do hủy lịch vào phút chót',
        'Nói xấu công ty cũ hoặc đồng nghiệp cũ',
        'Không có câu hỏi nào cho HR — thể hiện sự thụ động và thiếu quan tâm',
        'Mặc trang phục không phù hợp với văn hóa công ty',
      ]) +
      html('Nhớ rằng phỏng vấn là cuộc trò chuyện hai chiều — bạn cũng đang đánh giá công ty, không chỉ công ty đánh giá bạn.'),
  },
  {
    title: 'Cách viết CV chuẩn ATS để không bị lọc bởi phần mềm tuyển dụng',
    slug: 'cach-viet-cv-chuan-ats',
    categorySlug: 'bi-kip-tim-viec',
    imageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&q=80&fit=crop',
    excerpt: 'Hơn 75% CV bị lọc bởi phần mềm ATS trước khi HR đọc. Đây là cách viết CV để vượt qua bộ lọc này và đến tay nhà tuyển dụng.',
    content:
      html(
        'ATS (Applicant Tracking System) là phần mềm quản lý ứng viên mà hầu hết công ty lớn sử dụng để lọc hàng trăm CV mỗi ngày. Nghiên cứu cho thấy hơn 75% CV bị loại bởi ATS trước khi HR đọc.',
      ) +
      section('ATS hoạt động như thế nào?', [
        'Quét từ khóa từ job description và so sánh với nội dung CV',
        'Chấm điểm độ phù hợp dựa trên kỹ năng, tiêu đề công việc, kinh nghiệm',
        'Phân tích cấu trúc CV để trích xuất thông tin (tên, email, kỹ năng, kinh nghiệm)',
        'Lọc bỏ CV không đạt điểm tối thiểu do nhà tuyển dụng đặt ra',
      ]) +
      section('5 nguyên tắc viết CV chuẩn ATS', [
        '<strong>Dùng từ khóa từ JD:</strong> Copy y chang tiêu đề kỹ năng trong job description (ví dụ: "React.js" không phải "ReactJS")',
        '<strong>Định dạng đơn giản:</strong> Tránh bảng biểu, cột nhiều, text box — ATS không đọc được',
        '<strong>File .docx hoặc .pdf không có bảo vệ:</strong> Một số ATS không đọc được PDF phức tạp',
        '<strong>Font chữ chuẩn:</strong> Arial, Calibri, Times New Roman — không dùng font lạ',
        '<strong>Đặt tiêu đề section chuẩn:</strong> "Kinh nghiệm làm việc", "Học vấn", "Kỹ năng" — không đặt tên sáng tạo',
      ]) +
      section('Cấu trúc CV 1 trang tối ưu', [
        'Họ tên + thông tin liên hệ (email, điện thoại, LinkedIn, GitHub nếu có)',
        'Summary 3-4 dòng: tóm tắt kinh nghiệm và giá trị bạn mang lại',
        'Kinh nghiệm làm việc: theo thứ tự thời gian ngược, mỗi vị trí có 3-5 bullet points với số liệu cụ thể',
        'Kỹ năng kỹ thuật: liệt kê ngắn gọn, đúng tên',
        'Học vấn: trường, ngành, năm tốt nghiệp',
      ]) +
      html('Mẹo cuối: Sau khi viết xong, paste CV vào tool kiểm tra ATS như Jobscan hoặc Resume Worded để xem điểm số trước khi nộp.'),
  },
  {
    title: 'Thương lượng lương: Nên nói gì khi nhà tuyển dụng hỏi mức lương mong muốn?',
    slug: 'thuong-luong-luong-khi-phong-van',
    categorySlug: 'che-do-luong-thuong',
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&q=80&fit=crop',
    excerpt: 'Câu hỏi về lương trong phỏng vấn khiến nhiều ứng viên lúng túng. Đây là chiến lược thương lượng giúp bạn không bị thiệt trong đàm phán.',
    content:
      html(
        '"Mức lương mong muốn của bạn là bao nhiêu?" — đây là câu hỏi khiến nhiều ứng viên đổ mồ hôi. Trả lời quá thấp, bạn bị thiệt. Trả lời quá cao, bạn có thể mất cơ hội. Vậy chiến lược tối ưu là gì?',
      ) +
      section('Bước 1: Nghiên cứu thị trường trước khi đến phỏng vấn', [
        'Tham khảo các trang như ITviec, TopCV, Glassdoor để biết mức lương thị trường cho vị trí tương tự',
        'Hỏi bạn bè hoặc cựu đồng nghiệp đang làm vị trí tương tự',
        'Xem xét yếu tố: cấp độ kinh nghiệm, quy mô công ty, industry, thành phố',
        'Xác định range của bạn: mức tối thiểu bạn chấp nhận và mức lý tưởng',
      ]) +
      section('Chiến lược trả lời thông minh', [
        '<strong>Đưa ra range, không phải con số cứng:</strong> "Tôi kỳ vọng trong khoảng 25-30 triệu, tùy thuộc vào toàn bộ gói đãi ngộ"',
        '<strong>Để họ hỏi trước:</strong> "Tôi muốn tìm hiểu thêm về vị trí và package của công ty trước khi đưa ra con số cụ thể"',
        '<strong>Justify bằng giá trị:</strong> "Dựa trên X năm kinh nghiệm và Y thành tích, tôi kỳ vọng mức Z"',
        '<strong>Hỏi ngược:</strong> "Budget dự kiến của công ty cho vị trí này là bao nhiêu?"',
      ]) +
      section('Những yếu tố ngoài lương cần thương lượng', [
        'Ngày phép năm (nhiều hơn mức tối thiểu theo luật)',
        'Lịch làm việc linh hoạt / work from home',
        'Ngân sách học tập và phát triển bản thân',
        'Review lương sau 6 tháng thay vì 12 tháng',
        'Bảo hiểm sức khỏe, bảo hiểm tai nạn',
      ]) +
      html('Nhớ rằng: Đàm phán lương là hoàn toàn bình thường và được kỳ vọng. Công ty nào cũng để margin để đàm phán — bạn chỉ cần dũng cảm hỏi.'),
  },
  {
    title: '10 câu hỏi phỏng vấn thường gặp nhất và cách trả lời thuyết phục',
    slug: '10-cau-hoi-phong-van-thuong-gap-va-cach-tra-loi',
    categorySlug: 'bi-kip-tim-viec',
    imageUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80&fit=crop',
    excerpt: 'Chuẩn bị trước 10 câu hỏi phỏng vấn phổ biến nhất giúp bạn tự tin và tạo ấn tượng mạnh với nhà tuyển dụng.',
    content:
      html(
        'Dù mỗi cuộc phỏng vấn có điểm riêng, nhưng 10 câu hỏi dưới đây xuất hiện trong hầu hết mọi buổi phỏng vấn. Chuẩn bị câu trả lời tốt cho những câu này là nền tảng để bạn tự tin và chuyên nghiệp.',
      ) +
      section('Top 10 câu hỏi và gợi ý trả lời', [
        '<strong>"Hãy giới thiệu về bản thân"</strong> — Công thức: Hiện tại → Quá khứ → Tương lai. Tập trung vào kinh nghiệm liên quan, giữ trong 2 phút',
        '<strong>"Tại sao bạn muốn làm việc ở đây?"</strong> — Nghiên cứu công ty, mention 2-3 điều cụ thể bạn thích: sản phẩm, văn hóa, mission',
        '<strong>"Điểm mạnh của bạn là gì?"</strong> — Chọn 2-3 điểm mạnh liên quan đến job, kèm ví dụ cụ thể minh họa',
        '<strong>"Điểm yếu của bạn là gì?"</strong> — Chọn điểm yếu thật nhưng không cốt lõi, và chia sẻ cách bạn đang khắc phục',
        '<strong>"Tại sao bạn rời công ty cũ?"</strong> — Nói về cơ hội mới, không phàn nàn về sếp/đồng nghiệp cũ',
        '<strong>"Thành tích nào bạn tự hào nhất?"</strong> — Dùng format STAR (Situation, Task, Action, Result) với số liệu cụ thể',
        '<strong>"Bạn xử lý áp lực như thế nào?"</strong> — Cho ví dụ thực tế, nói về kỹ năng ưu tiên và quản lý thời gian',
        '<strong>"Kế hoạch 5 năm tới của bạn là gì?"</strong> — Liên kết mục tiêu cá nhân với định hướng phát triển của công ty',
        '<strong>"Bạn muốn lương bao nhiêu?"</strong> — Đưa ra range sau khi nghiên cứu thị trường',
        '<strong>"Bạn có câu hỏi gì cho chúng tôi không?"</strong> — Luôn chuẩn bị ít nhất 3 câu hỏi về công việc, team, cơ hội phát triển',
      ]) +
      html('Luyện tập với bạn bè hoặc tự quay video để nghe lại câu trả lời của mình. Nghe lại sẽ giúp bạn nhận ra những thói quen ngôn ngữ cần cải thiện.'),
  },
  {
    title: 'LinkedIn profile hoàn hảo: Làm thế nào để HR chủ động tìm đến bạn',
    slug: 'linkedin-profile-hoan-hao-de-hr-chu-dong-tim-ban',
    categorySlug: 'bi-kip-tim-viec',
    imageUrl: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=800&q=80&fit=crop',
    excerpt: 'Một LinkedIn profile được tối ưu tốt có thể thu hút HR chủ động liên hệ bạn. Đây là checklist đầy đủ để xây dựng profile nổi bật.',
    content:
      html(
        'LinkedIn là mạng xã hội nghề nghiệp lớn nhất thế giới với hơn 1 tỷ thành viên. Tại Việt Nam, ngày càng nhiều HR và headhunter sử dụng LinkedIn để tìm kiếm ứng viên tiềm năng.',
        'Một profile được tối ưu tốt không chỉ giúp bạn tìm việc chủ động mà còn để HR tìm đến bạn — đặc biệt quan trọng cho các senior và chuyên gia.',
      ) +
      section('Checklist LinkedIn profile hoàn hảo', [
        '<strong>Ảnh đại diện chuyên nghiệp:</strong> Ảnh rõ mặt, trang phục lịch sự, nền sáng — không dùng ảnh du lịch hay selfie',
        '<strong>Ảnh bìa (banner):</strong> Đặt banner liên quan đến ngành nghề hoặc thành tích của bạn',
        '<strong>Headline hấp dẫn:</strong> Không chỉ ghi chức danh, hãy ghi thêm giá trị: "Senior Backend Developer | NestJS & AWS | Xây dựng hệ thống phục vụ 1M+ users"',
        '<strong>About section sáng tạo:</strong> 3-5 câu về bạn là ai, bạn làm gì xuất sắc, và bạn đang tìm kiếm cơ hội gì',
        '<strong>Bật "Open to Work":</strong> Cài chế độ chỉ hiện với HR/Recruiter để không sếp cũ biết',
        '<strong>Kinh nghiệm đầy đủ:</strong> Mỗi vị trí có mô tả thành tích với số liệu cụ thể',
        '<strong>Skills section tối thiểu 10 kỹ năng:</strong> Sắp xếp kỹ năng quan trọng nhất lên top 3',
        '<strong>Endorsement và Recommendation:</strong> Nhờ đồng nghiệp/sếp cũ viết recommendation',
        '<strong>URL cá nhân hóa:</strong> Đổi từ linkedin.com/in/abc123 thành linkedin.com/in/tennguoidung',
      ]) +
      section('Cách tăng khả năng được HR tìm thấy', [
        'Post bài viết/comment trong ngành thường xuyên (ít nhất 1 lần/tuần)',
        'Tham gia và đóng góp trong các group liên quan đến ngành',
        'Kết nối với HR, headhunter trong ngành của bạn',
        'Sử dụng từ khóa ngành trong headline và About section',
      ]) +
      html('Hãy nhớ: LinkedIn profile là CV "sống" — cập nhật nó ngay khi bạn có thành tích mới, không cần đợi đến lúc đi tìm việc.'),
  },
  {
    title: 'Checklist 30 ngày đầu tiên đi làm để gây ấn tượng với sếp mới',
    slug: 'checklist-30-ngay-dau-di-lam',
    categorySlug: 'dinh-huong-nghe-nghiep',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&fit=crop',
    excerpt: '30 ngày đầu tiên tại công ty mới có thể định hình toàn bộ sự nghiệp của bạn ở đó. Đây là kế hoạch cụ thể để bắt đầu đúng cách.',
    content:
      html(
        '30 ngày đầu tại công ty mới rất quan trọng — đây là thời gian bạn xây dựng ấn tượng ban đầu, thiết lập mối quan hệ và hiểu văn hóa công ty. Đừng để áp lực thứ 1 ngày làm bạn hành động sai.',
      ) +
      section('Tuần 1: Quan sát và lắng nghe', [
        'Ghi chép tên, chức danh và phong cách làm việc của từng người trong team',
        'Đặt câu hỏi để hiểu rõ kỳ vọng công việc, không giả định',
        'Tìm hiểu quy trình, tool và cách team giao tiếp (Slack, email, họp mặt...)',
        'Không đề xuất thay đổi gì trong tuần đầu — hãy hiểu đã rồi mới làm',
      ]) +
      section('Tuần 2-3: Chứng minh năng lực cơ bản', [
        'Hoàn thành đúng hạn những task được giao, dù nhỏ',
        'Chủ động báo cáo tiến độ cho sếp, không đợi được hỏi',
        'Xây dựng thói quen làm việc đúng giờ, chuẩn bị đầy đủ trước các cuộc họp',
        'Giúp đỡ đồng nghiệp khi có thể — đây là cách nhanh nhất để hòa nhập',
      ]) +
      section('Tuần 4: Đề xuất giá trị đầu tiên', [
        'Chia sẻ một quan sát hoặc đề xuất nhỏ về cách cải thiện một quy trình',
        'Xin buổi 1-on-1 với sếp để nhận feedback về 30 ngày đầu',
        'Đặt mục tiêu rõ ràng cho 60 ngày và 90 ngày tiếp theo',
        'Mạng lưới nội bộ: kết nối với ít nhất 5-10 người ở các team khác',
      ]) +
      html('Nhớ rằng: 30 ngày đầu là thời gian học, không phải thời gian thể hiện. Hãy khiêm tốn, ham học và đáng tin cậy — mọi thứ khác sẽ đến sau.'),
  },
  {
    title: 'Burnout là gì và cách phục hồi khi kiệt sức vì công việc',
    slug: 'burnout-kiet-suc-va-cach-phuc-hoi',
    categorySlug: 'dinh-huong-nghe-nghiep',
    imageUrl: 'https://images.unsplash.com/photo-1541199249251-f713e6145474?w=800&q=80&fit=crop',
    excerpt: 'Burnout không phải là lười biếng — đó là hậu quả của stress kéo dài tích lũy. Nhận biết sớm và có kế hoạch phục hồi là chìa khóa.',
    content:
      html(
        'Theo WHO, burnout (kiệt sức nghề nghiệp) là một hiện tượng nghề nghiệp được đặc trưng bởi cảm giác cạn kiệt năng lượng, ngày càng xa cách tinh thần với công việc và giảm hiệu quả chuyên môn.',
        'Burnout phổ biến hơn bạn nghĩ — đặc biệt trong các ngành như IT, tài chính, y tế và marketing với áp lực cao và ranh giới công việc-cuộc sống mờ nhạt.',
      ) +
      section('Dấu hiệu nhận biết burnout', [
        'Mệt mỏi liên tục dù đã ngủ đủ giấc',
        'Cảm thấy lạnh nhạt, vô cảm với công việc từng yêu thích',
        'Hiệu suất giảm dù làm việc nhiều giờ hơn',
        'Dễ cáu kỉnh, mất kiên nhẫn với đồng nghiệp',
        'Lo lắng đến công việc ngay cả ngoài giờ làm',
        'Thường xuyên đau đầu, đau vai cổ, mất ngủ',
      ]) +
      section('Nguyên nhân phổ biến', [
        'Workload quá cao trong thời gian dài mà không có nghỉ ngơi',
        'Thiếu quyền kiểm soát công việc (bị micromanage)',
        'Không được công nhận hoặc thưởng xứng đáng',
        'Môi trường làm việc độc hại, thiếu hỗ trợ từ team',
        'Mất phương hướng và ý nghĩa trong công việc',
      ]) +
      section('Kế hoạch phục hồi từng bước', [
        '<strong>Ngắn hạn:</strong> Nghỉ phép nếu có thể — không check email, không họp online',
        '<strong>Trung hạn:</strong> Thiết lập ranh giới rõ ràng: tắt máy tính đúng giờ, không nhận thêm task ngoài scope',
        '<strong>Dài hạn:</strong> Nói chuyện với sếp về workload, yêu cầu điều chỉnh nếu cần',
        'Tìm lại nguồn năng lượng: thể thao, sở thích ngoài công việc, kết nối xã hội',
        'Nếu tình trạng nghiêm trọng: tham khảo chuyên gia tâm lý hoặc xem xét thay đổi công việc',
      ]) +
      html('Burnout không biến mất khi bạn cố gắng chịu đựng thêm. Nhận ra nó sớm và có hành động là điều thông minh nhất bạn có thể làm cho sự nghiệp lâu dài.'),
  },
  {
    title: 'Kỹ năng đàm phán tăng lương: Cách đặt vấn đề để sếp nói có',
    slug: 'ky-nang-dam-phan-tang-luong',
    categorySlug: 'che-do-luong-thuong',
    imageUrl: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80&fit=crop',
    excerpt: 'Xin tăng lương là kỹ năng quan trọng nhưng ít người làm đúng. Đây là framework giúp bạn chuẩn bị và đặt vấn đề hiệu quả với sếp.',
    content:
      html(
        'Nghiên cứu cho thấy nhân viên chủ động xin tăng lương có tỷ lệ thành công cao hơn 70% so với người chờ sếp tự đề xuất. Vấn đề không phải là bạn có xứng đáng không, mà là bạn đặt vấn đề như thế nào.',
      ) +
      section('Thời điểm tốt nhất để xin tăng lương', [
        'Sau khi hoàn thành dự án lớn có kết quả đo lường được',
        'Trước hoặc trong kỳ review hiệu suất định kỳ',
        'Khi công ty vừa có kết quả kinh doanh tốt',
        'Khi bạn vừa nhận thêm trách nhiệm hoặc role mới',
        'Khi bạn có offer từ nơi khác (cẩn thận — dùng như leverage, không phải đe dọa)',
      ]) +
      section('Cách chuẩn bị trước cuộc họp', [
        'Ghi lại các thành tích 6-12 tháng qua với số liệu cụ thể (tăng X%, tiết kiệm Y triệu, hoàn thành Z dự án)',
        'Nghiên cứu mức lương thị trường cho vị trí tương tự (Glassdoor, ITviec, hỏi headhunter)',
        'Xác định con số mong muốn và mức tối thiểu bạn chấp nhận',
        'Chuẩn bị cho phản đối phổ biến: "ngân sách eo hẹp", "chờ review cuối năm"',
      ]) +
      section('Script đặt vấn đề hiệu quả', [
        'Bắt đầu bằng sự biết ơn và cam kết với team: "Tôi rất hài lòng với công việc và muốn gắn bó lâu dài..."',
        'Dẫn bằng thành tích cụ thể: "Trong 6 tháng vừa qua, tôi đã [thành tích A, B, C]..."',
        'Đặt câu hỏi trực tiếp: "Tôi muốn thảo luận về việc điều chỉnh lương phù hợp hơn với đóng góp hiện tại"',
        'Nêu con số cụ thể: "Dựa trên thị trường và đóng góp, tôi kỳ vọng mức X"',
        'Lắng nghe phản hồi và sẵn sàng thương lượng',
      ]) +
      html('Nếu câu trả lời là "chưa được lúc này", hãy hỏi ngay: "Điều kiện cụ thể nào để tôi có thể được xem xét tăng lương?" — Điều này biến "không" thành một lộ trình có thể theo dõi.'),
  },
  {
    title: 'Chuyển ngành sự nghiệp: Khi nào nên và làm thế nào để chuyển thành công?',
    slug: 'chuyen-nganh-su-nghiep-khi-nao-va-lam-the-nao',
    categorySlug: 'dinh-huong-nghe-nghiep',
    imageUrl: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=800&q=80&fit=crop',
    excerpt: 'Chuyển ngành là quyết định lớn nhưng không hiếm. Hàng nghìn người làm điều này thành công mỗi năm. Đây là cách tiếp cận có hệ thống để chuyển ngành không rủi ro.',
    content:
      html(
        'Trung bình người đi làm đổi nghề 5-7 lần trong cuộc đời. Chuyển ngành không phải thất bại mà là sự phát triển — khi bạn nhận ra đam mê và thế mạnh thực sự của mình.',
      ) +
      section('Dấu hiệu đến lúc cần chuyển ngành', [
        'Bạn không còn hứng thú với công việc sau nhiều năm cố gắng thay đổi',
        'Trần thủy tinh (glass ceiling) — ngành hiện tại không còn cơ hội phát triển',
        'Ngành đang thu hẹp hoặc bị tự động hóa thay thế',
        'Thu nhập bị giới hạn dù bạn đã ở top của ngành',
        'Bạn liên tục bị thu hút bởi một lĩnh vực khác',
      ]) +
      section('Phân tích trước khi quyết định', [
        'Làm bài tự đánh giá: thế mạnh chuyển giao được (transferable skills), giá trị nghề nghiệp, sở thích',
        'Nghiên cứu ngành muốn chuyển: cơ hội, mức lương, yêu cầu kỹ năng, xu hướng 5-10 năm tới',
        'Nói chuyện với 5-10 người đang làm trong ngành đó để có góc nhìn thực tế',
        'Tính toán tài chính: bạn có thể chịu được giai đoạn lương thấp hơn trong bao lâu?',
      ]) +
      section('Lộ trình chuyển ngành không rủi ro', [
        '<strong>Giai đoạn 1 (0-3 tháng):</strong> Học kỹ năng cơ bản qua khóa online, sách, bootcamp — trong khi vẫn đang đi làm',
        '<strong>Giai đoạn 2 (3-6 tháng):</strong> Xây dựng portfolio, làm project nhỏ, freelance, tình nguyện để có kinh nghiệm thực tế',
        '<strong>Giai đoạn 3 (6-12 tháng):</strong> Nộp đơn vào các vị trí junior trong ngành mới, networking tích cực',
        'Cân nhắc "lateral move": chuyển sang role lai giữa ngành cũ và ngành mới (ví dụ: kế toán → FinTech)',
      ]) +
      html('Chuyển ngành đòi hỏi can đảm, nhưng ở tuổi 25, 30 hay 40 — không bao giờ là quá muộn nếu bạn có kế hoạch rõ ràng và sẵn sàng đầu tư vào bản thân.'),
  },
]

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('🌱 Seeding database...\n')

  // Skills
  console.log('Creating skills...')
  const skills = await Promise.all(
    SKILL_NAMES.map((name) =>
      prisma.skill.upsert({
        where: { slug: toSlug(name) },
        update: {},
        create: { name, slug: toSlug(name) },
      }),
    ),
  )
  const skillMap = Object.fromEntries(skills.map((s) => [s.name, s]))
  console.log(`  ✓ ${skills.length} skills`)

  // Admin — always update password so seed is the source of truth
  const adminHash = await bcrypt.hash('Admin@123', 10)
  await prisma.user.upsert({
    where: { email: 'admin@tuyendung.vn' },
    update: { password: adminHash },
    create: {
      email: 'admin@tuyendung.vn',
      password: adminHash,
      role: Role.ADMIN,
      emailVerified: true,
    },
  })
  console.log('  ✓ Admin: admin@tuyendung.vn / Admin@123')

  // Candidates
  const candidateData = [
    {
      email: 'candidate@example.com',
      fullName: 'Nguyễn Văn An',
      title: 'Senior Frontend Developer',
      city: 'Hà Nội',
      phone: '0901234561',
      summary: 'Senior Frontend Developer với 3 năm kinh nghiệm xây dựng ứng dụng React và Next.js hiệu suất cao. Thành thạo TypeScript, Tailwind CSS và tối ưu hóa Core Web Vitals.',
      skills: [
        { name: 'React', level: 'ADVANCED' as const },
        { name: 'TypeScript', level: 'ADVANCED' as const },
        { name: 'Next.js', level: 'ADVANCED' as const },
        { name: 'Tailwind CSS', level: 'INTERMEDIATE' as const },
        { name: 'HTML/CSS', level: 'ADVANCED' as const },
        { name: 'GraphQL', level: 'INTERMEDIATE' as const },
      ],
    },
    {
      email: 'candidate2@example.com',
      fullName: 'Trần Thị Bích',
      title: 'Backend Developer',
      city: 'Hồ Chí Minh',
      phone: '0901234562',
      summary: 'Backend developer 4 năm kinh nghiệm với Python và Node.js. Thích làm việc với dữ liệu lớn và tối ưu hệ thống phân tán.',
      skills: [
        { name: 'Python', level: 'ADVANCED' as const },
        { name: 'Node.js', level: 'INTERMEDIATE' as const },
        { name: 'PostgreSQL', level: 'ADVANCED' as const },
        { name: 'FastAPI', level: 'ADVANCED' as const },
        { name: 'Docker', level: 'INTERMEDIATE' as const },
      ],
    },
    // ── Ứng viên phù hợp cho Công ty ABC (Giám đốc Kinh doanh) ─────────
    {
      email: 'hoangminh.sales@gmail.com',
      fullName: 'Lê Hoàng Minh',
      title: 'Giám đốc Kinh doanh Vùng',
      city: 'Hà Nội',
      phone: '0912345681',
      summary: '8 năm kinh nghiệm kinh doanh B2B trong lĩnh vực phân phối FMCG và hàng tiêu dùng. Từng là Giám đốc Kinh doanh Vùng tại Masan Group, quản lý đội ngũ 60 nhân sự và doanh thu 500 tỷ/năm. Thành thạo xây dựng chiến lược kênh phân phối đa cấp và đàm phán hợp đồng cấp C-level.',
      skills: [
        { name: 'Business Development', level: 'ADVANCED' as const },
        { name: 'Sales Management', level: 'ADVANCED' as const },
        { name: 'B2B Sales', level: 'ADVANCED' as const },
        { name: 'Leadership', level: 'ADVANCED' as const },
        { name: 'Strategic Planning', level: 'INTERMEDIATE' as const },
        { name: 'CRM', level: 'INTERMEDIATE' as const },
        { name: 'Negotiation', level: 'ADVANCED' as const },
      ],
    },
    {
      email: 'hongnhung.director@gmail.com',
      fullName: 'Nguyễn Thị Hồng Nhung',
      title: 'Trưởng phòng Kinh doanh Quốc gia',
      city: 'Hà Nội',
      phone: '0912345682',
      summary: '9 năm kinh nghiệm kinh doanh trong ngành thương mại và phân phối. Hiện là Trưởng phòng Kinh doanh Quốc gia tại Unilever Việt Nam, quản lý 200+ tài khoản đối tác và doanh số 800 tỷ/năm. Đang tìm cơ hội thăng tiến lên vị trí Giám đốc để thực hiện tầm nhìn chiến lược lớn hơn.',
      skills: [
        { name: 'Business Development', level: 'ADVANCED' as const },
        { name: 'Sales Management', level: 'ADVANCED' as const },
        { name: 'Account Management', level: 'ADVANCED' as const },
        { name: 'B2B Sales', level: 'ADVANCED' as const },
        { name: 'Leadership', level: 'INTERMEDIATE' as const },
        { name: 'Strategic Planning', level: 'ADVANCED' as const },
        { name: 'Data Analysis', level: 'INTERMEDIATE' as const },
        { name: 'CRM', level: 'ADVANCED' as const },
      ],
    },
    // ── Ứng viên phù hợp cho TechCorp Vietnam ──────────────────────────
    {
      email: 'minhduc.dev@gmail.com',
      fullName: 'Nguyễn Minh Đức',
      title: 'Senior Frontend Developer',
      city: 'Hà Nội',
      phone: '0912345671',
      summary: '4 năm kinh nghiệm frontend với React ecosystem. Đã làm việc với team lớn 50+ dev tại FPT Software, thành thạo Next.js App Router và TypeScript strict mode. Ưa thích code clean và performance optimization.',
      skills: [
        { name: 'React', level: 'ADVANCED' as const },
        { name: 'Next.js', level: 'ADVANCED' as const },
        { name: 'TypeScript', level: 'ADVANCED' as const },
        { name: 'Tailwind CSS', level: 'ADVANCED' as const },
        { name: 'HTML/CSS', level: 'ADVANCED' as const },
        { name: 'REST API', level: 'INTERMEDIATE' as const },
        { name: 'GraphQL', level: 'INTERMEDIATE' as const },
        { name: 'Git', level: 'ADVANCED' as const },
      ],
    },
    {
      email: 'levanhung.be@gmail.com',
      fullName: 'Lê Văn Hùng',
      title: 'Backend Developer (NestJS)',
      city: 'Hà Nội',
      phone: '0912345672',
      summary: '3 năm xây dựng backend microservices với NestJS và Node.js. Kinh nghiệm thiết kế REST API, tích hợp PostgreSQL + Redis, triển khai trên Docker. Đã handle hệ thống 500k req/ngày.',
      skills: [
        { name: 'Node.js', level: 'ADVANCED' as const },
        { name: 'NestJS', level: 'ADVANCED' as const },
        { name: 'TypeScript', level: 'ADVANCED' as const },
        { name: 'PostgreSQL', level: 'ADVANCED' as const },
        { name: 'Redis', level: 'INTERMEDIATE' as const },
        { name: 'Docker', level: 'INTERMEDIATE' as const },
        { name: 'REST API', level: 'ADVANCED' as const },
        { name: 'Microservices', level: 'INTERMEDIATE' as const },
      ],
    },
    // ── Ứng viên phù hợp cho StartupXYZ Fintech ────────────────────────
    {
      email: 'thuhuong.fullstack@gmail.com',
      fullName: 'Phạm Thị Thu Hương',
      title: 'Full Stack Developer',
      city: 'Hồ Chí Minh',
      phone: '0912345673',
      summary: '5 năm full stack với React (frontend) và Python/FastAPI (backend). Đã build và deploy 3 sản phẩm fintech từ đầu, quen với remote-first culture. Thành thạo PostgreSQL schema design và AWS deployment.',
      skills: [
        { name: 'React', level: 'ADVANCED' as const },
        { name: 'Python', level: 'ADVANCED' as const },
        { name: 'FastAPI', level: 'ADVANCED' as const },
        { name: 'PostgreSQL', level: 'ADVANCED' as const },
        { name: 'Docker', level: 'ADVANCED' as const },
        { name: 'AWS', level: 'INTERMEDIATE' as const },
        { name: 'TypeScript', level: 'INTERMEDIATE' as const },
        { name: 'Git', level: 'ADVANCED' as const },
      ],
    },
    {
      email: 'kimchi.mobile@gmail.com',
      fullName: 'Ngô Thị Kim Chi',
      title: 'Mobile Developer (React Native)',
      city: 'Hồ Chí Minh',
      phone: '0912345674',
      summary: '3 năm phát triển React Native cho iOS và Android. Đã publish 4 app lên Store, kinh nghiệm tích hợp MoMo và VNPay. Thành thạo TypeScript và native modules khi cần thiết.',
      skills: [
        { name: 'React Native', level: 'ADVANCED' as const },
        { name: 'TypeScript', level: 'ADVANCED' as const },
        { name: 'React', level: 'INTERMEDIATE' as const },
        { name: 'REST API', level: 'INTERMEDIATE' as const },
        { name: 'JavaScript', level: 'ADVANCED' as const },
      ],
    },
    // ── Ứng viên phù hợp cho GlobalSoft Solutions ──────────────────────
    {
      email: 'hoangnambk.java@gmail.com',
      fullName: 'Hoàng Văn Nam',
      title: 'Java Developer (Spring Boot)',
      city: 'Đà Nẵng',
      phone: '0912345675',
      summary: '3 năm kinh nghiệm Java với Spring Boot và Spring Data JPA. Từng làm dự án outsource cho khách Nhật tại Axon Active. Biết tiếng Nhật N3, quen quy trình Agile với khách hàng nước ngoài.',
      skills: [
        { name: 'Java', level: 'ADVANCED' as const },
        { name: 'Spring Boot', level: 'ADVANCED' as const },
        { name: 'PostgreSQL', level: 'ADVANCED' as const },
        { name: 'MySQL', level: 'INTERMEDIATE' as const },
        { name: 'Docker', level: 'INTERMEDIATE' as const },
        { name: 'Git', level: 'ADVANCED' as const },
        { name: 'REST API', level: 'ADVANCED' as const },
      ],
    },
    {
      email: 'lananh.designer@gmail.com',
      fullName: 'Vũ Thị Lan Anh',
      title: 'UI/UX Designer',
      city: 'Đà Nẵng',
      phone: '0912345676',
      summary: 'UI/UX Designer với 3 năm kinh nghiệm thiết kế sản phẩm số. Thành thạo Figma, Adobe XD và Photoshop. Portfolio gồm 6 dự án thực tế từ mobile app đến enterprise dashboard. Quan tâm đến accessibility và design system.',
      skills: [
        { name: 'Figma', level: 'ADVANCED' as const },
        { name: 'Adobe XD', level: 'ADVANCED' as const },
        { name: 'UI/UX Design', level: 'ADVANCED' as const },
        { name: 'Photoshop', level: 'INTERMEDIATE' as const },
        { name: 'HTML/CSS', level: 'INTERMEDIATE' as const },
      ],
    },
    // ── Ứng viên phù hợp cho EcommerceVN Group ─────────────────────────
    {
      email: 'dinkhoa.data@gmail.com',
      fullName: 'Trần Đình Khoa',
      title: 'Data Engineer',
      city: 'Hồ Chí Minh',
      phone: '0912345677',
      summary: '4 năm Data Engineering tại VNG, chuyên xây dựng data pipeline xử lý hàng tỷ event/ngày với PySpark và Kafka. Thành thạo BigQuery, Airflow và dbt. Bằng thạc sĩ Khoa học Dữ liệu, ĐH Bách Khoa HCM.',
      skills: [
        { name: 'Python', level: 'ADVANCED' as const },
        { name: 'Data Analysis', level: 'ADVANCED' as const },
        { name: 'PostgreSQL', level: 'ADVANCED' as const },
        { name: 'Elasticsearch', level: 'INTERMEDIATE' as const },
        { name: 'Docker', level: 'INTERMEDIATE' as const },
        { name: 'AWS', level: 'INTERMEDIATE' as const },
        { name: 'Machine Learning', level: 'INTERMEDIATE' as const },
      ],
    },
    {
      email: 'ducthanh.devops@gmail.com',
      fullName: 'Bùi Đức Thành',
      title: 'DevOps / SRE Engineer',
      city: 'Hồ Chí Minh',
      phone: '0912345678',
      summary: '4 năm DevOps/SRE tại Tiki. Vận hành cluster Kubernetes 200+ node trên AWS EKS. Thiết kế CI/CD pipeline với GitHub Actions và GitLab CI. Chứng chỉ AWS Solutions Architect Professional. Kinh nghiệm incident management cho hệ thống 99.9% uptime.',
      skills: [
        { name: 'AWS', level: 'ADVANCED' as const },
        { name: 'Kubernetes', level: 'ADVANCED' as const },
        { name: 'Docker', level: 'ADVANCED' as const },
        { name: 'CI/CD', level: 'ADVANCED' as const },
        { name: 'Python', level: 'INTERMEDIATE' as const },
        { name: 'Git', level: 'ADVANCED' as const },
      ],
    },
  ]

  for (const c of candidateData) {
    await prisma.user.upsert({
      where: { email: c.email },
      update: {},
      create: {
        email: c.email,
        password: await bcrypt.hash('Candidate@123', 10),
        role: Role.CANDIDATE,
        emailVerified: true,
        profile: {
          create: {
            fullName: c.fullName,
            phone: c.phone,
            title: c.title,
            city: c.city,
            summary: c.summary,
            skills: {
              create: c.skills
                .filter((s) => skillMap[s.name])
                .map((s) => ({ skillId: skillMap[s.name].id, level: s.level })),
            },
          },
        },
      },
    })
    console.log(`  ✓ Candidate: ${c.email} / Candidate@123`)
  }

  // Employers
  console.log('\nCreating companies...')
  const createdEmployers: { id: string; companyName: string }[] = []

  for (const company of COMPANIES) {
    const existing = await prisma.user.findUnique({
      where: { email: company.email },
      include: { employer: true },
    })

    let employerId: string | null = existing?.employer?.id ?? null

    if (!existing) {
      const created = await prisma.user.create({
        data: {
          email: company.email,
          password: await bcrypt.hash(company.password, 10),
          role: Role.EMPLOYER,
          emailVerified: true,
          employer: {
            create: {
              companyName: company.companyName,
              slug: toSlug(company.companyName),
              logoUrl: company.logoUrl,
              industry: company.industry,
              size: company.size,
              city: company.city,
              description: company.description,
              website: company.website,
              founded: company.founded,
              verified: company.verified,
            },
          },
        },
        include: { employer: true },
      })
      employerId = created.employer!.id
    } else if (existing.employer?.id && company.logoUrl) {
      // Update logoUrl for existing employers that were created without it
      await prisma.employer.update({
        where: { id: existing.employer.id },
        data: { logoUrl: company.logoUrl },
      })
    }

    if (employerId) {
      createdEmployers.push({ id: employerId, companyName: company.companyName })
      console.log(`  ✓ ${company.companyName} (${company.email})`)
    }
  }

  // Job Categories
  console.log('\nCreating job categories...')
  const JOB_CATEGORIES = [
    { name: 'IT - Phần mềm', slug: 'viec-lam-it-phan-mem', icon: '💻', order: 10 },
    { name: 'Kinh doanh - Bán hàng', slug: 'viec-lam-kinh-doanh', icon: '💼', order: 20 },
    { name: 'Marketing - Truyền thông', slug: 'viec-lam-marketing', icon: '📢', order: 30 },
    { name: 'Kế toán - Tài chính', slug: 'viec-lam-ke-toan-tai-chinh', icon: '💰', order: 40 },
    { name: 'Hành chính - Nhân sự', slug: 'viec-lam-hanh-chinh-nhan-su', icon: '🏢', order: 50 },
    { name: 'Kỹ thuật - Xây dựng', slug: 'viec-lam-ky-thuat-xay-dung', icon: '🔧', order: 60 },
    { name: 'Ngân hàng - Bảo hiểm', slug: 'viec-lam-ngan-hang-bao-hiem', icon: '🏦', order: 70 },
    { name: 'Giáo dục - Đào tạo', slug: 'viec-lam-giao-duc-dao-tao', icon: '🎓', order: 80 },
    { name: 'Y tế - Sức khỏe', slug: 'viec-lam-y-te-suc-khoe', icon: '🏥', order: 90 },
    { name: 'Bán lẻ - Tiêu dùng', slug: 'viec-lam-ban-le-tieu-dung', icon: '🛍️', order: 100 },
    { name: 'Logistics - Vận tải', slug: 'viec-lam-logistics-van-tai', icon: '🚚', order: 110 },
    { name: 'Nhà hàng - Khách sạn', slug: 'viec-lam-nha-hang-khach-san', icon: '🍽️', order: 120 },
    { name: 'Thiết kế - Đồ họa', slug: 'viec-lam-thiet-ke-do-hoa', icon: '🎨', order: 130 },
    { name: 'Bất động sản', slug: 'viec-lam-bat-dong-san', icon: '🏠', order: 140 },
    { name: 'Chăm sóc khách hàng', slug: 'viec-lam-cham-soc-khach-hang', icon: '🤝', order: 150 },
  ]
  for (const cat of JOB_CATEGORIES) {
    await prisma.jobCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: cat.order },
      create: { ...cat, isActive: true },
    })
  }
  console.log(`  ✓ ${JOB_CATEGORIES.length} job categories`)

  // Jobs — upsert by a stable slug prefix + title hash
  console.log('\nCreating jobs...')
  let jobCount = 0
  for (const jobData of JOBS) {
    const employer = createdEmployers[jobData.companyIndex % createdEmployers.length]
    if (!employer) continue

    const slugBase = toSlug(jobData.title)
    const existingJob = await prisma.job.findFirst({ where: { slug: { startsWith: slugBase } } })
    if (existingJob) {
      console.log(`  (skip) ${jobData.title} — already exists`)
      continue
    }

    const deadline = new Date()
    deadline.setDate(deadline.getDate() + (jobData.daysUntilDeadline ?? 30))

    await prisma.job.create({
      data: {
        title: jobData.title,
        slug: slugBase + '-' + nanoid(8),
        description: jobData.description,
        requirements: jobData.requirements,
        benefits: jobData.benefits,
        city: jobData.city,
        location: jobData.location,
        jobType: jobData.jobType,
        workMode: jobData.workMode,
        salaryMin: jobData.salaryMin,
        salaryMax: jobData.salaryMax,
        salaryNegotiable: jobData.salaryNegotiable ?? false,
        experienceMin: jobData.experienceMin,
        quantity: jobData.quantity ?? 1,
        status: JobStatus.PUBLISHED,
        publishedAt: new Date(),
        deadline,
        employerId: employer.id,
        skills: {
          create: jobData.skills
            .filter((s) => skillMap[s])
            .map((s) => ({ skillId: skillMap[s].id })),
        },
      },
    })
    jobCount++
    console.log(`  ✓ ${jobData.title} — ${jobData.city}`)
  }

  // Applications — link candidates to matching jobs
  console.log('\nCreating applications...')
  const allJobs = await prisma.job.findMany({
    where: { status: JobStatus.PUBLISHED },
    select: { id: true, title: true, employerId: true },
  })

  // Map title keyword → job id for easy lookup
  const findJob = (keyword: string) =>
    allJobs.find((j) => j.title.toLowerCase().includes(keyword.toLowerCase()))

  const candidateByEmail = async (email: string) => {
    const u = await prisma.user.findUnique({ where: { email }, select: { id: true } })
    return u?.id
  }

  type AppSpec = {
    candidateEmail: string
    jobKeyword: string
    status: ApplicationStatus
    coverLetter?: string
    daysAgo?: number
  }

  const APPLICATION_SPECS: AppSpec[] = [
    // TechCorp Vietnam — Senior Frontend Developer
    {
      candidateEmail: 'candidate@example.com',
      jobKeyword: 'Senior Frontend Developer',
      status: ApplicationStatus.REVIEWING,
      coverLetter: 'Kính chào TechCorp Vietnam, tôi có 3 năm kinh nghiệm React/Next.js và rất muốn đóng góp cho đội ngũ của quý công ty.',
      daysAgo: 12,
    },
    {
      candidateEmail: 'minhduc.dev@gmail.com',
      jobKeyword: 'Senior Frontend Developer',
      status: ApplicationStatus.INTERVIEW,
      coverLetter: 'Với 4 năm kinh nghiệm Next.js App Router và TypeScript strict mode, tôi tự tin có thể contribute ngay từ sprint đầu tiên.',
      daysAgo: 8,
    },
    // TechCorp Vietnam — Backend Developer (NestJS)
    {
      candidateEmail: 'levanhung.be@gmail.com',
      jobKeyword: 'Backend Developer',
      status: ApplicationStatus.OFFER,
      coverLetter: 'Tôi đã xây dựng microservices NestJS xử lý 500k request/ngày tại công ty cũ và muốn mang kinh nghiệm đó đến TechCorp.',
      daysAgo: 20,
    },
    {
      candidateEmail: 'minhduc.dev@gmail.com',
      jobKeyword: 'Backend Developer',
      status: ApplicationStatus.PENDING,
      coverLetter: 'Ngoài frontend, tôi cũng có kinh nghiệm REST API và muốn phát triển thêm kỹ năng backend.',
      daysAgo: 3,
    },
    // StartupXYZ Fintech — Full Stack Developer
    {
      candidateEmail: 'thuhuong.fullstack@gmail.com',
      jobKeyword: 'Full Stack Developer',
      status: ApplicationStatus.REVIEWING,
      coverLetter: 'Tôi đã build 3 sản phẩm fintech từ đầu với React + FastAPI. Môi trường remote-first và startup fintech của StartupXYZ rất phù hợp định hướng của tôi.',
      daysAgo: 5,
    },
    {
      candidateEmail: 'candidate2@example.com',
      jobKeyword: 'Full Stack Developer',
      status: ApplicationStatus.PENDING,
      coverLetter: 'Python và PostgreSQL là thế mạnh của tôi sau 4 năm backend. Tôi đang học thêm React để trở thành full stack developer.',
      daysAgo: 2,
    },
    // StartupXYZ Fintech — Mobile Developer
    {
      candidateEmail: 'kimchi.mobile@gmail.com',
      jobKeyword: 'Mobile Developer',
      status: ApplicationStatus.INTERVIEW,
      coverLetter: 'Tôi đã publish 4 app React Native lên cả AppStore và Google Play, trong đó có 1 app tích hợp MoMo và VNPay với 50k+ người dùng.',
      daysAgo: 10,
    },
    // GlobalSoft Solutions — Java Developer
    {
      candidateEmail: 'hoangnambk.java@gmail.com',
      jobKeyword: 'Java Developer',
      status: ApplicationStatus.INTERVIEW,
      coverLetter: 'Tôi có 3 năm kinh nghiệm Java Spring Boot trong dự án outsource Nhật Bản tại Axon Active và đang học tiếng Nhật N3. Rất muốn tiếp tục con đường này tại GlobalSoft.',
      daysAgo: 7,
    },
    {
      candidateEmail: 'levanhung.be@gmail.com',
      jobKeyword: 'Java Developer',
      status: ApplicationStatus.PENDING,
      coverLetter: 'Dù chuyên Node.js, tôi có nền tảng Java vững từ đại học và muốn mở rộng sang Spring Boot.',
      daysAgo: 1,
    },
    // GlobalSoft Solutions — UI/UX Designer
    {
      candidateEmail: 'lananh.designer@gmail.com',
      jobKeyword: 'UI/UX Designer',
      status: ApplicationStatus.OFFER,
      coverLetter: 'Portfolio của tôi gồm 6 dự án thực tế từ mobile app đến enterprise dashboard, tất cả thiết kế bằng Figma. Tôi đặc biệt quan tâm đến design system và accessibility.',
      daysAgo: 15,
    },
    // EcommerceVN Group — Data Engineer
    {
      candidateEmail: 'dinkhoa.data@gmail.com',
      jobKeyword: 'Data Engineer',
      status: ApplicationStatus.OFFER,
      coverLetter: 'Tôi đã xây dựng data pipeline xử lý hàng tỷ event/ngày tại VNG với PySpark và Kafka. EcommerceVN là cơ hội để làm việc với dataset và scale lớn hơn.',
      daysAgo: 18,
    },
    {
      candidateEmail: 'candidate2@example.com',
      jobKeyword: 'Data Engineer',
      status: ApplicationStatus.PENDING,
      coverLetter: 'Python và PostgreSQL là thế mạnh của tôi. Tôi muốn phát triển sự nghiệp trong lĩnh vực Data Engineering.',
      daysAgo: 4,
    },
    // EcommerceVN Group — DevOps Engineer
    {
      candidateEmail: 'ducthanh.devops@gmail.com',
      jobKeyword: 'DevOps Engineer',
      status: ApplicationStatus.REVIEWING,
      coverLetter: 'Tôi vận hành cluster K8s 200+ node trên AWS EKS tại Tiki và có chứng chỉ AWS Solutions Architect Professional. Sẵn sàng mang kinh nghiệm đó vào EcommerceVN.',
      daysAgo: 9,
    },
    // Công ty ABC — Giám đốc Kinh doanh
    {
      candidateEmail: 'hoangminh.sales@gmail.com',
      jobKeyword: 'Giám đốc Kinh doanh',
      status: ApplicationStatus.REVIEWING,
      coverLetter: 'Kính gửi Ban lãnh đạo Công ty ABC,\n\nVới 8 năm kinh nghiệm trong lĩnh vực kinh doanh B2B và phân phối, tôi tin tưởng mình có thể đóng góp ngay vào mục tiêu tăng trưởng của Công ty. Tại Masan Group, tôi đã xây dựng đội ngũ 60 người từ đầu và đưa doanh thu vùng từ 200 tỷ lên 500 tỷ/năm trong 3 năm.\n\nRất mong được trao đổi trực tiếp để chia sẻ kế hoạch và định hướng cụ thể.',
      daysAgo: 5,
    },
    {
      candidateEmail: 'hongnhung.director@gmail.com',
      jobKeyword: 'Giám đốc Kinh doanh',
      status: ApplicationStatus.PENDING,
      coverLetter: 'Kính gửi Công ty ABC,\n\nTôi ứng tuyển vị trí Giám đốc Kinh doanh với mong muốn được ứng dụng kinh nghiệm 9 năm trong ngành phân phối để đưa Công ty ABC lên một tầm cao mới. Tôi hiện quản lý 200+ tài khoản đối tác và doanh số 800 tỷ/năm tại Unilever.\n\nMạng lưới quan hệ rộng trong ngành và tư duy chiến lược là những điểm mạnh tôi có thể mang đến cho Công ty trong giai đoạn mở rộng này.',
      daysAgo: 2,
    },
    // Cross-company applications (thêm độ phong phú)
    {
      candidateEmail: 'thuhuong.fullstack@gmail.com',
      jobKeyword: 'Data Engineer',
      status: ApplicationStatus.PENDING,
      coverLetter: 'Python và PostgreSQL của tôi cũng phù hợp với data engineering. Muốn khám phá hướng đi này tại EcommerceVN.',
      daysAgo: 6,
    },
    {
      candidateEmail: 'dinkhoa.data@gmail.com',
      jobKeyword: 'Full Stack Developer',
      status: ApplicationStatus.PENDING,
      coverLetter: 'Python/FastAPI là thế mạnh của tôi và tôi cũng có kinh nghiệm với React. Startup fintech rất thú vị.',
      daysAgo: 3,
    },
  ]

  let appCount = 0
  for (const spec of APPLICATION_SPECS) {
    const userId = await candidateByEmail(spec.candidateEmail)
    const job = findJob(spec.jobKeyword)
    if (!userId || !job) continue

    const existing = await prisma.application.findUnique({
      where: { jobId_userId: { jobId: job.id, userId } },
    })
    if (existing) continue

    const appliedAt = new Date()
    appliedAt.setDate(appliedAt.getDate() - (spec.daysAgo ?? 0))

    await prisma.application.create({
      data: {
        jobId: job.id,
        userId,
        status: spec.status,
        coverLetter: spec.coverLetter,
        appliedAt,
      },
    })
    appCount++
  }
  console.log(`  ✓ ${appCount} applications created`)

  // Activity Logs — seed retroactive logs for demo
  console.log('\nCreating activity logs...')
  type ActivitySeed = {
    companyEmail: string
    type: string
    action: string
    targetName?: string
    daysAgo: number
  }

  const ACTIVITY_SEEDS: ActivitySeed[] = [
    // TechCorp Vietnam
    { companyEmail: 'hr@techcorp.vn', type: 'JOB_CREATED', action: 'Đăng tin tuyển dụng Senior Frontend Developer (React/Next.js)', targetName: 'Senior Frontend Developer', daysAgo: 28 },
    { companyEmail: 'hr@techcorp.vn', type: 'JOB_CREATED', action: 'Đăng tin tuyển dụng Backend Developer (Node.js/NestJS)', targetName: 'Backend Developer', daysAgo: 25 },
    { companyEmail: 'hr@techcorp.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Nguyễn Văn An thành Đang xem xét', targetName: 'Nguyễn Văn An', daysAgo: 12 },
    { companyEmail: 'hr@techcorp.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Nguyễn Minh Đức thành Phỏng vấn', targetName: 'Nguyễn Minh Đức', daysAgo: 8 },
    { companyEmail: 'hr@techcorp.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Lê Văn Hùng thành Đề nghị công việc', targetName: 'Lê Văn Hùng', daysAgo: 5 },
    { companyEmail: 'hr@techcorp.vn', type: 'LOGIN', action: 'Đăng nhập vào hệ thống', daysAgo: 2 },
    // StartupXYZ Fintech
    { companyEmail: 'hr@startupxyz.vn', type: 'JOB_CREATED', action: 'Đăng tin tuyển dụng Full Stack Developer (React + Python/FastAPI)', targetName: 'Full Stack Developer', daysAgo: 20 },
    { companyEmail: 'hr@startupxyz.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Phạm Thị Thu Hương thành Đang xem xét', targetName: 'Phạm Thị Thu Hương', daysAgo: 5 },
    { companyEmail: 'hr@startupxyz.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Ngô Thị Kim Chi thành Phỏng vấn', targetName: 'Ngô Thị Kim Chi', daysAgo: 10 },
    { companyEmail: 'hr@startupxyz.vn', type: 'LOGIN', action: 'Đăng nhập vào hệ thống', daysAgo: 1 },
    // GlobalSoft Solutions
    { companyEmail: 'hr@globalsoft.vn', type: 'JOB_CREATED', action: 'Đăng tin tuyển dụng Java Developer (Spring Boot) - Dự án Nhật Bản', targetName: 'Java Developer', daysAgo: 35 },
    { companyEmail: 'hr@globalsoft.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Hoàng Văn Nam thành Phỏng vấn', targetName: 'Hoàng Văn Nam', daysAgo: 7 },
    { companyEmail: 'hr@globalsoft.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Vũ Thị Lan Anh thành Đề nghị công việc', targetName: 'Vũ Thị Lan Anh', daysAgo: 15 },
    { companyEmail: 'hr@globalsoft.vn', type: 'COMPANY_UPDATED', action: 'Cập nhật thông tin công ty', daysAgo: 20 },
    // EcommerceVN Group
    { companyEmail: 'hr@ecommercevn.vn', type: 'JOB_CREATED', action: 'Đăng tin tuyển dụng Data Engineer - Nền tảng Big Data', targetName: 'Data Engineer', daysAgo: 30 },
    { companyEmail: 'hr@ecommercevn.vn', type: 'JOB_CREATED', action: 'Đăng tin tuyển dụng DevOps Engineer (AWS/Kubernetes)', targetName: 'DevOps Engineer', daysAgo: 25 },
    { companyEmail: 'hr@ecommercevn.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Trần Đình Khoa thành Đề nghị công việc', targetName: 'Trần Đình Khoa', daysAgo: 18 },
    { companyEmail: 'hr@ecommercevn.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Bùi Đức Thành thành Đang xem xét', targetName: 'Bùi Đức Thành', daysAgo: 9 },
    { companyEmail: 'hr@ecommercevn.vn', type: 'LOGIN', action: 'Đăng nhập vào hệ thống', daysAgo: 3 },
    // Công ty ABC
    { companyEmail: 'hr@congtyabc.vn', type: 'JOB_CREATED', action: 'Đăng tin tuyển dụng Giám đốc Kinh doanh (Sales Director)', targetName: 'Giám đốc Kinh doanh', daysAgo: 10 },
    { companyEmail: 'hr@congtyabc.vn', type: 'APPLICATION_STATUS_CHANGED', action: 'Thay đổi trạng thái ứng viên Lê Hoàng Minh thành Đang xem xét', targetName: 'Lê Hoàng Minh', daysAgo: 5 },
    { companyEmail: 'hr@congtyabc.vn', type: 'LOGIN', action: 'Đăng nhập vào hệ thống', daysAgo: 2 },
    { companyEmail: 'hr@congtyabc.vn', type: 'LOGIN', action: 'Đăng nhập vào hệ thống', daysAgo: 1 },
  ]

  let activityCount = 0
  for (const act of ACTIVITY_SEEDS) {
    const user = await prisma.user.findUnique({
      where: { email: act.companyEmail },
      include: { employer: { select: { id: true } } },
    })
    if (!user?.employer?.id) continue

    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - act.daysAgo)

    try {
      await prisma.activityLog.create({
        data: {
          employerId: user.employer.id,
          type: act.type,
          action: act.action,
          targetName: act.targetName,
          createdAt,
        },
      })
      activityCount++
    } catch {
      // skip if already exists or any error
    }
  }
  console.log(`  ✓ ${activityCount} activity logs created`)

  // Article Categories
  console.log('\nCreating article categories...')
  const createdArticleCats: Record<string, string> = {}
  for (const cat of ARTICLE_CATEGORIES) {
    const result = await prisma.articleCategory.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, order: cat.order },
      create: { name: cat.name, slug: cat.slug, icon: cat.icon, order: cat.order },
    })
    createdArticleCats[cat.slug] = result.id
  }
  console.log(`  ✓ ${ARTICLE_CATEGORIES.length} article categories`)

  // Remove stale article categories no longer in the canonical list
  const validCatSlugs = ARTICLE_CATEGORIES.map((c) => c.slug)
  const staleCats = await prisma.articleCategory.findMany({
    where: { slug: { notIn: validCatSlugs } },
    include: { _count: { select: { articles: true } } },
  })
  for (const sc of staleCats) {
    if (sc._count.articles === 0) {
      await prisma.articleCategory.delete({ where: { id: sc.id } })
      console.log(`  (deleted stale category) ${sc.slug}`)
    }
  }

  // Articles — upsert so existing articles get re-categorised when slugs change
  console.log('\nCreating articles...')
  let articleCount = 0
  for (const art of ARTICLES) {
    const categoryId = createdArticleCats[art.categorySlug]
    if (!categoryId) continue
    const existing = await prisma.article.findUnique({ where: { slug: art.slug } })
    if (existing) {
      if (existing.categoryId !== categoryId) {
        await prisma.article.update({ where: { id: existing.id }, data: { categoryId } })
        console.log(`  (recategorised) ${art.title}`)
      } else {
        console.log(`  (skip) ${art.title}`)
      }
      continue
    }
    await prisma.article.create({
      data: {
        title: art.title,
        slug: art.slug,
        excerpt: art.excerpt,
        content: art.content,
        imageUrl: art.imageUrl,
        categoryId,
        status: 'PUBLISHED' as any,
        publishedAt: new Date(Date.now() - articleCount * 3 * 24 * 60 * 60 * 1000),
      },
    })
    articleCount++
    console.log(`  ✓ ${art.title}`)
  }

  console.log('\n✅ Seed completed!')
  console.log('─────────────────────────────────────────')
  console.log('Tài khoản mặc định:')
  console.log('  Admin:      admin@tuyendung.vn        / Admin@123')
  console.log('  Ứng viên:   candidate@example.com     / Candidate@123')
  console.log('  Ứng viên:   minhduc.dev@gmail.com     / Candidate@123')
  console.log('  Ứng viên:   thuhuong.fullstack@gmail.com / Candidate@123')
  console.log('  Ứng viên:   dinkhoa.data@gmail.com    / Candidate@123')
  console.log('  Ứng viên:   ducthanh.devops@gmail.com / Candidate@123')
  console.log('  Nhà TD:     hr@techcorp.vn             / Employer@123')
  console.log('  Nhà TD:     hr@ecommercevn.vn          / Employer@123')
  console.log('  Nhà TD:     hr@congtyabc.vn            / Employer@123')
  console.log(`\nĐã tạo: ${jobCount} jobs mới, ${articleCount} bài viết mới`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
