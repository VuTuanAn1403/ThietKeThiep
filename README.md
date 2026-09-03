# NHÀ CÓ TIỆC — Online Invitation Platform

> **Mỗi bữa tiệc là một câu chuyện đáng nhớ.**
> 
> Nền tảng thiết kế & quản lý thiệp mời online cao cấp tại Việt Nam. Cá nhân hóa từng khách mời, xác nhận RSVP tức thì, bảo mật dữ liệu và tiết kiệm 80% chi phí in ấn.

---

## 🌟 Tính Năng Chính

- **Thư viện Template Đa Dạng**: Các mẫu thiết kế tinh tế (Đám Cưới, Sinh Nhật, Thôi Nôi, Tân Gia, Khai Trương, Kỷ Niệm).
- **Trình Biên Tập Kép (Live Editor)**: Xem trực tiếp thay đổi giao diện thiệp ở cả chế độ Mobile View và Desktop View.
- **Dynamic Public Renderer**: Tự động render 11 section giao diện thiệp (`Hero`, `Intro`, `Countdown`, `Event`, `Map`, `Story`, `Gallery`, `Gift`, `Signature`, `RSVP`, `Guestbook`, `Footer`).
- **Personalized Link & QR Code**: Sinh đường dẫn cá nhân hóa theo từng khách mời (`/i/minh-anh?to=nguyen-van-a`) và mã QR Code sắc nét.
- **Guest Management & CSV Import**: Quản lý danh sách khách mời theo nhóm (Nhà Trai, Nhà Gái, Bạn Bè,...), nhập xuất dữ liệu dễ dàng.
- **Báo cáo RSVP & Analytics**: Thống kê tỷ lệ tham dự, theo dõi lượt xem thiệp trực quan.
- **Sổ Lưu Bút & Chữ Ký Số**: Khách mời gửi lời chúc và lưu bút kèm ảnh trực tiếp trên thiệp.
- **Cấu hình Quà Tặng / VietQR**: Cài đặt tài khoản ngân hàng và mã QR chuyển khoản trực tiếp an toàn.
- **Admin Control Center**: Quản trị người dùng, danh mục sự kiện, kho mẫu thiệp và duyệt phản hồi.
- **Swagger UI & REST API v1**: Tài liệu API tương tác trực tiếp chuẩn OpenAPI 3.0 tại `/swagger-ui`.
- **Tối Ưu Hóa SEO & Trust**: Tích hợp đầy đủ Sitemap (`/sitemap.xml`), Robots (`/robots.txt`), OpenGraph Image dynamic, Structured Data (Organization, WebSite, FAQPage, Event), Breadcrumbs, Case Studies (`/case-studies`), FAQ (`/faq`), Privacy Policy (`/privacy`).

---

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 15 (App Router), TypeScript, React, Tailwind CSS, Lucide React, Framer Motion, Recharts.
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage, Row Level Security RLS).
- **SEO & Social**: `next/og` (Dynamic ImageResponse), JSON-LD Structured Data, Semantic HTML5.
- **Analytics**: Google Analytics 4 (GA4) với tính năng bảo vệ quyền riêng tư & IP anonymization.
- **Validation**: Zod schema validation.
- **Utilities**: PapaParse (CSV Parsing), QRCode.
- **Containerization**: Docker Multi-Stage Build (Node 20 Alpine Standalone).

---

## 🚀 Cấu Hình Biến Môi Trường (`.env.local`)

```env
# Supabase Database & Auth
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-key

# Website Base URL (Dùng cho Canonical & Sitemap)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Optional: Google Analytics (GA4)
# Để trống khi chạy development
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🚀 Hướng Dẫn Triển Khai (Deployment)

### 1. Triển Khai Cục Bộ (Local Development)

```bash
# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Truy cập ứng dụng:
- **Trang chủ:** `http://localhost:3000`
- **Mẫu thiệp:** `http://localhost:3000/templates`
- **Case Studies:** `http://localhost:3000/case-studies`
- **FAQ:** `http://localhost:3000/faq`
- **Chính sách bảo mật:** `http://localhost:3000/privacy`
- **Admin Portal:** `http://localhost:3000/admin`
- **Swagger UI:** `http://localhost:3000/swagger-ui`

### 2. Triển Khai Bằng Docker (Containerization)

```bash
# Build image và chạy container
docker compose up -d --build

# Xem logs
docker compose logs -f

# Dừng container
docker compose down
```

### 3. Triển Khai Lên Vercel (Production Cloud)

1. **Đẩy mã nguồn lên GitHub**:
   ```bash
   git push origin main
   ```
2. **Import Project trên Vercel Dashboard**:
   - Truy cập [vercel.com](https://vercel.com) → Chọn **Add New Project** → Chọn repo `VuTuanAn1403/ThietKeThiep`.
   - **Framework Preset**: Chọn `Next.js`.
   - **Root Directory**: `./` (thư mục gốc chứa `package.json`).
   - **Build Command**: `npm run build`
   - **Install Command**: `npm ci`
3. **Cấu hình Environment Variables** trên Vercel:
   - Thêm các biến môi trường từ mục danh sách bên dưới (Supabase URL, Anon Key, Site URL,...).
4. **Deploy**:
   - Nhấn **Deploy** và đợi quá trình build hoàn tất.
5. **Cấu hình Supabase Authentication URL**:
   - Truy cập Supabase Dashboard → **Authentication** → **URL Configuration**.
   - Đặt **Site URL** thành domain Vercel của bạn (ví dụ: `https://thietkethiep.vercel.app`).
   - Thêm Redirect URLs: `https://thietkethiep.vercel.app/**` và `https://thietkethiep.vercel.app/reset-password`.

---

## 🔑 Danh Sách Biến Môi Trường (Environment Variables)

### Biến Công Khai (Public - Client & Server)
- `NEXT_PUBLIC_SUPABASE_URL`: Địa chỉ API Supabase project.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Anon public key của Supabase.
- `NEXT_PUBLIC_SITE_URL`: Domain chính thức của website (VD: `https://nhacotiec.vn` hoặc `https://<project>.vercel.app`).
- `NEXT_PUBLIC_TURNSTILE_SITE_KEY`: (Tùy chọn) Cloudflare Turnstile CAPTCHA site key.
- `NEXT_PUBLIC_SENTRY_DSN`: (Tùy chọn) Sentry client DSN.
- `NEXT_PUBLIC_GA_MEASUREMENT_ID`: (Tùy chọn) Google Analytics 4 Measurement ID.

### Biến Bảo Mật Server (Server-Only Secrets - Không bao giờ đưa vào client bundle)
- `SUPABASE_SERVICE_ROLE_KEY`: Service role secret key của Supabase.
- `TURNSTILE_SECRET_KEY`: (Tùy chọn) Cloudflare Turnstile secret key.
- `SENTRY_DSN`: (Tùy chọn) Sentry server DSN.
- `ADMIN_EMAIL`: (Tùy chọn) Email quản trị viên khởi tạo ban đầu.
- `ADMIN_PASSWORD`: (Tùy chọn) Mật khẩu quản trị viên khởi tạo ban đầu.
- `PAYMENT_BANK_NAME`: (Tùy chọn) Tên ngân hàng nhận chuyển khoản.
- `PAYMENT_ACCOUNT_NUMBER`: (Tùy chọn) Số tài khoản ngân hàng nhận chuyển khoản.
- `PAYMENT_ACCOUNT_NAME`: (Tùy chọn) Tên chủ tài khoản nhận chuyển khoản.
- `PAYMENT_QR_IMAGE`: (Tùy chọn) URL hình ảnh mã QR chuyển khoản mặc định.

## 🧪 Kiểm Thử & Đảm Bảo Chất Lượng (QA)

```bash
# Chạy toàn bộ Unit & Integration Test suite
npm test

# Kiểm tra TypeScript strict mode
npm run typecheck

# Kiểm tra Lint
npx next lint

# Biên dịch Production Build
npm run build
```

---

## 📂 Cấu Trúc Thư Mục

```text
nha-co-tiec/
├── app/                  # Next.js App Router
│   ├── (auth)/           # /login, /register, /forgot-password
│   ├── 403/              # Access Denied page
│   ├── not-found.tsx     # Custom 404 page
│   ├── thank-you/        # Thank You confirmation page
│   ├── case-studies/     # Case Studies & Demo scenarios
│   ├── faq/              # FAQ page & FAQPage schema
│   ├── privacy/          # Privacy policy page
│   ├── swagger-ui/       # Interactive Swagger UI
│   ├── opengraph-image.tsx # Dynamic OpenGraph social image
│   ├── robots.ts         # Dynamic robots.txt
│   ├── sitemap.ts        # Dynamic sitemap.xml
│   ├── dashboard/        # User Dashboard (10 modules)
│   ├── admin/            # Admin Management Center (7 modules)
│   ├── templates/        # Thư viện mẫu thiệp & Chi tiết
│   ├── api/              # REST API v1 endpoints & OpenAPI spec
│   └── i/[slug]/         # Trang hiển thị thiệp công khai
├── components/           # Reusable UI & Logic components
│   ├── Breadcrumbs.tsx   # Accessible Breadcrumbs
│   ├── GoogleAnalytics.tsx # Safe GA4 integration
│   ├── JsonLd.tsx        # Organization & WebSite JSON-LD
│   ├── StickyMobileCTA.tsx # Mobile sticky bottom CTA
│   ├── invitation/       # Render thiệp động & 11 sections
│   └── editor/           # Control panel & Live preview editor
├── lib/                  # Auth, Supabase clients & Validations
├── services/             # Pure Domain Services
├── types/                # TypeScript Interfaces & Database types
├── supabase/             # Migrations & Seed data
├── tests/                # Automated Node test suites
└── docs/                 # Báo cáo & Tài liệu kiến trúc
```

---

## 📄 Tài Liệu Kỹ Thuật Chi Tiết

- [`docs/phase-2-5-final-report.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/phase-2-5-final-report.md) — Báo cáo tổng kết toàn diện Phase 2 → Phase 5
- [`docs/auth-security-hardening.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/auth-security-hardening.md) — Báo cáo chi tiết bảo mật xác thực & phân lập sở hữu
- [`docs/authentication.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/authentication.md) — Kiến trúc xác thực, phân quyền & bảo vệ route
- [`docs/marketing-seo-audit.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/marketing-seo-audit.md) — Báo cáo audit SEO, Trust, Conversion & Local Presence
- [`docs/architecture.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/architecture.md) — Kiến trúc hệ thống
- [`docs/database.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/database.md) — Thiết kế Schema & RLS
- [`docs/api.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/api.md) — Danh mục API v1
- [`docs/swagger.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/swagger.md) — Hướng dẫn Swagger UI
- [`docs/security.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/security.md) — Tiêu chuẩn bảo mật
- [`docs/testing.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/testing.md) — Hướng dẫn kiểm thử
- [`docs/final-review.md`](file:///c:/thiepcuoi/nha-co-tiec/docs/final-review.md) — Tổng kết đánh giá chất lượng sản phẩm
