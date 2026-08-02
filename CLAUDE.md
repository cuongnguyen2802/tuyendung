# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Web tuyển dụng tương tự TopCV — kết nối ứng viên và nhà tuyển dụng. Ba vai trò chính: **Candidate** (tìm việc, nộp CV), **Employer** (đăng tin, quản lý ứng tuyển), **Admin** (quản trị hệ thống).

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui |
| Backend | NestJS, TypeScript, Prisma ORM |
| Primary DB | PostgreSQL |
| Cache / Sessions | Redis |
| Full-text Search | Meilisearch |
| File Storage | AWS S3 (CV, avatar, company logo) |
| Auth | JWT (access 15m + refresh 7d), NextAuth.js trên frontend |
| Monorepo | Turborepo |
| Dev Infra | Docker Compose |

## Monorepo Structure

```
apps/
  web/        # Next.js 15 frontend
  api/        # NestJS backend
packages/
  database/   # Prisma schema + generated client (shared)
  types/      # Shared TypeScript types/DTOs
  utils/      # Shared utility functions
```

## Common Commands

### Development
```bash
# Cài dependencies toàn bộ monorepo
pnpm install

# Chạy toàn bộ (api + web cùng lúc)
pnpm dev

# Chạy riêng từng app
pnpm --filter web dev        # http://localhost:3000
pnpm --filter api start:dev  # http://localhost:3001

# Khởi động infra (PostgreSQL, Redis, Meilisearch)
docker compose up -d
```

### Database (Prisma — chạy từ packages/database/)
```bash
pnpm --filter database db:migrate      # prisma migrate dev
pnpm --filter database db:push         # prisma db push (prototype nhanh)
pnpm --filter database db:generate     # tái tạo Prisma Client sau khi sửa schema
pnpm --filter database db:seed         # prisma db seed
pnpm --filter database db:studio       # Prisma Studio GUI
```

### Build & Lint
```bash
pnpm build          # build tất cả apps (turbo)
pnpm lint           # eslint toàn monorepo
pnpm type-check     # tsc --noEmit toàn monorepo
pnpm format         # prettier --write
```

### Testing
```bash
pnpm test                            # chạy tất cả tests
pnpm --filter api test               # unit tests NestJS
pnpm --filter api test:e2e           # e2e tests (jest + supertest)
pnpm --filter api test -- --testPathPattern=jobs  # chạy 1 file test cụ thể
pnpm --filter web test               # component tests (Vitest)
```

## Backend Architecture (NestJS — apps/api/)

NestJS theo kiến trúc module. Mỗi domain là một module độc lập.

### Module chính
```
src/
  auth/           # Đăng ký, đăng nhập, refresh token, OAuth (Google/LinkedIn)
  users/          # Profile ứng viên, upload avatar
  employers/      # Profile công ty, xác minh doanh nghiệp
  jobs/           # CRUD tin tuyển dụng, tìm kiếm, lọc
  applications/   # Nộp đơn, tracking trạng thái (pending→review→interview→offer→rejected)
  resumes/        # Upload/quản lý CV (PDF), CV builder
  search/         # Wrapper Meilisearch — index jobs và companies
  notifications/  # In-app + email (Nodemailer/Resend)
  admin/          # Quản trị: duyệt tin, quản lý user, thống kê
  common/         # Guards, interceptors, decorators, pipes dùng chung
  config/         # ConfigModule, biến môi trường (env validation với Zod)
```

### Luồng request chuẩn
`Controller → Service → Repository (Prisma) → DB`

Guards xử lý auth/authorization. Interceptors xử lý logging và transform response. DTOs dùng class-validator để validate input tại controller layer.

### Phân quyền
- `@Public()` decorator — bypass JWT guard
- `@Roles(Role.EMPLOYER)` — role-based guard
- Job owner check nằm trong service, không phải guard

## Frontend Architecture (Next.js 15 — apps/web/)

Dùng **App Router**. Phân chia route theo vai trò.

### Cấu trúc route
```
app/
  (public)/           # Layout không cần đăng nhập
    jobs/             # Danh sách + tìm kiếm việc làm
    jobs/[slug]/      # Chi tiết tin tuyển dụng
    companies/        # Danh sách + profile công ty
  (auth)/             # Login, register, forgot-password
  (candidate)/        # Layout riêng ứng viên (sidebar)
    profile/
    applications/
    resumes/
  (employer)/         # Layout riêng nhà tuyển dụng
    dashboard/
    jobs/
    candidates/
  (admin)/            # Layout admin
    dashboard/
    jobs/approve/
    users/
```

### Data fetching pattern
- **Server Components** cho trang public cần SEO (job listing, job detail, company profile)
- **Client Components** + TanStack Query cho trang cần interactivity (dashboard, apply form)
- API calls từ Server Components dùng `fetch` với `{ cache: 'no-store' }` hoặc `{ next: { revalidate: 60 } }`

### State management
- TanStack Query cho server state (jobs, applications, user data)
- Zustand cho UI state (filters, modal state)
- React Hook Form + Zod cho form validation (dùng cùng schema với backend khi có thể)

## Database Schema (Prisma — packages/database/)

Các entity trung tâm và quan hệ:

```
User ──< Resume           (1 user nhiều CV)
User ──< Application      (1 user nhiều đơn ứng tuyển)
User ──< SavedJob         (bookmark việc làm)
Employer ──< Job          (1 công ty nhiều tin)
Job ──< Application       (1 tin nhiều đơn)
Job ──< JobSkill >── Skill (many-to-many qua junction table)
Application: status enum = PENDING | REVIEWING | INTERVIEW | OFFER | REJECTED
Job: status enum = DRAFT | PENDING_APPROVAL | PUBLISHED | CLOSED | EXPIRED
```

## Search Architecture

Meilisearch được sync bằng Prisma middleware (sau khi create/update/delete Job). Index `jobs` chứa: title, description, company name, location, skills, salary range. Tìm kiếm full-text + filter theo location/salary/job\_type đi thẳng vào Meilisearch, không qua PostgreSQL.

## Environment Variables

Xem `.env.example` ở root. Các biến bắt buộc:
- `DATABASE_URL` — PostgreSQL connection string
- `REDIS_URL`
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`
- `AWS_S3_BUCKET`, `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
- `NEXT_PUBLIC_API_URL` — URL của NestJS API (dùng ở frontend)

## Key Conventions

### API Response format (chuẩn hóa qua interceptor)
```json
{ "success": true, "data": {}, "message": "OK" }
{ "success": false, "error": "NOT_FOUND", "message": "Job not found" }
```

Pagination: `{ "data": [], "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 } }`

### File upload
CV và hình ảnh upload lên S3 qua NestJS (không upload thẳng từ browser để kiểm soát file type/size). Endpoint trả về S3 URL để lưu vào DB.

### Slug generation
Job và Company đều có `slug` field (unique). Generate từ title + nanoid suffix, dùng cho SEO-friendly URL.
