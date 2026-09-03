# Architecture Specification — NHÀ CÓ TIỆC

Tài liệu mô tả kiến trúc tổng thể của hệ thống **Nhà Có Tiệc**.

---

## 1. Overview Architecture

Hệ thống được thiết kế dựa trên mô hình **Next.js App Router (Full-Stack)** với backend là **Supabase (PostgreSQL + Auth + Storage)**.

```text
[ Client Browser ]
       │
       ▼
[ Next.js App Router Layer ]
   ├── Middleware (Auth check, Role check, Protected routes)
   ├── Public Routes (/i/[slug], /templates, /login, /register)
   ├── Dashboard Routes (/dashboard/...)
   ├── Admin Routes (/admin/...)
   └── API Handlers & Server Actions
       │
       ▼
[ Service Layer ]
   ├── invitation.service.ts
   ├── guest.service.ts
   ├── template.service.ts
   ├── rsvp.service.ts
   ├── wish.service.ts
   └── analytics.service.ts
       │
       ▼
[ Supabase PostgreSQL + RLS ]
   ├── Database Tables & Indexes
   ├── Row Level Security (RLS)
   └── Storage Buckets (Images & Music)
```

---

## 2. Directory Structure

```text
nha-co-tiec/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── dashboard/
│   │   ├── page.tsx
│   │   ├── invitations/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── edit/page.tsx
│   │   │       ├── guests/page.tsx
│   │   │       ├── rsvp/page.tsx
│   │   │       ├── wishes/page.tsx
│   │   │       └── analytics/page.tsx
│   ├── admin/
│   │   ├── page.tsx
│   │   ├── users/page.tsx
│   │   ├── templates/page.tsx
│   │   └── categories/page.tsx
│   ├── templates/
│   │   ├── page.tsx
│   │   └── [slug]/page.tsx
│   ├── i/
│   │   └── [slug]/page.tsx
│   ├── layout.tsx
│   └── page.tsx
│
├── components/
│   ├── ui/               # Core UI components (Buttons, Inputs, Cards, Dialogs, Badges, Tabs)
│   ├── invitation/       # Public renderer and Section components
│   ├── editor/           # Editor panel & Live preview controls
│   ├── dashboard/        # Dashboard layout, metrics & tables
│   ├── admin/            # Admin management widgets
│   └── template/         # Template catalog cards and filters
│
├── lib/
│   ├── supabase/         # Supabase client & server instances
│   ├── auth/             # Session helpers & role authorization
│   ├── validations/      # Zod schemas for all forms & actions
│   └── utils/            # Helper functions (slug, dates, formatters)
│
├── services/             # Pure domain services logic
├── types/                # TypeScript interface & type definitions
├── hooks/                # Custom React hooks
├── supabase/
│   ├── migrations/       # SQL migrations
│   └── seed/             # Initial seed data
├── tests/                # Unit and integration test suites
└── docs/                 # Documentation
```

---

## 3. Core Technical Decisions

1. **Rendering Strategy**:
   - Sử dụng Server Components cho các trang Landing, Public Invitation `/i/[slug]`, Catalog `/templates` để tối ưu SEO & LCP.
   - Sử dụng Client Components cho Editor Panel, Interactive Maps, Form Submissions & Dashboard Charts.

2. **Template Architecture**:
   - Không tạo từng trang code riêng cho mỗi mẫu thiệp. Tất cả mẫu thiệp đều chạy qua `InvitationRenderer` với cấu hình JSON theme & dynamic section composition.

3. **Data Security & Privacy**:
   - Mọi truy vấn database được bảo vệ bằng Supabase Row Level Security (RLS).
   - Server-side authorization bắt buộc tại Middleware và Service Handlers đối với tài nguyên của User và Admin.
