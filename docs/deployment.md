# Deployment Guide — NHÀ CÓ TIỆC

Tài liệu hướng dẫn triển khai hệ thống **Nhà Có Tiệc** lên môi trường sản xuất (Vercel + Supabase).

---

## 1. Supabase Setup

1. Tạo dự án mới tại [Supabase Dashboard](https://supabase.com).
2. Mở SQL Editor và thực thi nội dung file migration:
   - [`supabase/migrations/20260903000000_init_schema.sql`](file:///c:/thiepcuoi/nha-co-tiec/supabase/migrations/20260903000000_init_schema.sql)
3. Chạy file Seed SQL khởi tạo dữ liệu ban đầu:
   - [`supabase/seed/seed.sql`](file:///c:/thiepcuoi/nha-co-tiec/supabase/seed/seed.sql)
4. Lấy API Credentials tại mục **Project Settings > API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

---

## 2. Vercel Deployment

1. Đẩy mã nguồn dự án lên GitHub / GitLab repository.
2. Truy cập [Vercel Dashboard](https://vercel.com) và nhập Repository.
3. Cấu hình biến môi trường (Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` (Domain chính thức, ví dụ: `https://nhacotiec.vn`)
4. Bấm **Deploy**. Vercel sẽ tự động build và xuất bản ứng dụng Next.js.
