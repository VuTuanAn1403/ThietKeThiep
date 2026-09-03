# Reference Projects Analysis — NHÀ CÓ TIỆC

Tài liệu này tổng hợp phân tích kỹ thuật và kinh nghiệm rút ra từ 5 dự án tham khảo trong `C:\thiepcuoi\reference-projects`.

---

## 1. Danh sách Dự án Tham khảo & Điểm nổi bật

### 1.1. Ceremonia (`C:\thiepcuoi\reference-projects\Ceremonia`)
- **Công nghệ**: Next.js (App Router), TypeScript, Drizzle ORM / Supabase, Bun, Vitest, Tailwind CSS.
- **Điểm mạnh**:
  - Kiến trúc phân chia rõ rệt giữa Editor (Control side) và Dynamic Public Renderer.
  - Quản lý theme linh hoạt với biến màu CSS (CSS Variables) và Tailwind utility dynamic injection.
  - Phân hệ RSVP xử lý logic cho phép đăng ký theo nhóm (group count) với giới hạn `max_guests`.
  - Có sẵn tích hợp Analytics (lượt xem, địa điểm truy cập, thiết bị).
- **Bài học ứng dụng**:
  - Không hardcode màu sắc trực tiếp vào component, dùng theme config JSON lưu trong Database render qua CSS Variables.
  - Quản lý trạng thái thiệp với các enum chuẩn (`DRAFT`, `PUBLISHED`, `ARCHIVED`).

### 1.2. wedding-invitation-app (`C:\thiepcuoi\reference-projects\wedding-invitation-app`)
- **Công nghệ**: Next.js App Router, TypeScript, Supabase Auth & Storage.
- **Điểm mạnh**:
  - Xử lý link cá nhân hóa ấn tượng thông qua URL Parameter: `/i/[slug]?to=[guest-slug]`.
  - Phân hệ quản lý khách mời (Guest Management) hỗ trợ CSV Import và sinh mã QR Code động cho từng khách mời.
  - Dashboard trực quan cho chủ thiệp theo dõi trạng thái phản hồi RSVP (Tham dự, Vắng mặt, Chưa phản hồi).
- **Bài học ứng dụng**:
  - Cần bảo đảm tính bảo mật của Guest Slug: không cho phép guest slug thuộc thiệp A truy cập dữ liệu thiệp B.
  - Form RSVP cần tự động điền sẵn thông tin khi truy cập bằng Personalized Link.

### 1.3. wedding-invite (`C:\thiepcuoi\reference-projects\wedding-invite`)
- **Công nghệ**: Next.js, Framer Motion, Tailwind CSS, Canvas Confetti.
- **Điểm mạnh**:
  - Giao diện người xem (Public Page) mượt mà với animation vừa phải, đếm ngược thời gian (Countdown) chính xác.
  - Tối ưu hóa tuyệt vời cho thiết bị di động (Mobile-first).
  - Tích hợp Sổ lời chúc (Guestbook) kết hợp hiển thị các lời chúc đã duyệt dưới dạng Carousel / Grid.
- **Bài học ứng dụng**:
  - Xử lý đếm ngược không được hiển thị số âm khi sự kiện đã trôi qua.
  - Cần thêm nút mở bản đồ chỉ đường bên ngoài (Google Maps / Apple Maps) để tối ưu UX cho khách mời di chuyển.

### 1.4. wedding-invitation-platform (`C:\thiepcuoi\reference-projects\wedding-invitation-platform`)
- **Công nghệ**: Full-stack Next.js, PostgreSQL/Supabase, Zod Validation.
- **Điểm mạnh**:
  - Cấu trúc Data Validation chặt chẽ bằng Zod cho tất cả các Server Actions & API Handlers.
  - Quản lý media chuẩn hóa với Supabase Storage: phân tách folder theo `invitationId/cover`, `invitationId/gallery`.
  - Tích hợp Moderation cho Sổ lời chúc (`is_visible` flag: VISIBLE / HIDDEN).
- **Bài học ứng dụng**:
  - Luôn kiểm tra quyền truy cập (Server-side authorization) trước khi cho phép tạo, sửa, xóa thiệp hoặc lời chúc.
  - Validate file upload chặt chẽ (định dạng ảnh, dung lượng tối đa).

### 1.5. wedding- (`C:\thiepcuoi\reference-projects\wedding-`)
- **Công nghệ**: Architecture tách biệt Frontend/Backend (Docker support).
- **Điểm mạnh**:
  - Phân hệ Admin quản trị hệ thống (User management, Template management, Category management).
  - Timeline câu chuyện tình yêu (Story Section) thiết kế đẹp mắt dạng trục thời gian dọc.
- **Bài học ứng dụng**:
  - Cần tích hợp Phân quyền Role (`USER`, `ADMIN`) ở mức Server Middleware & Database RLS.

---

## 2. Kiến trúc & Pattern Đề xuất cho Nhà Có Tiệc

1. **Invitation Engine**:
   - Sử dụng một component duy nhất `InvitationRenderer` nhận `invitation`, `template`, `theme`, `sections` và `guest` làm props để render giao diện thiệp public động.
2. **Editor Panel**:
   - Thiết kế Editor 2 panel trên Desktop (Bên trái: Tab chỉnh sửa thông tin, theme, danh mục section; Bên phải: Live preview thiệp).
3. **Bảo mật RLS & Server Validation**:
   - Áp dụng triệt để Row Level Security trong PostgreSQL/Supabase.
   - Luôn validate input ở cả Client (Zod) và Server Handlers.
