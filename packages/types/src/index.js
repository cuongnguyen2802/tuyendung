"use strict";
// ─── Enums ────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPLOYER_PLAN_PRICES = exports.EMPLOYER_PLAN_LIMITS = exports.PLAN_PRICES = exports.PLAN_LABELS = exports.PLAN_LIMITS = exports.UserPlan = exports.VIETNAM_CITIES = exports.COMPANY_SIZE_LABELS = exports.APPLICATION_STATUS_LABELS = exports.WORK_MODE_LABELS = exports.JOB_TYPE_LABELS = exports.NotificationType = exports.CompanySize = exports.ApplicationStatus = exports.JobStatus = exports.WorkMode = exports.JobType = exports.Role = void 0;
var Role;
(function (Role) {
    Role["CANDIDATE"] = "CANDIDATE";
    Role["EMPLOYER"] = "EMPLOYER";
    Role["ADMIN"] = "ADMIN";
})(Role || (exports.Role = Role = {}));
var JobType;
(function (JobType) {
    JobType["FULL_TIME"] = "FULL_TIME";
    JobType["PART_TIME"] = "PART_TIME";
    JobType["CONTRACT"] = "CONTRACT";
    JobType["INTERNSHIP"] = "INTERNSHIP";
    JobType["FREELANCE"] = "FREELANCE";
})(JobType || (exports.JobType = JobType = {}));
var WorkMode;
(function (WorkMode) {
    WorkMode["ONSITE"] = "ONSITE";
    WorkMode["REMOTE"] = "REMOTE";
    WorkMode["HYBRID"] = "HYBRID";
})(WorkMode || (exports.WorkMode = WorkMode = {}));
var JobStatus;
(function (JobStatus) {
    JobStatus["DRAFT"] = "DRAFT";
    JobStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    JobStatus["PUBLISHED"] = "PUBLISHED";
    JobStatus["CLOSED"] = "CLOSED";
    JobStatus["EXPIRED"] = "EXPIRED";
    JobStatus["REJECTED"] = "REJECTED";
})(JobStatus || (exports.JobStatus = JobStatus = {}));
var ApplicationStatus;
(function (ApplicationStatus) {
    ApplicationStatus["PENDING"] = "PENDING";
    ApplicationStatus["REVIEWING"] = "REVIEWING";
    ApplicationStatus["INTERVIEW"] = "INTERVIEW";
    ApplicationStatus["OFFER"] = "OFFER";
    ApplicationStatus["REJECTED"] = "REJECTED";
    ApplicationStatus["WITHDRAWN"] = "WITHDRAWN";
})(ApplicationStatus || (exports.ApplicationStatus = ApplicationStatus = {}));
var CompanySize;
(function (CompanySize) {
    CompanySize["STARTUP"] = "STARTUP";
    CompanySize["SMALL"] = "SMALL";
    CompanySize["MEDIUM"] = "MEDIUM";
    CompanySize["LARGE"] = "LARGE";
    CompanySize["ENTERPRISE"] = "ENTERPRISE";
})(CompanySize || (exports.CompanySize = CompanySize = {}));
var NotificationType;
(function (NotificationType) {
    NotificationType["APPLICATION_RECEIVED"] = "APPLICATION_RECEIVED";
    NotificationType["APPLICATION_STATUS_CHANGED"] = "APPLICATION_STATUS_CHANGED";
    NotificationType["JOB_INVITATION"] = "JOB_INVITATION";
    NotificationType["JOB_EXPIRING"] = "JOB_EXPIRING";
    NotificationType["NEW_MESSAGE"] = "NEW_MESSAGE";
    NotificationType["JOB_RECOMMENDED"] = "JOB_RECOMMENDED";
    NotificationType["SYSTEM"] = "SYSTEM";
})(NotificationType || (exports.NotificationType = NotificationType = {}));
// ─── Label maps (dùng cho UI) ─────────────────────────────────────────────────
exports.JOB_TYPE_LABELS = {
    [JobType.FULL_TIME]: 'Toàn thời gian',
    [JobType.PART_TIME]: 'Bán thời gian',
    [JobType.CONTRACT]: 'Hợp đồng',
    [JobType.INTERNSHIP]: 'Thực tập',
    [JobType.FREELANCE]: 'Freelance',
};
exports.WORK_MODE_LABELS = {
    [WorkMode.ONSITE]: 'Tại văn phòng',
    [WorkMode.REMOTE]: 'Từ xa',
    [WorkMode.HYBRID]: 'Kết hợp',
};
exports.APPLICATION_STATUS_LABELS = {
    [ApplicationStatus.PENDING]: 'Chờ xem xét',
    [ApplicationStatus.REVIEWING]: 'Đang xem xét',
    [ApplicationStatus.INTERVIEW]: 'Phỏng vấn',
    [ApplicationStatus.OFFER]: 'Nhận offer',
    [ApplicationStatus.REJECTED]: 'Từ chối',
    [ApplicationStatus.WITHDRAWN]: 'Đã rút',
};
exports.COMPANY_SIZE_LABELS = {
    [CompanySize.STARTUP]: '1-10 nhân viên',
    [CompanySize.SMALL]: '11-50 nhân viên',
    [CompanySize.MEDIUM]: '51-200 nhân viên',
    [CompanySize.LARGE]: '201-500 nhân viên',
    [CompanySize.ENTERPRISE]: '500+ nhân viên',
};
exports.VIETNAM_CITIES = [
    'Hà Nội', 'Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ',
    'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Huế', 'Quảng Ninh',
];
// ─── Upgrade / Plan ───────────────────────────────────────────────────────────
var UserPlan;
(function (UserPlan) {
    UserPlan["FREE"] = "FREE";
    UserPlan["PRO"] = "PRO";
    UserPlan["PREMIUM"] = "PREMIUM";
})(UserPlan || (exports.UserPlan = UserPlan = {}));
exports.PLAN_LIMITS = {
    FREE:    { maxResumes: 1,        maxApplyPerMonth: 5,        viewProfileViewers: false, prioritySearch: false },
    PRO:     { maxResumes: 3,        maxApplyPerMonth: Infinity, viewProfileViewers: true,  prioritySearch: false },
    PREMIUM: { maxResumes: Infinity, maxApplyPerMonth: Infinity, viewProfileViewers: true,  prioritySearch: true  },
};
exports.PLAN_LABELS = {
    [UserPlan.FREE]:    'Miễn phí',
    [UserPlan.PRO]:     'Pro',
    [UserPlan.PREMIUM]: 'Premium',
};
exports.PLAN_PRICES = {
    [UserPlan.FREE]:    0,
    [UserPlan.PRO]:     99000,
    [UserPlan.PREMIUM]: 199000,
};
exports.EMPLOYER_PLAN_LIMITS = {
    FREE:    { maxActiveJobs: 3,        canViewContactInfo: false, featuredJobsPerMonth: 0,        aiSuggestions: false },
    PRO:     { maxActiveJobs: 10,       canViewContactInfo: true,  featuredJobsPerMonth: 3,        aiSuggestions: false },
    PREMIUM: { maxActiveJobs: Infinity, canViewContactInfo: true,  featuredJobsPerMonth: Infinity, aiSuggestions: true  },
};
exports.EMPLOYER_PLAN_PRICES = {
    [UserPlan.FREE]:    0,
    [UserPlan.PRO]:     500000,
    [UserPlan.PREMIUM]: 1200000,
};
//# sourceMappingURL=index.js.map
