import { PrismaClient, JobType, WorkMode, JobStatus } from './generated/client'
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
function html(...paragraphs: string[]): string {
  return paragraphs.map((p) => `<p>${p}</p>`).join('')
}
function htmlList(items: string[]): string {
  return `<ul class="list-disc pl-5">${items.map((i) => `<li class="my-0.5">${i}</li>`).join('')}</ul>`
}
function section(title: string, items: string[]): string {
  return `<h3>${title}</h3>${htmlList(items)}`
}

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
  employerEmail: string
  daysUntilDeadline?: number
}

const NEW_JOBS: JobSeed[] = [
  // ── TechCorp Vietnam ─────────────────────────────────────────────────────────
  {
    title: 'Senior Data Scientist / ML Engineer',
    city: 'Hà Nội',
    location: 'Tầng 12, Tòa nhà TechCorp, 21 Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 35_000_000,
    salaryMax: 65_000_000,
    experienceMin: 4,
    quantity: 2,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Data Analysis', 'PostgreSQL'],
    description: html(
      'TechCorp Vietnam đang mở rộng đội ngũ AI/ML và tìm kiếm <strong>Senior Data Scientist</strong> để xây dựng các mô hình dự đoán và hệ thống recommendation cho nền tảng thương mại điện tử B2B.',
      'Bạn sẽ làm việc trong đội Data Science gồm 8 kỹ sư, trực tiếp tác động đến quyết định kinh doanh của hơn 200 doanh nghiệp khách hàng.',
    ),
    requirements:
      section('Yêu cầu kỹ thuật', [
        'Từ 4 năm kinh nghiệm Data Science hoặc Machine Learning Engineering',
        'Thành thạo Python (pandas, scikit-learn, numpy)',
        'Kinh nghiệm với deep learning frameworks: TensorFlow hoặc PyTorch',
        'Kinh nghiệm xây dựng và deploy ML models lên production',
        'Hiểu biết về MLOps: model versioning, monitoring, A/B testing',
        'Kỹ năng SQL nâng cao và kinh nghiệm với data warehouse',
      ]) +
      section('Ưu tiên', [
        'Kinh nghiệm với NLP, recommendation systems hoặc computer vision',
        'Quen thuộc với MLflow, Kubeflow hoặc các MLOps tools',
        'Đã publish paper hoặc có dự án open source về ML',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 35 - 65 triệu VNĐ/tháng',
      'Thưởng dự án theo kết quả mô hình (revenue impact)',
      'Budget GPU cloud (AWS/GCP) không giới hạn cho nghiên cứu',
      'MacBook Pro M3 Max hoặc workstation cấu hình cao',
      'Tham gia hội thảo AI quốc tế (NeurIPS, ICML) mỗi năm',
      'Hybrid: 3 ngày văn phòng, 2 ngày remote',
    ]),
    employerEmail: 'hr@techcorp.vn',
    daysUntilDeadline: 45,
  },
  {
    title: 'QA Automation Engineer',
    city: 'Hà Nội',
    location: 'Tầng 12, Tòa nhà TechCorp, 21 Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 18_000_000,
    salaryMax: 32_000_000,
    experienceMin: 2,
    quantity: 3,
    skills: ['Python', 'JavaScript', 'Selenium', 'REST API', 'Git', 'CI/CD'],
    description: html(
      'Chúng tôi tuyển <strong>QA Automation Engineer</strong> để xây dựng và duy trì hệ thống kiểm thử tự động cho nền tảng SaaS với hàng chục module phức tạp.',
      'Bạn sẽ thiết kế test framework từ đầu cho các sản phẩm mới và cải thiện coverage cho sản phẩm hiện tại, đảm bảo chất lượng release mỗi 2 tuần một lần.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 2 năm kinh nghiệm QA với ít nhất 1 năm automation',
        'Thành thạo Selenium WebDriver, Playwright hoặc Cypress',
        'Kinh nghiệm viết test script bằng Python hoặc JavaScript',
        'Hiểu biết về API testing (Postman, RestAssured)',
        'Kinh nghiệm tích hợp automation vào CI/CD pipeline',
        'Quen thuộc với Agile/Scrum và bug tracking (Jira)',
      ]) +
      section('Ưu tiên', [
        'Kinh nghiệm với performance testing (JMeter, k6)',
        'Hiểu biết về test coverage và code quality metrics',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 18 - 32 triệu VNĐ/tháng',
      'Bảo hiểm sức khỏe cao cấp',
      'Budget học tập kỹ năng testing và chứng chỉ ISTQB',
      '15 ngày phép/năm, thưởng cuối năm',
      'Môi trường kỹ thuật hiện đại, quy trình chuẩn',
    ]),
    employerEmail: 'hr@techcorp.vn',
    daysUntilDeadline: 30,
  },
  {
    title: 'IT Project Manager (Agile/Scrum)',
    city: 'Hà Nội',
    location: 'Tầng 12, Tòa nhà TechCorp, 21 Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 28_000_000,
    salaryMax: 50_000_000,
    experienceMin: 5,
    quantity: 1,
    skills: ['Product Management', 'Agile/Scrum', 'Jira', 'Leadership'],
    description: html(
      'TechCorp Vietnam tìm kiếm <strong>IT Project Manager</strong> có kinh nghiệm để dẫn dắt các dự án phần mềm quy mô lớn từ giai đoạn planning đến delivery.',
      'Bạn sẽ quản lý đồng thời 2-3 dự án với đội ngũ 10-20 kỹ sư, đảm bảo deliverable đúng tiến độ, ngân sách và chất lượng.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 5 năm kinh nghiệm quản lý dự án CNTT',
        'Chứng chỉ PMP hoặc PMI-ACP (hoặc tương đương)',
        'Thành thạo Agile/Scrum methodology và công cụ Jira, Confluence',
        'Kinh nghiệm quản lý rủi ro và stakeholder management',
        'Kỹ năng giao tiếp tiếng Anh tốt (làm việc với khách hàng nước ngoài)',
        'Có nền tảng kỹ thuật phần mềm là lợi thế lớn',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 28 - 50 triệu VNĐ/tháng',
      'Thưởng hiệu suất dự án',
      'Hybrid linh hoạt',
      'Cơ hội làm việc với khách hàng quốc tế (Mỹ, châu Âu)',
      'Budget PMP renewal và conference',
    ]),
    employerEmail: 'hr@techcorp.vn',
    daysUntilDeadline: 40,
  },
  {
    title: 'Frontend Developer (Vue.js / Nuxt.js)',
    city: 'Hà Nội',
    location: 'Tầng 12, Tòa nhà TechCorp, 21 Lý Thái Tổ, Hoàn Kiếm, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    salaryMin: 18_000_000,
    salaryMax: 35_000_000,
    experienceMin: 2,
    quantity: 2,
    skills: ['Vue.js', 'TypeScript', 'JavaScript', 'HTML/CSS', 'REST API', 'Git'],
    description: html(
      'Chúng tôi đang mở rộng đội frontend và tìm kiếm <strong>Frontend Developer</strong> có kinh nghiệm Vue.js để phát triển dashboard quản trị cho khách hàng doanh nghiệp.',
      'Đây là vị trí remote 100% — bạn có thể làm việc từ bất kỳ đâu tại Việt Nam.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 2 năm kinh nghiệm frontend với Vue.js 3 (Composition API)',
        'Thành thạo TypeScript',
        'Kinh nghiệm với Nuxt.js (SSR, SSG)',
        'Hiểu biết về state management (Pinia hoặc Vuex)',
        'Quen thuộc với Tailwind CSS hoặc CSS frameworks',
        'Kỹ năng tích hợp REST API',
      ]),
    benefits: section('Quyền lợi', [
      'Remote 100% — làm việc từ bất kỳ đâu',
      'Lương từ 18 - 35 triệu VNĐ/tháng',
      'Thiết bị làm việc được hỗ trợ',
      'Budget học tập online (Udemy, Coursera)',
      'Lịch làm việc linh hoạt (core hours 9h-15h)',
    ]),
    employerEmail: 'hr@techcorp.vn',
    daysUntilDeadline: 28,
  },

  // ── StartupXYZ Fintech ────────────────────────────────────────────────────────
  {
    title: 'Backend Developer (Golang)',
    city: 'Hồ Chí Minh',
    location: 'WeWork Saigon, 3B Đường Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 28_000_000,
    salaryMax: 50_000_000,
    experienceMin: 3,
    quantity: 2,
    skills: ['Go', 'PostgreSQL', 'Redis', 'Docker', 'Kubernetes', 'REST API'],
    description: html(
      'StartupXYZ Fintech đang chuyển đổi core infrastructure sang Golang và tìm kiếm <strong>Backend Developer Go</strong> giàu kinh nghiệm để dẫn dắt quá trình này.',
      'Bạn sẽ xây dựng các high-throughput microservices xử lý giao dịch tài chính với độ trễ cực thấp và tính sẵn sàng cao (99.99% uptime).',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 3 năm kinh nghiệm backend, ít nhất 1 năm với Golang',
        'Hiểu sâu về concurrency model của Go (goroutines, channels)',
        'Kinh nghiệm với PostgreSQL, Redis',
        'Quen thuộc với Docker và Kubernetes',
        'Hiểu biết về distributed systems và CAP theorem',
        'Kinh nghiệm với gRPC là lợi thế lớn',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 28 - 50 triệu VNĐ/tháng',
      'Stock options với vesting schedule hấp dẫn',
      'Remote 3 ngày/tuần',
      'MacBook Pro M3',
      'Budget kỹ thuật: sách, khóa học, hội thảo',
      'Bảo hiểm sức khỏe cho bản thân và gia đình',
    ]),
    employerEmail: 'hr@startupxyz.vn',
    daysUntilDeadline: 35,
  },
  {
    title: 'Data Analyst - Fintech Insights',
    city: 'Hồ Chí Minh',
    location: 'WeWork Saigon, 3B Đường Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.REMOTE,
    salaryMin: 18_000_000,
    salaryMax: 32_000_000,
    experienceMin: 2,
    quantity: 1,
    skills: ['Python', 'Data Analysis', 'PostgreSQL', 'Elasticsearch', 'Agile/Scrum'],
    description: html(
      'Chúng tôi cần <strong>Data Analyst</strong> để biến dữ liệu giao dịch tài chính thành insights hữu ích giúp đội product và business ra quyết định tốt hơn.',
      'Bạn sẽ làm việc trực tiếp với Head of Product và CEO, xây dựng các báo cáo và dashboard real-time cho sản phẩm fintech đang tăng trưởng nhanh.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 2 năm kinh nghiệm Data Analysis',
        'Thành thạo SQL và Python (pandas, matplotlib, seaborn)',
        'Kinh nghiệm với BI tools (Metabase, Tableau, Power BI, hoặc Looker)',
        'Có tư duy kinh doanh, hiểu KPIs tài chính và tăng trưởng',
        'Kỹ năng trình bày insights rõ ràng cho non-technical audience',
      ]),
    benefits: section('Quyền lợi', [
      'Remote 100%',
      'Lương từ 18 - 32 triệu VNĐ/tháng',
      'Cơ hội chứng kiến và đóng góp vào quyết định chiến lược startup',
      'Lịch làm việc linh hoạt',
      'Stock options sau 12 tháng',
    ]),
    employerEmail: 'hr@startupxyz.vn',
    daysUntilDeadline: 25,
  },
  {
    title: 'Business Analyst (Fintech / Payment)',
    city: 'Hồ Chí Minh',
    location: 'WeWork Saigon, 3B Đường Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 22_000_000,
    salaryMax: 38_000_000,
    experienceMin: 3,
    quantity: 1,
    skills: ['Product Management', 'Agile/Scrum', 'Jira', 'Data Analysis'],
    description: html(
      'StartupXYZ tìm kiếm <strong>Business Analyst</strong> có hiểu biết về fintech để cầu nối giữa yêu cầu business và đội kỹ thuật.',
      'Bạn sẽ thu thập yêu cầu từ stakeholders, viết BRD/PRD, phân tích quy trình nghiệp vụ và đảm bảo sản phẩm đáp ứng đúng nhu cầu thị trường.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 3 năm kinh nghiệm Business Analysis trong lĩnh vực fintech hoặc ngân hàng',
        'Hiểu biết về payment systems (e-wallet, banking APIs, payment gateways)',
        'Kỹ năng viết tài liệu BRD, PRD, user stories, use cases',
        'Quen thuộc với quy trình Agile và công cụ Jira',
        'Khả năng phân tích dữ liệu với SQL là lợi thế',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 22 - 38 triệu VNĐ/tháng',
      'Hybrid linh hoạt (3 ngày remote)',
      'Cơ hội học hỏi về fintech từ đội ngũ có kinh nghiệm quốc tế',
      'Stock options sau 1 năm',
      'Bảo hiểm sức khỏe toàn diện',
    ]),
    employerEmail: 'hr@startupxyz.vn',
    daysUntilDeadline: 40,
  },
  {
    title: 'Security Engineer (AppSec / Penetration Testing)',
    city: 'Hồ Chí Minh',
    location: 'WeWork Saigon, 3B Đường Tôn Đức Thắng, Quận 1, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 35_000_000,
    salaryMax: 60_000_000,
    experienceMin: 4,
    quantity: 1,
    skills: ['Python', 'AWS', 'Docker', 'REST API', 'CI/CD'],
    description: html(
      'Trong lĩnh vực fintech, bảo mật là ưu tiên hàng đầu. Chúng tôi tìm kiếm <strong>Security Engineer</strong> để đảm bảo an toàn cho dữ liệu tài chính của hàng triệu người dùng.',
      'Bạn sẽ thực hiện penetration testing định kỳ, code review bảo mật, xây dựng security framework và ứng phó sự cố bảo mật.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 4 năm kinh nghiệm về Application Security hoặc Penetration Testing',
        'Hiểu biết sâu về OWASP Top 10 và các lỗ hổng bảo mật web/API',
        'Kinh nghiệm với các tool: Burp Suite, OWASP ZAP, Metasploit',
        'Có khả năng thực hiện source code review (Python, Node.js, Go)',
        'Hiểu biết về cloud security (AWS IAM, Security Groups, WAF)',
        'Chứng chỉ CEH, OSCP hoặc tương đương là lợi thế lớn',
      ]),
    benefits: section('Quyền lợi', [
      'Lương hấp dẫn từ 35 - 60 triệu VNĐ/tháng',
      'Bug bounty program nội bộ',
      'Tài trợ 100% chi phí thi chứng chỉ bảo mật',
      'Tham gia các CTF và security conference',
      'Stock options và equity package',
    ]),
    employerEmail: 'hr@startupxyz.vn',
    daysUntilDeadline: 50,
  },

  // ── GlobalSoft Solutions ──────────────────────────────────────────────────────
  {
    title: 'PHP Developer (Laravel) - Outsource Project EU',
    city: 'Đà Nẵng',
    location: 'Tầng 5, Tòa nhà Da Nang IT Park, Nguyễn Văn Linh, Đà Nẵng',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 15_000_000,
    salaryMax: 28_000_000,
    experienceMin: 2,
    quantity: 4,
    skills: ['PHP', 'Laravel', 'MySQL', 'JavaScript', 'REST API', 'Git'],
    description: html(
      'GlobalSoft Solutions tuyển <strong>PHP Developer (Laravel)</strong> tham gia dự án phát triển hệ thống quản lý nội dung và thương mại điện tử cho khách hàng châu Âu.',
      'Làm việc trong môi trường chuyên nghiệp với quy trình code review nghiêm ngặt và đội ngũ kỹ thuật giàu kinh nghiệm.',
    ),
    requirements:
      section('Yêu cầu kỹ thuật', [
        'Từ 2 năm kinh nghiệm phát triển backend PHP với Laravel',
        'Thành thạo MySQL, viết query tối ưu',
        'Kinh nghiệm xây dựng RESTful API',
        'Quen thuộc với Git, quy trình pull request và code review',
        'Hiểu biết cơ bản về frontend (HTML/CSS/JavaScript)',
        'Đọc hiểu tài liệu kỹ thuật tiếng Anh',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 15 - 28 triệu VNĐ/tháng theo năng lực',
      'Môi trường làm việc ổn định, chuẩn ISO',
      'Đóng BHXH, BHYT, BHTN đầy đủ',
      'Team building và du lịch công ty hàng năm',
      'Review lương 2 lần/năm',
    ]),
    employerEmail: 'hr@globalsoft.vn',
    daysUntilDeadline: 35,
  },
  {
    title: 'Senior QA / Test Lead (Manual + Automation)',
    city: 'Đà Nẵng',
    location: 'Tầng 5, Tòa nhà Da Nang IT Park, Nguyễn Văn Linh, Đà Nẵng',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 22_000_000,
    salaryMax: 40_000_000,
    experienceMin: 4,
    quantity: 1,
    skills: ['Python', 'Selenium', 'JavaScript', 'Agile/Scrum', 'Jira', 'REST API'],
    description: html(
      'GlobalSoft cần <strong>Senior QA / Test Lead</strong> để lãnh đạo đội kiểm thử 5 người cho các dự án outsource châu Âu và Nhật Bản.',
      'Bạn sẽ xây dựng test strategy, thiết kế test plan, mentoring team QA junior và báo cáo trực tiếp với Project Manager.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 4 năm kinh nghiệm QA, ít nhất 2 năm ở vị trí lead/senior',
        'Thành thạo cả manual và automation testing',
        'Kinh nghiệm với Selenium, hoặc Playwright',
        'Đã từng xây dựng test framework từ đầu',
        'Kỹ năng quản lý và mentoring team',
        'Kinh nghiệm với API testing (Postman, RestAssured)',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 22 - 40 triệu VNĐ/tháng',
      'Cơ hội onsite tại Nhật Bản hoặc châu Âu',
      'Phụ cấp leadership hàng tháng',
      'Budget đào tạo và chứng chỉ ISTQB Advanced',
      'Hybrid: 2 ngày remote/tuần',
    ]),
    employerEmail: 'hr@globalsoft.vn',
    daysUntilDeadline: 28,
  },
  {
    title: 'Technical Lead / Architect (Java)',
    city: 'Đà Nẵng',
    location: 'Tầng 5, Tòa nhà Da Nang IT Park, Nguyễn Văn Linh, Đà Nẵng',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 40_000_000,
    salaryMax: 70_000_000,
    salaryNegotiable: true,
    experienceMin: 7,
    quantity: 1,
    skills: ['Java', 'Spring Boot', 'Microservices', 'AWS', 'Docker', 'PostgreSQL'],
    description: html(
      'GlobalSoft Solutions cần <strong>Technical Lead / Architect</strong> Java cấp cao để dẫn dắt đội kỹ thuật 15 người và thiết kế kiến trúc hệ thống cho dự án ERP chiến lược.',
      'Đây là vị trí quan trọng trong ban lãnh đạo kỹ thuật, phối hợp trực tiếp với khách hàng Nhật Bản và CTO công ty.',
    ),
    requirements:
      section('Yêu cầu', [
        'Ít nhất 7 năm kinh nghiệm phát triển Java, trong đó 3 năm kinh nghiệm lead/architect',
        'Chuyên sâu về Spring Boot, Spring Cloud, microservices architecture',
        'Kinh nghiệm thiết kế hệ thống quy mô lớn (high availability, scalability)',
        'Thành thạo Docker, Kubernetes và cloud deployment (AWS hoặc Azure)',
        'Kỹ năng giao tiếp tiếng Anh tốt (làm việc trực tiếp với khách hàng Nhật)',
        'Kinh nghiệm mentoring và code review cho đội kỹ sư',
      ]),
    benefits: section('Quyền lợi', [
      'Mức lương thỏa thuận từ 40 - 70 triệu VNĐ/tháng',
      'Cơ hội onsite Nhật Bản định kỳ 3-6 tháng/năm',
      'Phụ cấp leadership và tiếng Nhật',
      'Cổ phần công ty (phantom equity)',
      'Xe đưa đón tại Đà Nẵng',
      '18 ngày phép/năm',
    ]),
    employerEmail: 'hr@globalsoft.vn',
    daysUntilDeadline: 60,
  },
  {
    title: 'Bridge System Engineer (BSE) - Nhật Bản',
    city: 'Đà Nẵng',
    location: 'Tầng 5, Tòa nhà Da Nang IT Park, Nguyễn Văn Linh, Đà Nẵng',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 20_000_000,
    salaryMax: 38_000_000,
    experienceMin: 3,
    quantity: 2,
    skills: ['Java', 'Spring Boot', 'Agile/Scrum', 'Jira', 'REST API'],
    description: html(
      'GlobalSoft tìm kiếm <strong>Bridge System Engineer (BSE)</strong> để làm cầu nối giữa đội phát triển tại Việt Nam và khách hàng Nhật Bản trong các dự án phần mềm outsource.',
      'Bạn sẽ phụ trách dịch tài liệu kỹ thuật, tổng hợp yêu cầu từ khách hàng và đảm bảo chất lượng sản phẩm đáp ứng tiêu chuẩn Nhật Bản.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 3 năm kinh nghiệm trong lĩnh vực IT (phát triển phần mềm, BA, hoặc PM)',
        '<strong>Tiếng Nhật N3 trở lên (bắt buộc)</strong> — N2/N1 là lợi thế rất lớn',
        'Tiếng Anh giao tiếp tốt',
        'Hiểu biết cơ bản về quy trình phát triển phần mềm (SDLC, Agile)',
        'Kỹ năng tổng hợp và viết tài liệu tốt',
        'Có kinh nghiệm onsite tại Nhật Bản là lợi thế',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 20 - 38 triệu VNĐ/tháng + phụ cấp tiếng Nhật 3-5 triệu/tháng',
      'Cơ hội onsite Nhật Bản 2-4 lần/năm',
      'Hỗ trợ học tiếng Nhật tại công ty (lớp học có giáo viên)',
      'Chi phí thi chứng chỉ JLPT được tài trợ',
      'Môi trường làm việc chuẩn văn hóa Nhật - chuyên nghiệp và kỷ luật',
    ]),
    employerEmail: 'hr@globalsoft.vn',
    daysUntilDeadline: 45,
  },

  // ── EcommerceVN Group ─────────────────────────────────────────────────────────
  {
    title: 'Machine Learning Engineer - Recommendation System',
    city: 'Hồ Chí Minh',
    location: 'Tòa nhà Viettel Complex, Số 285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 45_000_000,
    salaryMax: 80_000_000,
    experienceMin: 4,
    quantity: 2,
    skills: ['Python', 'Machine Learning', 'TensorFlow', 'PyTorch', 'Elasticsearch', 'AWS'],
    description: html(
      'EcommerceVN Group tuyển <strong>Machine Learning Engineer</strong> tập trung vào hệ thống recommendation, personalization và tìm kiếm sản phẩm cho nền tảng thương mại điện tử phục vụ hàng triệu người mua sắm mỗi ngày.',
      'Bạn sẽ xây dựng các mô hình ML production-grade, từ collaborative filtering đến deep learning recommendation, tác động trực tiếp đến GMV và conversion rate.',
    ),
    requirements:
      section('Yêu cầu kỹ thuật', [
        'Từ 4 năm kinh nghiệm ML Engineering hoặc Applied Research',
        'Thành thạo Python: PyTorch/TensorFlow, scikit-learn, pyspark',
        'Kinh nghiệm xây dựng recommendation systems (collaborative filtering, content-based, neural CF)',
        'Kinh nghiệm deploy model với Kubernetes, Triton Inference Server hoặc tương đương',
        'Hiểu biết về A/B testing và online experiment framework',
        'Kinh nghiệm với Elasticsearch cho search ranking là lợi thế',
      ]) +
      section('Ưu tiên', [
        'Đã có kinh nghiệm với hệ thống recommendation ở quy mô triệu users',
        'Publication về ML/RecSys là điểm cộng',
      ]),
    benefits: section('Quyền lợi hàng đầu thị trường', [
      'Lương từ 45 - 80 triệu VNĐ/tháng',
      'Thưởng KPI đến 4 tháng lương/năm',
      'Bảo hiểm sức khỏe Bảo Việt cao cấp cho cả gia đình',
      'GPU cluster nội bộ + budget cloud không giới hạn',
      'Tài trợ tham dự RecSys, NeurIPS, KDD hàng năm',
      'Bữa trưa miễn phí + gym membership',
    ]),
    employerEmail: 'hr@ecommercevn.vn',
    daysUntilDeadline: 45,
  },
  {
    title: 'iOS Developer (Swift / SwiftUI)',
    city: 'Hồ Chí Minh',
    location: 'Tòa nhà Viettel Complex, Số 285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 28_000_000,
    salaryMax: 52_000_000,
    experienceMin: 3,
    quantity: 2,
    skills: ['Swift', 'REST API', 'Git', 'Agile/Scrum'],
    description: html(
      'Chúng tôi cần <strong>iOS Developer</strong> để phát triển ứng dụng mua sắm đang có hơn 5 triệu lượt tải với rating 4.8 trên App Store.',
      'Bạn sẽ tham gia đội mobile gồm 20+ developer, chịu trách nhiệm phát triển tính năng mới, tối ưu hiệu suất và đảm bảo trải nghiệm người dùng xuất sắc.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 3 năm kinh nghiệm iOS development với Swift',
        'Kinh nghiệm với SwiftUI và UIKit',
        'Hiểu biết sâu về iOS architecture patterns (MVVM, Clean Architecture)',
        'Kinh nghiệm tích hợp REST API và WebSocket',
        'Đã publish ứng dụng lên App Store',
        'Quen thuộc với Xcode Instruments để profile và tối ưu performance',
      ]) +
      section('Ưu tiên', [
        'Kinh nghiệm với payment integration (Apple Pay, In-App Purchase)',
        'Hiểu biết về offline-first architecture',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 28 - 52 triệu VNĐ/tháng',
      'MacBook Pro M3 + iPhone mới nhất để test',
      'Thưởng theo sprint đặc biệt',
      'Bảo hiểm sức khỏe cao cấp',
      '18 ngày phép/năm',
      'Cơ hội onsite Singapore hàng năm',
    ]),
    employerEmail: 'hr@ecommercevn.vn',
    daysUntilDeadline: 30,
  },
  {
    title: 'Senior Product Designer (UX/UI)',
    city: 'Hồ Chí Minh',
    location: 'Tòa nhà Viettel Complex, Số 285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 30_000_000,
    salaryMax: 55_000_000,
    experienceMin: 5,
    quantity: 1,
    skills: ['Figma', 'UI/UX Design', 'Adobe XD', 'Agile/Scrum'],
    description: html(
      'EcommerceVN Group tìm kiếm <strong>Senior Product Designer</strong> để dẫn dắt trải nghiệm người dùng trên nền tảng mua sắm phục vụ 10+ triệu người mỗi tháng.',
      'Bạn sẽ là người định hướng design language, làm việc trực tiếp với Product Manager và Engineering Lead để ra mắt các tính năng mua sắm thế hệ tiếp theo.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 5 năm kinh nghiệm Product Design hoặc UX Design',
        'Portfolio thể hiện các case study thực tế với đo lường impact',
        'Thành thạo Figma, bao gồm prototyping và component system',
        'Kinh nghiệm xây dựng và duy trì Design System',
        'Hiểu biết về User Research, Usability Testing, A/B testing',
        'Kỹ năng giao tiếp tiếng Anh tốt',
      ]) +
      section('Ưu tiên', [
        'Kinh nghiệm design cho e-commerce hoặc fintech',
        'Có hiểu biết cơ bản về front-end (HTML/CSS) để làm việc với dev tốt hơn',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 30 - 55 triệu VNĐ/tháng',
      'Figma Enterprise license và toàn bộ design tools',
      'Budget nghiên cứu người dùng',
      'Bảo hiểm cao cấp cho gia đình',
      'Phòng design studio hiện đại',
      '18 ngày phép + thưởng tháng 13-14',
    ]),
    employerEmail: 'hr@ecommercevn.vn',
    daysUntilDeadline: 40,
  },
  {
    title: 'Android Developer (Kotlin / Jetpack Compose)',
    city: 'Hồ Chí Minh',
    location: 'Tòa nhà Viettel Complex, Số 285 Cách Mạng Tháng 8, Quận 10, TP. Hồ Chí Minh',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 28_000_000,
    salaryMax: 50_000_000,
    experienceMin: 3,
    quantity: 2,
    skills: ['Kotlin', 'REST API', 'Git', 'Agile/Scrum'],
    description: html(
      'Chúng tôi cần <strong>Android Developer</strong> để phát triển ứng dụng mua sắm Android đang có 8 triệu lượt tải với rating 4.7 trên Google Play.',
      'Bạn sẽ làm việc trong đội mobile lớn, tập trung vào performance optimization, tính năng mua sắm live stream và tích hợp payment.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 3 năm kinh nghiệm Android development với Kotlin',
        'Kinh nghiệm với Jetpack Compose và Material Design 3',
        'Thành thạo Android architecture (MVVM, Clean Architecture)',
        'Kinh nghiệm với Coroutines, Flow và dependency injection (Hilt/Dagger)',
        'Đã publish ứng dụng lên Google Play',
        'Kinh nghiệm tối ưu hiệu suất: memory, CPU, battery',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 28 - 50 triệu VNĐ/tháng',
      'Thiết bị test đa dạng (flagship Android devices)',
      'Thưởng theo KPI tính năng',
      'Bảo hiểm sức khỏe cao cấp',
      'Bữa trưa miễn phí tại căng tin',
      'Cơ hội thăng tiến lên Senior/Lead nhanh',
    ]),
    employerEmail: 'hr@ecommercevn.vn',
    daysUntilDeadline: 25,
  },

  // ── Công ty ABC ───────────────────────────────────────────────────────────────
  {
    title: 'Marketing Manager - Thương mại điện tử B2B',
    city: 'Hà Nội',
    location: 'Tầng 8, Tòa nhà Hà Thành Plaza, 102 Thái Thịnh, Đống Đa, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 25_000_000,
    salaryMax: 45_000_000,
    experienceMin: 5,
    quantity: 1,
    skills: ['SEO', 'Google Ads', 'Facebook Ads', 'Content Marketing', 'Leadership', 'CRM'],
    description: html(
      'Công ty ABC tìm kiếm <strong>Marketing Manager</strong> để xây dựng và thực thi chiến lược marketing tổng thể cho giai đoạn mở rộng sang thị trường Đông Nam Á.',
      'Bạn sẽ dẫn dắt đội marketing 8 người, quản lý ngân sách hàng tỷ đồng và chịu trách nhiệm về brand awareness, lead generation và conversion optimization.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 5 năm kinh nghiệm marketing, trong đó ít nhất 2 năm ở vị trí manager',
        'Kinh nghiệm cả digital marketing (SEO, SEM, Social Media) và traditional marketing',
        'Hiểu biết về B2B marketing và sales funnel',
        'Kinh nghiệm quản lý agency và vendors',
        'Kỹ năng phân tích data marketing (Google Analytics, Facebook Ads Manager)',
        'Tiếng Anh giao tiếp tốt để làm việc với đối tác quốc tế',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 25 - 45 triệu VNĐ/tháng',
      'Thưởng KPI hàng quý',
      'Ngân sách marketing lớn để thực thi chiến lược sáng tạo',
      'Xe công ty hoặc phụ cấp xăng',
      'Bảo hiểm sức khỏe cao cấp',
      'Cơ hội tham gia hội nghị marketing quốc tế',
    ]),
    employerEmail: 'hr@congtyabc.vn',
    daysUntilDeadline: 35,
  },
  {
    title: 'Key Account Manager (KAM) - Miền Bắc',
    city: 'Hà Nội',
    location: 'Tầng 8, Tòa nhà Hà Thành Plaza, 102 Thái Thịnh, Đống Đa, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.HYBRID,
    salaryMin: 20_000_000,
    salaryMax: 40_000_000,
    salaryNegotiable: true,
    experienceMin: 3,
    quantity: 3,
    skills: ['B2B Sales', 'Account Management', 'CRM', 'Negotiation', 'Strategic Planning'],
    description: html(
      'Công ty ABC tuyển <strong>Key Account Manager</strong> để quản lý và phát triển danh mục khách hàng chiến lược tại khu vực miền Bắc.',
      'Bạn sẽ chịu trách nhiệm duy trì mối quan hệ với các key account trị giá 50+ tỷ đồng/năm và tìm kiếm cơ hội upsell/cross-sell để mở rộng doanh thu.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 3 năm kinh nghiệm B2B Sales hoặc Account Management',
        'Có mạng lưới quan hệ tốt với các doanh nghiệp vừa và lớn tại Hà Nội và các tỉnh miền Bắc',
        'Kỹ năng đàm phán và thuyết phục ở cấp độ lãnh đạo doanh nghiệp',
        'Kinh nghiệm với CRM tools (Salesforce, HubSpot hoặc tương đương)',
        'Có phương tiện đi lại cá nhân (thường xuyên gặp khách hàng tại địa bàn)',
      ]) +
      section('Ưu tiên', [
        'Kinh nghiệm trong ngành thương mại, phân phối, FMCG hoặc logistics',
        'Có sẵn portfolio khách hàng có thể mang theo',
      ]),
    benefits: section('Quyền lợi hấp dẫn', [
      'Lương cơ bản từ 20 - 40 triệu VNĐ/tháng',
      'Hoa hồng không giới hạn theo kết quả doanh thu',
      'Phụ cấp xăng xe, điện thoại, ăn trưa',
      'Bảo hiểm sức khỏe đầy đủ',
      'Tham gia đào tạo kỹ năng bán hàng cao cấp',
      'Thưởng tháng 13 và thưởng cuối năm theo KPI',
    ]),
    employerEmail: 'hr@congtyabc.vn',
    daysUntilDeadline: 30,
  },
  {
    title: 'Human Resources Manager',
    city: 'Hà Nội',
    location: 'Tầng 8, Tòa nhà Hà Thành Plaza, 102 Thái Thịnh, Đống Đa, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 22_000_000,
    salaryMax: 40_000_000,
    experienceMin: 5,
    quantity: 1,
    skills: ['Leadership', 'Strategic Planning', 'CRM'],
    description: html(
      'Công ty ABC cần <strong>Trưởng phòng Nhân sự</strong> để xây dựng và vận hành hệ thống HR chuyên nghiệp trong giai đoạn công ty mở rộng quy mô từ 200 lên 500+ nhân sự.',
      'Bạn sẽ phụ trách toàn bộ mảng nhân sự: tuyển dụng, đào tạo, C&B, văn hóa doanh nghiệp và quản lý quan hệ lao động.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 5 năm kinh nghiệm HR, ít nhất 2 năm ở vị trí quản lý',
        'Kinh nghiệm toàn diện: tuyển dụng, đào tạo, C&B, HRIS, luật lao động',
        'Đã từng xây dựng HR department hoặc cải tổ hệ thống HR',
        'Hiểu biết vững về Luật Lao động Việt Nam hiện hành',
        'Kỹ năng lãnh đạo và xây dựng văn hóa doanh nghiệp',
        'Bằng cử nhân ngành Quản trị Nhân lực, Kinh tế hoặc tương đương',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 22 - 40 triệu VNĐ/tháng theo năng lực',
      'Bonus năm theo hiệu suất',
      'Cơ hội định hình văn hóa và chính sách HR từ đầu',
      'Bảo hiểm sức khỏe cao cấp',
      'Tham gia các khóa đào tạo HR quản lý cấp cao',
    ]),
    employerEmail: 'hr@congtyabc.vn',
    daysUntilDeadline: 45,
  },
  {
    title: 'Kế toán Trưởng / Accounting Manager',
    city: 'Hà Nội',
    location: 'Tầng 8, Tòa nhà Hà Thành Plaza, 102 Thái Thịnh, Đống Đa, Hà Nội',
    jobType: JobType.FULL_TIME,
    workMode: WorkMode.ONSITE,
    salaryMin: 20_000_000,
    salaryMax: 38_000_000,
    experienceMin: 6,
    quantity: 1,
    skills: ['Strategic Planning', 'Leadership', 'Business Development'],
    description: html(
      'Công ty ABC tuyển <strong>Kế toán Trưởng</strong> để quản lý toàn bộ hoạt động kế toán - tài chính của doanh nghiệp thương mại với doanh thu hàng trăm tỷ đồng/năm.',
      'Bạn sẽ phụ trách lập báo cáo tài chính, quản lý dòng tiền, tuân thủ thuế và tư vấn chiến lược tài chính cho ban lãnh đạo.',
    ),
    requirements:
      section('Yêu cầu', [
        'Từ 6 năm kinh nghiệm kế toán, ít nhất 2 năm ở vị trí kế toán trưởng hoặc kế toán tổng hợp',
        'Thành thạo chuẩn mực kế toán Việt Nam (VAS) và các quy định thuế hiện hành',
        'Kinh nghiệm với phần mềm kế toán: MISA, Fast, SAP hoặc Oracle',
        'Kỹ năng lập báo cáo tài chính tổng hợp cho doanh nghiệp vừa và lớn',
        'Chứng chỉ CPA Việt Nam hoặc đang theo học là lợi thế',
        'Thành thạo Excel nâng cao và PowerBI/Tableau là điểm cộng',
      ]),
    benefits: section('Quyền lợi', [
      'Lương từ 20 - 38 triệu VNĐ/tháng',
      'Thưởng theo hiệu quả hoạt động tài chính công ty',
      'Hỗ trợ thi chứng chỉ CPA, ACCA',
      'Bảo hiểm sức khỏe đầy đủ',
      'Môi trường ổn định, chuyên nghiệp',
      'Review lương hàng năm theo năng lực',
    ]),
    employerEmail: 'hr@congtyabc.vn',
    daysUntilDeadline: 38,
  },
]

async function main() {
  console.log('🌱 Seeding 20 new jobs...\n')

  // Build skill map
  const allSkills = await prisma.skill.findMany({ select: { id: true, name: true } })
  const skillMap = Object.fromEntries(allSkills.map((s) => [s.name, s]))

  let created = 0
  let skipped = 0

  for (const job of NEW_JOBS) {
    // Find employer
    const user = await prisma.user.findUnique({ where: { email: job.employerEmail } })
    if (!user) {
      console.warn(`  ⚠ Employer not found: ${job.employerEmail} — skipping "${job.title}"`)
      skipped++
      continue
    }

    const employer = await prisma.employer.findUnique({ where: { userId: user.id } })
    if (!employer) {
      console.warn(`  ⚠ Employer profile not found for: ${job.employerEmail} — skipping`)
      skipped++
      continue
    }

    const slugBase = toSlug(job.title)
    const slug = `${slugBase}-${nanoid(6)}`

    const deadline = job.daysUntilDeadline
      ? new Date(Date.now() + job.daysUntilDeadline * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    // Resolve skills — only include skills that exist in DB
    const resolvedSkills = job.skills.filter((name) => skillMap[name])
    const missingSkills = job.skills.filter((name) => !skillMap[name])
    if (missingSkills.length) {
      console.warn(`  ⚠ Skills not in DB for "${job.title}": ${missingSkills.join(', ')}`)
    }

    const newJob = await prisma.job.create({
      data: {
        title: job.title,
        slug,
        city: job.city,
        location: job.location,
        jobType: job.jobType,
        workMode: job.workMode,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryNegotiable: job.salaryNegotiable ?? false,
        experienceMin: job.experienceMin,
        quantity: job.quantity ?? 1,
        description: job.description,
        requirements: job.requirements,
        benefits: job.benefits,
        status: JobStatus.PUBLISHED,
        deadline,
        employerId: employer.id,
        skills: {
          create: resolvedSkills.map((name) => ({
            skill: { connect: { id: skillMap[name].id } },
          })),
        },
      },
    })

    console.log(`  ✓ [${employer.companyName}] ${job.title}`)
    created++
  }

  console.log(`\n✅ Done! Created ${created} jobs, skipped ${skipped}.`)
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
