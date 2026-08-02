"use strict";
// ─── Enums ────────────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.VIETNAM_CITIES = exports.COMPANY_SIZE_LABELS = exports.APPLICATION_STATUS_LABELS = exports.WORK_MODE_LABELS = exports.JOB_TYPE_LABELS = exports.CompanySize = exports.ApplicationStatus = exports.JobStatus = exports.WorkMode = exports.JobType = exports.Role = void 0;
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
//# sourceMappingURL=index.js.map