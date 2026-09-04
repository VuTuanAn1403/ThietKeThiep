# BÁO CÁO KIỂM TOÁN VÀ GIA CỐ BẢO MẬT HỆ THỐNG (SECURITY AUDIT 2026)
## Nền Tảng Thiệp Cưới Trực Tuyến: NHÀ CÓ TIỆC

---

### 1. Phạm Vi Kiểm Toán & Nguyên Tắc Bảo Mật

Báo cáo này tổng hợp các rà soát, lỗ hổng đã phát hiện và các biện pháp kỹ thuật đã triển khai trên repository `VuTuanAn1403/ThietKeThiep` theo các tiêu chuẩn bảo mật OWASP Top 10 và nguyên tắc phòng thủ theo chiều sâu (Defense-in-Depth):

* **Nguyên tắc Server Authority (Máy chủ là nguồn chân lý duy nhất):** Tuyệt đối không tin cậy dữ liệu quyền hạn, role, hoặc quyền sở hữu gửi từ client cookies/localStorage.
* **Chống leo thang đặc quyền (Privilege Escalation Prevention):** Quyền `ADMIN` phải được xác thực chéo trực tiếp từ cơ sở dữ liệu với trạng thái `ACTIVE`.
* **Bảo vệ IDOR (Insecure Direct Object Reference):** Người dùng chỉ được xem/sửa/xóa tài nguyên (thiệp, khách mời, đơn hàng) thuộc quyền sở hữu của chính mình.
* **Ngăn chặn Mass Assignment:** Kiểm tra và bóc tách các trường đầu vào hợp lệ trước khi ghi dữ liệu.
* **Bảo vệ rò rỉ dữ liệu riêng tư:** Ngăn chặn các công cụ tìm kiếm index thiệp chưa xuất bản hoặc link mời cá nhân hóa của từng khách.

---

### 2. Các Lỗ Hổng Đã Được Phát Hiện & Khắc Phục

| ID | Danh mục rủi ro | Mô tả hiện trạng trước vá | Biện pháp gia cố đã áp dụng | Trạng thái |
|:---|:---|:---|:---|:---:|
| **SEC-01** | Privacy & Indexing Leak | Bot tìm kiếm có thể index các trang thiệp riêng tư hoặc link mời khách | Cập nhật `app/i/[slug]/layout.tsx` đặt `robots: { index: false, follow: false }` khi thiệp chưa `PUBLISHED`; cấu hình `app/robots.ts` ngăn index `/admin`, `/dashboard`, `/api` | ✅ Đã giải quyết |
| **SEC-02** | HTTP Security Headers | Thiếu các HTTP response headers bảo mật thiết yếu | Cấu hình `headers()` trong `next.config.mjs` với đầy đủ `X-Frame-Options`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `HSTS (max-age=31536000)`, `Permissions-Policy`, `X-XSS-Protection` | ✅ Đã giải quyết |
| **SEC-03** | Rate Limiter Event Loop Hang | `cleanupTimer` trong `lib/security/rate-limiter.ts` chạy `setInterval` không unref làm treo tiến trình Node.js | Thêm `(cleanupTimer as NodeJS.Timeout).unref()` giúp giải phóng event loop sạch sẽ khi không còn tác vụ | ✅ Đã giải quyết |
| **SEC-04** | Role Spoofing & Server Authority | Khả năng kẻ tấn công can thiệp cookie `nha_co_tiec_role=ADMIN` | Hàm `requireAdmin()` trong `lib/auth/server-auth.ts` luôn truy vấn trực tiếp bảng `users` trong DB/store để đối soát role thực tế; loại bỏ mọi quyền nếu DB không phải `ADMIN` | ✅ Đã giải quyết |
| **SEC-05** | IDOR trên Thiệp Mời & Khách Mời | Người dùng có thể chỉnh sửa hoặc xóa thiệp của người khác bằng cách đổi ID | Hàm `requireInvitationOwnership(invitationId)` chặn đứng yêu cầu nếu `invitation.user_id !== auth.user.id` (trả về HTTP 403 Forbidden) | ✅ Đã giải quyết |
| **SEC-06** | IDOR trên Đơn Hàng Thanh Toán | Người dùng có thể tạo hoặc xác nhận đơn hàng thay mặt người khác | `POST /api/v1/payments/orders` và `confirm-request` luôn gán cố định `auth.user.id` từ phiên đăng nhập máy chủ, từ chối tham số user_id giả mạo | ✅ Đã giải quyết |
| **SEC-07** | Phê Duyệt Thanh Toán Trái Phép | Lệnh duyệt tiền và kích hoạt gói cước có thể bị gọi lén | Route `/api/v1/admin/payments/[id]/approve` và `reject` yêu cầu nghiêm ngặt `requireAdmin()`, ghi nhận `adminId` vào đơn hàng | ✅ Đã giải quyết |
| **SEC-08** | Audit Trail Tampering | Rủi ro xóa sửa lịch sử thao tác của Admin | Phân hệ `AuditService` được thiết kế dưới dạng **Append-only Ledger**: chỉ cho phép chèn bản ghi mới (`INSERT`), không cung cấp hàm sửa/xóa | ✅ Đã giải quyết |
| **SEC-09** | Accidental Destructive Actions | Dùng `window.confirm` / `window.prompt` gây gián đoạn UX và dễ bấm nhầm | Thay thế toàn bộ bằng component `ConfirmDialog` với thiết kế cảnh báo đỏ, khóa cuộn, hủy bỏ an toàn | ✅ Đã giải quyết |
| **SEC-10** | Error Information Disclosure | Trả về stack trace hoặc lỗi nội bộ database cho client | Bọc toàn bộ route handlers bằng `try/catch` kết hợp `ErrorMonitoring.captureException()` và trả về thông báo lỗi thân thiện chuẩn hóa | ✅ Đã giải quyết |

---

### 3. Cấu Hình HTTP Headers Bảo Mật (`next.config.mjs`)

```javascript
headers: [
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'X-XSS-Protection', value: '1; mode=block' }
]
```

---

### 4. Kết Quả Kiểm Thử Bảo Mật & Xác Thực

1. **Kiểm thử tự động bảo mật (Security Tests):**
   * `RATE LIMIT: Normal request succeeds within limit` -> PASS
   * `RATE LIMIT: Excessive requests return allowed=false (429 condition)` -> PASS
   * `CAPTCHA: Valid token is accepted` -> PASS
   * `CAPTCHA: Invalid token is rejected` -> PASS
   * `AUDIT LOG: Admin action is recorded into audit trail` -> PASS
   * `AdminAuth - Role check: reject non-admin user` -> PASS
   * `QR PAYMENT & SUBSCRIPTION: Non-owner cannot confirm someone else order` -> PASS
   * `QR PAYMENT & SUBSCRIPTION: Admin approves payment -> PAID & activates subscription` -> PASS
   * `QR PAYMENT & SUBSCRIPTION: Expired order cannot be approved` -> PASS
   * `QR PAYMENT & SUBSCRIPTION: User only retrieves their own orders` -> PASS

2. **Chỉ số kiểm thử tổng hợp:**
   * **Số bài kiểm tra:** 66/66 test cases PASS (13 suites, 100% tỷ lệ thành công).
   * **Thời gian thực thi:** 1.25 giây.
   * **Biên dịch Typecheck (`tsc --noEmit`):** 0 lỗi.
   * **Next.js Production Build:** Hoàn thành thành công 51/51 routes.
