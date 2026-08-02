// ─── Job Category ─────────────────────────────────────────────────────────────

export interface JobCategoryDto {
  id: string
  name: string
  slug: string
  icon?: string
  description?: string
  order: number
  isActive: boolean
  jobCount?: number
}

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum Role {
  CANDIDATE = 'CANDIDATE',
  EMPLOYER = 'EMPLOYER',
  ADMIN = 'ADMIN',
}

export enum JobType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
  INTERNSHIP = 'INTERNSHIP',
  FREELANCE = 'FREELANCE',
}

export enum WorkMode {
  ONSITE = 'ONSITE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum JobStatus {
  DRAFT = 'DRAFT',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  PUBLISHED = 'PUBLISHED',
  CLOSED = 'CLOSED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  INTERVIEW = 'INTERVIEW',
  OFFER = 'OFFER',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum CompanySize {
  STARTUP = 'STARTUP',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

export enum NotificationType {
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  APPLICATION_STATUS_CHANGED = 'APPLICATION_STATUS_CHANGED',
  JOB_INVITATION = 'JOB_INVITATION',
  JOB_EXPIRING = 'JOB_EXPIRING',
  NEW_MESSAGE = 'NEW_MESSAGE',
  JOB_RECOMMENDED = 'JOB_RECOMMENDED',
  SYSTEM = 'SYSTEM',
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export interface PaginationMeta {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface PaginationQuery {
  page?: number
  limit?: number
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface JwtPayload {
  sub: string
  email: string
  role: Role
}

export interface RegisterDto {
  email: string
  password: string
  role: Role.CANDIDATE | Role.EMPLOYER
  fullName?: string
  companyName?: string
}

export interface LoginDto {
  email: string
  password: string
}

// ─── User / Candidate ─────────────────────────────────────────────────────────

export interface UserDto {
  id: string
  email: string
  role: Role
  emailVerified: boolean
  createdAt: string
}

export interface CandidateProfileDto {
  id: string
  userId: string
  fullName: string
  phone?: string
  avatarUrl?: string
  title?: string
  summary?: string
  city?: string
  country: string
  linkedinUrl?: string
  githubUrl?: string
  portfolioUrl?: string
  openToWork?: boolean
  expectedSalaryMin?: number
  expectedSalaryMax?: number
  skills: CandidateSkillDto[]
  experiences: WorkExperienceDto[]
  educations: EducationDto[]
}

export interface CandidateSkillDto {
  skillId: string
  skill: SkillDto
  level?: string
}

export interface SkillDto {
  id: string
  name: string
  slug: string
}

export interface WorkExperienceDto {
  id: string
  title: string
  company: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description?: string
}

export interface EducationDto {
  id: string
  school: string
  degree?: string
  major?: string
  startDate: string
  endDate?: string
  isCurrent: boolean
}

export interface ResumeDto {
  id: string
  title: string
  fileUrl: string
  isDefault: boolean
  createdAt: string
}

// ─── Employer / Company ───────────────────────────────────────────────────────

export interface EmployerDto {
  id: string
  companyName: string
  slug: string
  logoUrl?: string
  coverUrl?: string
  website?: string
  description?: string
  size?: CompanySize
  industry?: string
  city?: string
  verified: boolean
  jobCount?: number
}

// ─── Job ──────────────────────────────────────────────────────────────────────

export interface JobDto {
  id: string
  title: string
  slug: string
  description: string
  requirements?: string
  benefits?: string
  location: string
  city: string
  jobType: JobType
  workMode: WorkMode
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  salaryNegotiable: boolean
  experienceMin?: number
  experienceMax?: number
  quantity: number
  deadline?: string
  status: JobStatus
  views: number
  isFeatured: boolean
  publishedAt?: string
  createdAt: string
  updatedAt: string
  employer: EmployerDto
  skills: SkillDto[]
  applicationCount?: number
  isSaved?: boolean
  hasApplied?: boolean
}

export interface JobSearchQuery extends PaginationQuery {
  keyword?: string
  city?: string
  jobType?: JobType
  workMode?: WorkMode
  salaryMin?: number
  salaryMax?: number
  experienceMin?: number
  skills?: string[]
  industry?: string
  companySize?: CompanySize
  sortBy?: 'newest' | 'salary' | 'views'
}

// ─── Application ──────────────────────────────────────────────────────────────

export interface ApplicationDto {
  id: string
  jobId: string
  userId: string
  resumeId?: string
  coverLetter?: string
  status: ApplicationStatus
  appliedAt: string
  updatedAt: string
  job?: Pick<JobDto, 'id' | 'title' | 'slug' | 'city' | 'jobType' | 'employer'>
  resume?: ResumeDto
  candidate?: Pick<CandidateProfileDto, 'fullName' | 'avatarUrl' | 'title'>
}

// ─── Label maps (dùng cho UI) ─────────────────────────────────────────────────

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  [JobType.FULL_TIME]: 'Toàn thời gian',
  [JobType.PART_TIME]: 'Bán thời gian',
  [JobType.CONTRACT]: 'Hợp đồng',
  [JobType.INTERNSHIP]: 'Thực tập',
  [JobType.FREELANCE]: 'Freelance',
}

export const WORK_MODE_LABELS: Record<WorkMode, string> = {
  [WorkMode.ONSITE]: 'Tại văn phòng',
  [WorkMode.REMOTE]: 'Từ xa',
  [WorkMode.HYBRID]: 'Kết hợp',
}

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  [ApplicationStatus.PENDING]: 'Chờ xem xét',
  [ApplicationStatus.REVIEWING]: 'Đang xem xét',
  [ApplicationStatus.INTERVIEW]: 'Phỏng vấn',
  [ApplicationStatus.OFFER]: 'Nhận offer',
  [ApplicationStatus.REJECTED]: 'Từ chối',
  [ApplicationStatus.WITHDRAWN]: 'Đã rút',
}

export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  [CompanySize.STARTUP]: '1-10 nhân viên',
  [CompanySize.SMALL]: '11-50 nhân viên',
  [CompanySize.MEDIUM]: '51-200 nhân viên',
  [CompanySize.LARGE]: '201-500 nhân viên',
  [CompanySize.ENTERPRISE]: '500+ nhân viên',
}

export const VIETNAM_CITIES = [
  'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
  'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Huế', 'Quảng Ninh',
]

// ─── Upgrade / Plan ───────────────────────────────────────────────────────────

export enum UserPlan {
  FREE    = 'FREE',
  PRO     = 'PRO',
  PREMIUM = 'PREMIUM',
}

export const PLAN_LIMITS = {
  FREE:    { maxResumes: 1,  maxApplyPerMonth: 5,  viewProfileViewers: false, prioritySearch: false },
  PRO:     { maxResumes: 3,  maxApplyPerMonth: Infinity, viewProfileViewers: true,  prioritySearch: false },
  PREMIUM: { maxResumes: Infinity, maxApplyPerMonth: Infinity, viewProfileViewers: true,  prioritySearch: true  },
} as const

export const PLAN_LABELS: Record<UserPlan, string> = {
  [UserPlan.FREE]:    'Miễn phí',
  [UserPlan.PRO]:     'Pro',
  [UserPlan.PREMIUM]: 'Premium',
}

export const PLAN_PRICES: Record<UserPlan, number> = {
  [UserPlan.FREE]:    0,
  [UserPlan.PRO]:     99000,
  [UserPlan.PREMIUM]: 199000,
}

export const EMPLOYER_PLAN_LIMITS = {
  FREE:    { maxActiveJobs: 3,        canViewContactInfo: false, featuredJobsPerMonth: 0,        aiSuggestions: false },
  PRO:     { maxActiveJobs: 10,       canViewContactInfo: true,  featuredJobsPerMonth: 3,        aiSuggestions: false },
  PREMIUM: { maxActiveJobs: Infinity, canViewContactInfo: true,  featuredJobsPerMonth: Infinity, aiSuggestions: true  },
} as const

export const EMPLOYER_PLAN_PRICES: Record<UserPlan, number> = {
  [UserPlan.FREE]:    0,
  [UserPlan.PRO]:     500000,
  [UserPlan.PREMIUM]: 1200000,
}

export interface ProfileViewDto {
  id: string
  createdAt: string
  viewer?: {
    id: string
    companyName: string
    logoUrl?: string
    slug: string
  } | null
}
