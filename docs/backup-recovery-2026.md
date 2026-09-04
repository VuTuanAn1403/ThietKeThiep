# CHIẾN LƯỢC SAO LƯU & PHỤC HỒI DỮ LIỆU (BACKUP & RECOVERY STRATEGY 2026)
## HỆ THỐNG: NHÀ CÓ TIỆC — ONLINE INVITATION PLATFORM

> **Repository:** `https://github.com/VuTuanAn1403/ThietKeThiep`  
> **Production:** `https://thiet-ke-thiep.vercel.app/`  
> **Năm ban hành:** 2026  
> **Phạm vi:** PostgreSQL (Supabase), Supabase Storage Buckets, Cấu hình môi trường.  

---

## 1. PHẠM VI SAO LƯU (BACKUP SCOPE)

### 1.1. Cơ sở dữ liệu (PostgreSQL Database)
Toàn bộ 19 bảng ứng dụng cốt lõi được bảo toàn cấu trúc quan hệ, khóa ngoại (FK), khóa chính UUID và timestamp:
1. `users`: Hồ sơ người dùng, phân quyền (USER / ADMIN), trạng thái tài khoản.
2. `invitation_categories`: Danh mục sự kiện (Cưới, Sinh nhật, Tân gia, Kỷ niệm, v.v.).
3. `templates`: Mẫu thiệp mời, theme configuration JSONB, default sections.
4. `invitations`: Thông tin chi tiết thiệp mời, ngày giờ, địa điểm, tọa độ bản đồ, slug định danh.
5. `invitation_sections`: Các section nội dung động (Hero, Story, Countdown, Event, Gallery, Map, RSVP, Guestbook).
6. `story_items`: Dòng thời gian câu chuyện tình yêu / kỷ niệm của chủ tiệc.
7. `gallery_images`: Danh mục ảnh album cưới và ảnh sự kiện.
8. `guests`: Danh sách khách mời cá nhân hóa, mã slug riêng, nhóm khách mời.
9. `rsvps`: Lịch sử phản hồi tham dự (Attending, Not attending, số khách đi kèm, ghi chú).
10. `wishes`: Lời chúc mừng và lời nhắn gửi của khách.
11. `invitation_views`: Lịch sử lượt xem, phiên truy cập phục vụ phân tích (Analytics).
12. `gifts`: Thông tin số tài khoản ngân hàng, mã QR mừng cưới.
13. `signatures`: Chữ ký điện tử và lưu bút vẽ tay.
14. `feedback`: Góp ý, đánh giá và báo lỗi từ người dùng.
15. `subscription_plans`: Các gói dịch vụ (FREE, BASIC, PREMIUM) và hạn mức.
16. `user_subscriptions`: Trạng thái gói dịch vụ của từng người dùng.
17. `notifications`: Thông báo hệ thống gửi đến người dùng.
18. `audit_logs`: Nhật ký kiểm toán bảo mật và hành động của quản trị viên.
19. `payment_orders`: Đơn hàng thanh toán QR VietQR, trạng thái kích hoạt dịch vụ.

### 1.2. Kho lưu trữ tệp tin (Supabase Storage Buckets)
* **Bucket chính:** `invitation-assets`
* **Nội dung sao lưu:**
  - Ảnh đại diện cô dâu, chú rể, ảnh bìa sự kiện.
  - Album ảnh thư viện (Gallery) chất lượng cao.
  - Tệp ảnh chữ ký số vẽ tay của khách mời.
  - Mã QR thanh toán mừng cưới.
* **Thuộc tính bảo toàn:** Bucket name, Object path, File size, MIME type (image/jpeg, image/png, image/webp), SHA-256 binary hash, Public/Private accessibility.

---

## 2. TẦN SUẤT SAO LƯU (FREQUENCY)

| Loại dữ liệu | Phương thức sao lưu | Tần suất | Thời điểm thực thi |
|---|---|---|---|
| **Database Snapshots** | Automated Export / WAL PITR | **Hàng ngày (Daily)** | 02:00 UTC (09:00 AM VN) |
| **Point-in-Time Recovery (PITR)** | Supabase Managed Continuous WAL | **Liên tục** | RPO đến từng giây (Gói Pro/Team) |
| **Storage Sync** | Automated Storage Manifest Export | **Hàng ngày** | 02:30 UTC |
| **Manual Pre-migration Backup** | CLI script (`npm run backup`) | **Mỗi đợt release/migration** | Trước khi deploy schema mới |

---

## 3. THỜI GIAN LƯU GIỮ (RETENTION POLICY)

* **Daily Backups:** Lưu giữ trong vòng **30 ngày**.
* **Weekly Backups:** Lưu giữ bản snapshot ngày Chủ nhật trong vòng **90 ngày**.
* **Monthly Backups:** Lưu giữ bản snapshot đầu tháng trong vòng **365 ngày (1 năm)**.
* **Cơ chế dọn dẹp:** Tự động hủy (Prune) các bản sao lưu hết hạn theo lifecycle rule, mã hóa toàn bộ dữ liệu lưu trữ tĩnh (Encryption at Rest - AES-256).

---

## 4. VỊ TRÍ LƯU TRỮ (STORAGE LOCATION)

* **Phân vùng lưu trữ an toàn:** Lưu trữ độc lập trên Cloud Object Storage riêng biệt (khác Region với Production Database).
* **Bảo mật tuyệt đối:**
  - KHÔNG BAO GIỜ commit bản sao lưu vào kho Git (đã cấu hình chặn tại `.gitignore`).
  - KHÔNG BAO GIỜ đặt file backup trong thư mục `public/` của web server.
  - Truy cập thông qua IAM Role và Signed URL có thời hạn, không cấp quyền công khai (No Public Access).

---

## 5. MỤC TIÊU PHỤC HỒI THỰC TẾ (RECOVERY OBJECTIVES)

* **RPO (Recovery Point Objective):**
  - Sử dụng Daily Automated Backup: **<= 24 giờ**.
  - Sử dụng Continuous PITR (Supabase): **<= 5 phút**.
* **RTO (Recovery Time Objective):**
  - Khôi phục Database toàn bộ 19 bảng: **<= 15 phút**.
  - Khôi phục Storage Media: **<= 15 phút**.
  - Tổng thời gian phục hồi hoàn tất dịch vụ: **<= 30 phút**.

---

## 6. LỆNH VẬN HÀNH DÀNH CHO KỸ THUẬT VIÊN

### 6.1. Thực hiện sao lưu thủ công
```bash
npm run backup
```
Lệnh sẽ tự động:
1. Trích xuất 19 bảng Database và tính toán mã băm SHA-256.
2. Trích xuất toàn bộ Storage Objects và tạo manifest chi tiết.
3. Kiểm tra tính toàn vẹn (Integrity Check) trước khi xác nhận thành công.

### 6.2. Kiểm chứng phục hồi định kỳ (Restore Drill)
```bash
npm run restore:drill
```
Lệnh thực hiện giả lập khôi phục vào môi trường kiểm thử (Staging/Recovery) và tự động xác minh 11 chỉ tiêu chất lượng.
