# CHÍNH SÁCH GHI NHẬT KÝ HỆ THỐNG (LOGGING POLICY 2026)
## HỆ THỐNG: NHÀ CÓ TIỆC — ONLINE INVITATION PLATFORM

> **Áp dụng cho:** Toàn bộ nhà phát triển, API Handlers, Sentry Error Tracking, Middleware và Console logs.  
> **Mục tiêu:** Đảm bảo khả năng giám sát, truy vết lỗi (Observability) đồng thời tuân thủ nghiêm ngặt chuẩn an toàn bảo mật và quyền riêng tư của khách hàng.  

---

## 1. NGUYÊN TẮC BẤT DI BẤT DỊCH (CORE PRINCIPLES)

1. **Zero Secret Leakage:** Tuyệt đối không bao giờ để lộ mật khẩu, mã khóa bảo mật hoặc thông tin thẻ vào bất kỳ tệp log, hệ thống bên thứ ba, hay phản hồi HTTP nào.
2. **Minimization Principle:** Chỉ thu thập các định danh tối thiểu phục vụ chẩn đoán kỹ thuật (`userId`, `invitationId`), không thu thập thông tin cá nhân dư thừa.
3. **Request Tracing:** Mọi log nghiệp vụ quan trọng đều phải gắn kết với mã định danh truy vết duy nhất `request_id` (`x-request-id`).

---

## 2. PHÂN LOẠI DỮ LIỆU ĐƯỢC PHÉP VÀ CẤM GHI LOG

### 2.1. DỮ LIỆU AN TOÀN ĐƯỢC PHÉP GHI LOG (SAFE TO LOG)
* **Mã truy vết yêu cầu (Request ID):** `x-request-id` (UUID v4 sinh tự động từ Middleware).
* **Đường dẫn & Phương thức:** `route` (ví dụ `/api/v1/invitations`), `method` (`GET`, `POST`, `PUT`, `DELETE`).
* **Mã trạng thái phản hồi:** HTTP Status Code (`200`, `201`, `400`, `401`, `403`, `404`, `429`, `500`).
* **Thời gian xử lý (Latency / Duration):** `durationMs` (phục vụ giám sát hiệu năng).
* **Phân loại lỗi hệ thống (Taxonomy):**
  - `INTERNAL_SERVER_ERROR`
  - `DATABASE_ERROR`
  - `AUTH_ERROR`
  - `OAUTH_ERROR`
  - `STORAGE_ERROR`
  - `PAYMENT_ERROR`
  - `RATE_LIMIT_ERROR`
  - `UNEXPECTED_CLIENT_ERROR`
* **Môi trường thực thi:** `environment` (`production`, `staging`, `development`).
* **Định danh đối tượng kỹ thuật:** `userId` (dạng UUID, không log email/tên nếu không cần thiết), `invitationId`, `templateId`.

---

### 2.2. DANH MỤC CẤM TUYỆT ĐỐI GHI LOG (DO NOT LOG)
* ❌ Mật khẩu & Mật khẩu xác nhận: `password`, `confirmPassword`.
* ❌ Khóa bí mật máy chủ: `SUPABASE_SERVICE_ROLE_KEY`, `JWT Secret`, `TURNSTILE_SECRET_KEY`.
* ❌ Token xác thực người dùng: `accessToken`, `refreshToken`, `session_token`, `sb-access-token`.
* ❌ Tiêu đề xác thực mạng: Toàn bộ header `Authorization: Bearer ...` hoặc nội dung thô của `Cookie`.
* ❌ Bí mật OAuth & Nhà cung cấp: `Google Client Secret`, OAuth authorization codes.
* ❌ Dữ liệu thanh toán nhạy cảm: Số tài khoản đối tác, mã CVV, số thẻ tín dụng hoặc chữ ký số bí mật.
* ❌ Dữ liệu nội dung riêng tư: Nội dung tin nhắn tâm sự riêng tư không liên quan đến sự cố kỹ thuật.

---

## 3. CƠ CHẾ TỰ ĐỘNG LỌC VÀ KHỬ NHẠY CẢM (AUTOMATED REDACTION)

Hệ thống đã tích hợp hàm làm sạch dữ liệu tự động `sanitizeData()` tại `lib/monitoring/sentry.ts`.  
Khi bất kỳ đối tượng ngữ cảnh nào được truyền vào hệ thống giám sát lỗi:
* Mọi khóa nằm trong danh sách `SENSITIVE_KEYS` (bao gồm `password`, `token`, `secret`, `apiKey`, `serviceRoleKey`, `cookie`, `cardNumber`, `cvv`) sẽ tự động được ghi đè bằng giá trị `[REDACTED]`.
* Hàm khử nhạy cảm duyệt đệ quy qua toàn bộ các tầng lồng nhau của đối tượng JSON (Nested objects) để ngăn chặn rò rỉ ngầm.

---

## 4. CHÍNH SÁCH LƯU TRỮ VÀ TIÊU HỦY NHẬT KÝ (LOG RETENTION)

* **Nhật ký lỗi Sentry:** Lưu giữ trong vòng **30 ngày**, tự động xoay vòng và hủy sau thời hạn.
* **Nhật ký truy cập Vercel:** Lưu giữ tối đa **7 ngày** theo gói dịch vụ tiêu chuẩn.
* **Audit Logs trong Cơ sở dữ liệu:** Lưu giữ nhật ký thao tác quản trị viên trong **90 ngày** phục vụ rà soát tuân thủ an toàn thông tin.
