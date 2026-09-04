# HƯỚNG DẪN GIÁM SÁT PRODUCTION & CẢNH BÁO LỖI (MONITORING & ALERTING 2026)
## HỆ THỐNG: NHÀ CÓ TIỆC — ONLINE INVITATION PLATFORM

> **Repository:** `https://github.com/VuTuanAn1403/ThietKeThiep`  
> **Production:** `https://thiet-ke-thiep.vercel.app/`  
> **Năm ban hành:** 2026  
> **Mục tiêu:** Phát hiện chủ động, cảnh báo tức thì, truy vết chính xác mọi bất thường trong hệ thống mà không làm gián đoạn trải nghiệm của khách hàng.  

---

## 1. KIẾN TRÚC GIÁM SÁT SENTRY (SENTRY ARCHITECTURE)

```text
Trình duyệt Người dùng / Khách mời
          │ (Error Boundary / Uncaught Exception)
          ▼
   Next.js Client / Server Runtime
          │
          │  Gắn kết: x-request-id, Route, Method, Minimal userId
          │  Khử nhạy cảm: sanitizeData() loại bỏ password, tokens, keys
          ▼
   ErrorMonitoring (`lib/monitoring/sentry.ts`)
          │
          │  HTTP Store API (Sentry Protocol v7)
          ▼
   Sentry Monitoring Cloud Dashboard
          │
          ▼
   Kênh cảnh báo (Slack / Email / On-call Pager)
```

### 1.1. Cấu hình DSN và Môi trường
* **Biến môi trường:** `SENTRY_DSN` hoặc `NEXT_PUBLIC_SENTRY_DSN`.
* **Cơ chế an toàn:** Nếu DSN không được cung cấp hoặc chứa chuỗi `placeholder`, module tự động chuyển sang chế độ an toàn (Safe fallback), không bao giờ làm gián đoạn hoặc crash luồng thực thi chính của ứng dụng.

---

## 2. PHÂN LOẠI LỖI CHUẨN HÓA (ERROR CLASSIFICATION TAXONOMY)

Mọi sự cố ghi nhận vào hệ thống đều được gán nhãn chính xác theo 7 nhóm chuẩn:
1. `INTERNAL_SERVER_ERROR`: Ngoại lệ không lường trước ở tầng máy chủ (500 Internal Server Error).
2. `DATABASE_ERROR`: Lỗi kết nối, truy vấn hoặc vi phạm ràng buộc dữ liệu PostgreSQL.
3. `AUTH_ERROR`: Lỗi phiên làm việc, hết hạn token, đăng nhập sai nhiều lần.
4. `OAUTH_ERROR`: Sự cố trong luồng xác thực Google OAuth hoặc xử lý callback.
5. `STORAGE_ERROR`: Lỗi tải lên, tải xuống hoặc thiếu tệp tin media trong Supabase Storage.
6. `PAYMENT_ERROR`: Lỗi tạo mã VietQR, xác thực giao dịch hoặc kích hoạt gói dịch vụ.
7. `UNEXPECTED_CLIENT_ERROR`: Lỗi giao diện người dùng, rendering exceptions bắt được tại các Error Boundary.

---

## 3. HỆ THỐNG PHÒNG VỆ RỦI RO GIAO DIỆN (ERROR BOUNDARIES)

Hệ thống triển khai các Error Boundary chuyên biệt tại tất cả các khu vực trọng yếu:
* **Gốc ứng dụng (`app/error.tsx`):** Bắt các sự cố chung toàn ứng dụng, hiển thị giao diện nhã nhặn, có nút "Thử lại" và "Trang chủ".
* **Ứng dụng khẩn cấp (`app/global-error.tsx`):** Bắt các lỗi crash sâu ở tầng Root Layout.
* **Trang thiệp công khai (`app/i/[slug]/error.tsx`):** Bảo vệ trải nghiệm của khách mời; khi thiệp gặp lỗi rendering, hiển thị thông báo trang trọng, giữ trọn vẹn sự tinh tế cho sự kiện cưới.
* **Khu vực Quản trị (`app/admin/error.tsx`):** Cách ly lỗi trong Admin Control Center, không ảnh hưởng đến người dùng phổ thông.
* **Khu vực Dashboard (`app/dashboard/error.tsx`):** Bảo vệ phiên làm việc của chủ tiệc khi chỉnh sửa thiệp.

---

## 4. TRUY VẾT YÊU CẦU ĐỒNG BỘ (REQUEST CORRELATION)

Mọi request gửi tới hệ thống đều được gán một mã định danh duy nhất:
```text
Browser Client Request
       ↓
Edge Middleware (`middleware.ts`)
       ↓ Phát sinh x-request-id (UUID v4) nếu chưa có
API Route Handler
       ↓ Đọc x-request-id và đính kèm vào ErrorContext
ErrorMonitoring.captureException(..., { requestId })
       ↓
Response Headers: `x-request-id: <uuid>`
```
Khi người dùng thông báo sự cố kèm mã lỗi (digest / request_id), đội ngũ hỗ trợ kỹ thuật có thể tra cứu chính xác sự kiện lỗi duy nhất trên Sentry.

---

## 5. KIỂM TRA SỨC KHỎE HỆ THỐNG (`/api/health`)

Endpoint `/api/health` thực hiện kiểm tra thực tế tới các thành phần phụ thuộc:
* **Phương thức:** `GET`
* **Tiêu đề phản hồi:** `Cache-Control: no-store, no-cache, must-revalidate`
* **Mã trạng thái:**
  - `200 OK`: Toàn bộ các dịch vụ vận hành bình thường.
  - `503 Service Unavailable`: Dịch vụ cơ sở dữ liệu hoặc xác thực gặp sự cố nghiêm trọng.
* **Cấu trúc dữ liệu an toàn:**
```json
{
  "status": "healthy",
  "timestamp": "2026-09-04T14:40:00.000Z",
  "uptime": 1450,
  "responseTimeMs": 12,
  "version": "1.0.0",
  "services": {
    "database": "operational",
    "auth": "operational",
    "storage": "operational"
  }
}
```

---

## 6. THIẾT LẬP CẢNH BÁO TỰ ĐỘNG (ALERTING RULES)

| Loại cảnh báo | Ngưỡng kích hoạt (Threshold) | Mức độ nghiêm trọng | Kênh nhận |
|---|---|---|---|
| **500 Server Error Spike** | > 10 lỗi trong 5 phút | P1 - CRITICAL | Telegram / PagerDuty |
| **Database Failure Spike** | > 5 lỗi trong 3 phút | P1 - CRITICAL | Telegram / Email SRE |
| **Payment Activation Error**| > 2 lỗi trong 15 phút | P2 - HIGH | Slack #payments |
| **OAuth Failure Spike** | > 5 lỗi trong 10 phút | P2 - HIGH | Slack #security |
| **Storage 404 / Upload Fail**| > 10 lỗi trong 15 phút | P3 - MEDIUM | Slack #ops |
| **Health Check Degraded** | 2 lần kiểm tra liên tiếp trả về 503 | P1 - CRITICAL | SMS / PagerDuty |
