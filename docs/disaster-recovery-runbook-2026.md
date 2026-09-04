# SỔ TAY ỨNG PHÓ SỰ CỐ & PHỤC HỒI THẢM HỌA (DISASTER RECOVERY RUNBOOK 2026)
## HỆ THỐNG: NHÀ CÓ TIỆC — ONLINE INVITATION PLATFORM

> **Áp dụng:** Đội ngũ Kỹ thuật & Quản trị Vận hành (SRE / DevOps / On-call)  
> **Cập nhật:** 2026  
> **Quy tắc cốt lõi:** KHÔNG phục hồi trực tiếp vào Production khi chưa qua Staging Drill.  

---

## PHẦN I: QUY TRÌNH PHỤC HỒI CHUẨN 19 BƯỚC (19-STEP DISASTER RECOVERY WORKFLOW)

```text
Sự cố phát hiện
      ↓
[Bước 1 - 3] Đánh giá & Phong tỏa
      ↓
[Bước 4 - 7] Chuẩn bị Backup & Khôi phục Hạ tầng
      ↓
[Bước 8 - 16] Xác minh toàn vẹn 11 Thực thể & RLS
      ↓
[Bước 17 - 19] Smoke Test, Mở lại dịch vụ & Hậu kiểm
```

1. **Bước 1: Phát hiện sự cố (Detect Incident)**:
   - Tiếp nhận cảnh báo từ Sentry (Alert), Health Check `/api/health` trả về 503, hoặc phản ánh từ người dùng.
2. **Bước 2: Đánh giá mức độ ảnh hưởng (Assess Impact)**:
   - Xác định phạm vi: Database, Storage, Auth, Thanh toán, hay toàn bộ hệ thống.
3. **Bước 3: Đóng băng đột biến dữ liệu nguy hiểm (Freeze Dangerous Mutations)**:
   - Nếu phát hiện dữ liệu đang bị hỏng hoặc tấn công, kích hoạt chế độ Maintenance Mode trên Vercel / Edge Middleware để chặn các request ghi (`POST`, `PUT`, `DELETE`, `PATCH`).
4. **Bước 4: Xác định bản sao lưu hợp lệ gần nhất (Identify Latest Valid Backup)**:
   - Kiểm tra mã băm SHA-256 của bản snapshot cơ sở dữ liệu và storage manifest trong kho lưu trữ bảo mật.
5. **Bước 5: Khởi tạo môi trường phục hồi (Create Recovery Environment)**:
   - Triển khai một cơ sở dữ liệu Staging/Recovery cô lập, tách biệt hoàn toàn với Production.
6. **Bước 6: Khôi phục Cơ sở dữ liệu (Restore DB)**:
   - Nạp dữ liệu theo đúng thứ tự ràng buộc khóa ngoại (Foreign Key sequence) để không gây lỗi integrity.
7. **Bước 7: Khôi phục Kho lưu trữ tệp tin (Restore Storage)**:
   - Đồng bộ lại các tệp tin hình ảnh, album cưới, avatar về đúng bucket `invitation-assets`.
8. **Bước 8: Xác minh Cấu trúc Schema & Dữ liệu (Verify Schema & Tables)**:
   - Đối chiếu số lượng bảng (19 bảng) và tổng số dòng dữ liệu (Row count) so với bản backup.
9. **Bước 9: Xác minh Cơ chế bảo mật hàng (Verify RLS)**:
   - Kiểm tra chính sách Row Level Security: Người dùng A chỉ xem được dữ liệu của A; Người dùng không được truy cập dữ liệu quản trị.
10. **Bước 10: Xác minh Xác thực (Verify Auth)**:
    - Kiểm tra đăng nhập tài khoản email/mật khẩu và Google OAuth.
11. **Bước 11: Xác minh Thiệp mời (Verify Invitations)**:
    - Truy cập trang công khai `/i/[slug]`, kiểm tra giao diện thiệp, ngày giờ, địa điểm và các section.
12. **Bước 12: Xác minh Khách mời (Verify Guests)**:
    - Kiểm tra danh sách khách mời, đường dẫn cá nhân hóa của từng khách.
13. **Bước 13: Xác minh Phản hồi tham dự (Verify RSVP)**:
    - Kiểm tra trạng thái tham dự, số lượng khách xác nhận, biểu đồ phản hồi.
14. **Bước 14: Xác minh Lời chúc (Verify Wishes)**:
    - Kiểm tra sổ lưu bút và danh sách lời chúc hiển thị trên thiệp.
15. **Bước 15: Xác minh Thống kê (Verify Analytics)**:
    - Kiểm tra lượt xem (views) và chỉ số tương tác không bị mất mát.
16. **Bước 16: Xác minh Thanh toán (Verify Payments)**:
    - Kiểm tra các đơn hàng thanh toán đã hoàn tất và trạng thái gói dịch vụ của người dùng.
17. **Bước 17: Kiểm thử khói (Smoke Test)**:
    - Kỹ thuật viên tạo thử 1 thiệp mẫu và gửi 1 lời chúc thử nghiệm trên môi trường phục hồi.
18. **Bước 18: Chuyển hướng lưu lượng & Mở lại dịch vụ (Resume Service)**:
    - Đổi chuỗi kết nối DNS/Connection String sang cơ sở dữ liệu đã phục hồi sạch, dỡ bỏ Maintenance Mode.
19. **Bước 19: Đánh giá sau sự cố (Post-Incident Review - PIR)**:
    - Lập biên bản sự cố, phân tích nguyên nhân gốc rễ (Root Cause Analysis), bổ sung biện pháp phòng ngừa vào tài liệu.

---

## PHẦN II: 6 KỊCH BẢN THẢM HỌA THỰC TẾ (6 DISASTER SCENARIOS)

### KỊCH BẢN 1: HỎNG CƠ SỞ DỮ LIỆU (DATABASE CORRUPTION)
* **Phát hiện (Detection):** Sentry báo lỗi `DATABASE_ERROR` tăng vọt; Endpoint `/api/health` trả về `services.database: unavailable`.
* **Tác động (Impact):** Người dùng không thể đăng nhập, không tạo được thiệp, khách không mở được thiệp.
* **Quy trình phục hồi (Recovery):**
  1. Ngắt kết nối ứng dụng tạm thời để tránh ghi đè dữ liệu hỏng.
  2. Kích hoạt Point-in-Time Recovery (PITR) về thời điểm 5 phút trước khi sự cố xảy ra.
  3. Nếu PITR không khả dụng, sử dụng bản snapshot gần nhất và chạy `npm run restore:drill`.
* **Xác minh (Verification):** Chạy `npm test` và kiểm tra phản hồi `/api/health` đạt trạng thái `healthy`.

---

### KỊCH BẢN 2: XÓA NHẦM BẢN GHI DỮ LIỆU (ACCIDENTAL RECORD DELETION)
* **Phát hiện (Detection):** Khách hàng phản ánh bị mất thiệp mời hoặc danh sách khách; Audit log ghi nhận lệnh `DELETE` bất thường.
* **Tác động (Impact):** Mất thiệp cưới đang gửi cho khách mời hoặc mất danh sách RSVP.
* **Quy trình phục hồi (Recovery):**
  1. Không rollback toàn bộ database (sẽ làm mất dữ liệu của các người dùng khác).
  2. Trích xuất bản ghi bị xóa từ bản sao lưu JSON gần nhất (`database.backup.json`).
  3. Thực hiện lệnh `INSERT ... ON CONFLICT DO NOTHING` có kiểm soát để khôi phục chính xác các dòng bị mất theo đúng UUID cũ.
* **Xác minh (Verification):** Người dùng truy cập lại dashboard, kiểm tra thiệp mời và danh sách khách nguyên vẹn.

---

### KỊCH BẢN 3: MẤT ĐỐI TƯỢNG MEDIA TRONG KHO LƯU TRỮ (STORAGE OBJECT DELETION)
* **Phát hiện (Detection):** Ảnh thiệp cưới trả về mã lỗi HTTP 404; Sentry ghi nhận `STORAGE_ERROR`.
* **Tác động (Impact):** Thiệp vẫn mở được chữ nhưng ảnh bìa, album gallery và mã QR bị lỗi hiển thị.
* **Quy trình phục hồi (Recovery):**
  1. Sử dụng tệp sao lưu `storage.backup.json` gần nhất.
  2. Nạp lại các file ảnh bị thiếu theo đúng đường dẫn `invitation-assets/[invitationId]/...`.
* **Xác minh (Verification):** Mở trang thiệp công khai trên trình duyệt và kiểm tra toàn bộ ảnh hiển thị sắc nét.

---

### KỊCH BẢN 4: TRIỂN KHAI PHẦN MỀM LỖI (APPLICATION DEPLOYMENT FAILURE)
* **Phát hiện (Detection):** Lỗi Build trên Vercel hoặc lỗi 500 xuất hiện ngay sau khi Release bản mới.
* **Tác động (Impact):** Giao diện bị vỡ, hydration error, hoặc người dùng gặp màn hình báo lỗi.
* **Quy trình phục hồi (Recovery):**
  1. Sử dụng tính năng **Instant Rollback** trên Vercel Dashboard quay về bản Deployment ổn định trước đó (dưới 60 giây).
  2. Đội ngũ kỹ thuật tái hiện lỗi ở môi trường local, sửa lỗi và kiểm tra qua `npm run build` trước khi redeploy.
* **Xác minh (Verification):** Trang chủ và trang dashboard hoạt động mượt mà.

---

### KỊCH BẢN 5: SỰ CỐ DỊCH VỤ HẠ TẦNG SUPABASE (SUPABASE OUTAGE)
* **Phát hiện (Detection):** Bảng trạng thái status.supabase.com báo sự cố hoặc toàn bộ API Supabase timeout.
* **Tác động (Impact):** Ứng dụng không thể kết nối tới cơ sở dữ liệu đám mây.
* **Quy trình phục hồi (Recovery):**
  1. Kích hoạt thông báo bảo trì thanh lịch (Graceful Maintenance Page) cho người dùng.
  2. Nếu sự cố kéo dài quá cam kết SLA (> 2 giờ), dựng PostgreSQL replica trên hạ tầng dự phòng và khôi phục từ snapshot gần nhất.
* **Xác minh (Verification):** Kiểm tra `/api/health` sau khi chuyển đổi kết nối thành công.

---

### KỊCH BẢN 6: SỰ CỐ CỔNG THANH TOÁN (PAYMENT PROVIDER OUTAGE)
* **Phát hiện (Detection):** Sentry ghi nhận `PAYMENT_ERROR`; người dùng chuyển khoản nhưng đơn hàng không tự kích hoạt.
* **Tác động (Impact):** Gói dịch vụ chưa được nâng cấp tự động.
* **Quy trình phục hồi (Recovery):**
  1. Hệ thống vẫn lưu trữ thông tin đơn hàng ở trạng thái `PENDING`.
  2. Quản trị viên sử dụng trang Admin `/admin/payments` để tra soát sao kê ngân hàng và kích hoạt gói thủ công bằng nút "Kích hoạt đơn hàng" an toàn.
  3. Gửi thông báo tự động xin lỗi và xác nhận cho người dùng.
* **Xác minh (Verification):** Tài khoản người dùng được nâng cấp lên gói dịch vụ tương ứng.
