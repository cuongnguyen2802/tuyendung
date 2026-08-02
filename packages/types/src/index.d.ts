export declare enum Role {
    CANDIDATE = "CANDIDATE",
    EMPLOYER = "EMPLOYER",
    ADMIN = "ADMIN"
}
export declare enum JobType {
    FULL_TIME = "FULL_TIME",
    PART_TIME = "PART_TIME",
    CONTRACT = "CONTRACT",
    INTERNSHIP = "INTERNSHIP",
    FREELANCE = "FREELANCE"
}
export declare enum WorkMode {
    ONSITE = "ONSITE",
    REMOTE = "REMOTE",
    HYBRID = "HYBRID"
}
export declare enum JobStatus {
    DRAFT = "DRAFT",
    PENDING_APPROVAL = "PENDING_APPROVAL",
    PUBLISHED = "PUBLISHED",
    CLOSED = "CLOSED",
    EXPIRED = "EXPIRED",
    REJECTED = "REJECTED"
}
export declare enum ApplicationStatus {
    PENDING = "PENDING",
    REVIEWING = "REVIEWING",
    INTERVIEW = "INTERVIEW",
    OFFER = "OFFER",
    REJECTED = "REJECTED",
    WITHDRAWN = "WITHDRAWN"
}
export declare enum CompanySize {
    STARTUP = "STARTUP",
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
    ENTERPRISE = "ENTERPRISE"
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    error?: string;
}
export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginationMeta;
}
export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
export interface PaginationQuery {
    page?: number;
    limit?: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}
export interface JwtPayload {
    sub: string;
    email: string;
    role: Role;
}
export interface RegisterDto {
    email: string;
    password: string;
    role: Role.CANDIDATE | Role.EMPLOYER;
    fullName?: string;
    companyName?: string;
}
export interface LoginDto {
    email: string;
    password: string;
}
export interface UserDto {
    id: string;
    email: string;
    role: Role;
    emailVerified: boolean;
    createdAt: string;
}
export interface CandidateProfileDto {
    id: string;
    userId: string;
    fullName: string;
    phone?: string;
    avatarUrl?: string;
    title?: string;
    summary?: string;
    city?: string;
    country: string;
    linkedinUrl?: string;
    githubUrl?: string;
    portfolioUrl?: string;
    skills: CandidateSkillDto[];
    experiences: WorkExperienceDto[];
    educations: EducationDto[];
}
export interface CandidateSkillDto {
    skillId: string;
    skill: SkillDto;
    level?: string;
}
export interface SkillDto {
    id: string;
    name: string;
    slug: string;
}
export interface WorkExperienceDto {
    id: string;
    title: string;
    company: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
    description?: string;
}
export interface EducationDto {
    id: string;
    school: string;
    degree?: string;
    major?: string;
    startDate: string;
    endDate?: string;
    isCurrent: boolean;
}
export interface ResumeDto {
    id: string;
    title: string;
    fileUrl: string;
    isDefault: boolean;
    createdAt: string;
}
export interface EmployerDto {
    id: string;
    companyName: string;
    slug: string;
    logoUrl?: string;
    coverUrl?: string;
    website?: string;
    description?: string;
    size?: CompanySize;
    industry?: string;
    city?: string;
    verified: boolean;
    jobCount?: number;
}
export interface JobDto {
    id: string;
    title: string;
    slug: string;
    description: string;
    requirements?: string;
    benefits?: string;
    location: string;
    city: string;
    jobType: JobType;
    workMode: WorkMode;
    salaryMin?: number;
    salaryMax?: number;
    salaryCurrency: string;
    salaryNegotiable: boolean;
    experienceMin?: number;
    experienceMax?: number;
    quantity: number;
    deadline?: string;
    status: JobStatus;
    views: number;
    isFeatured: boolean;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
    employer: EmployerDto;
    skills: SkillDto[];
    applicationCount?: number;
    isSaved?: boolean;
    hasApplied?: boolean;
}
export interface JobSearchQuery extends PaginationQuery {
    keyword?: string;
    city?: string;
    jobType?: JobType;
    workMode?: WorkMode;
    salaryMin?: number;
    salaryMax?: number;
    experienceMin?: number;
    skills?: string[];
    industry?: string;
    companySize?: CompanySize;
    sortBy?: 'newest' | 'salary' | 'views';
}
export interface ApplicationDto {
    id: string;
    jobId: string;
    userId: string;
    resumeId?: string;
    coverLetter?: string;
    status: ApplicationStatus;
    appliedAt: string;
    updatedAt: string;
    job?: Pick<JobDto, 'id' | 'title' | 'slug' | 'city' | 'jobType' | 'employer'>;
    resume?: ResumeDto;
    candidate?: Pick<CandidateProfileDto, 'fullName' | 'avatarUrl' | 'title'>;
}
export declare const JOB_TYPE_LABELS: Record<JobType, string>;
export declare const WORK_MODE_LABELS: Record<WorkMode, string>;
export declare const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string>;
export declare const COMPANY_SIZE_LABELS: Record<CompanySize, string>;
export declare const VIETNAM_CITIES: string[];
//# sourceMappingURL=index.d.ts.map