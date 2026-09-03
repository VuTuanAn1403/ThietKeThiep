# CHIẾN LƯỢC SAO LƯU VÀ PHỤC HỒI DỮ LIỆU (BACKUP & RECOVERY STRATEGY)
## DỰ ÁN: NHÀ CÓ TIỆC

> **Workspace:** `C:\thiepcuoi\nha-co-tiec`  
> **Phiên bản:** Production 1.0  
> **Đối tượng áp dụng:** Cơ sở dữ liệu PostgreSQL (Supabase), Supabase Storage & Cấu hình môi trường.  

---

## 1. PHẠM VI VÀ DỮ LIỆU CẦN SAO LƯU

1. **Cơ sở dữ liệu chính (PostgreSQL Database):**
   - Tài khoản người dùng (`users`, `user_subscriptions`, `subscription_plans`).
   - Mẫu thiệp & danh mục (`templates`, `categories`).
   - Dữ liệu thiệp mời (`invitations`, `invitation_sections`, `gallery_images`, `story_items`, `gifts`).
   - Dữ liệu tương tác khách mời (`guests`, `rsvps`, `wishes`, `signatures`, `invitation_views`).
   - Hệ thống phản hồi & vận hành (`feedback`, `notifications`, `audit_logs`).
2. **Kho lưu trữ tệp tin (Supabase Storage Buckets):**
   - Bucket `invitation-gallery`: Ảnh kỷ niệm, album cưới của người dùng.
   - Bucket `signatures`: Ảnh chụp hoặc chữ ký số vẽ tay.
   - Bucket `avatars`: Ảnh đại diện của cô dâu, chú rể và khách mời.
   - Bucket `music`: Nhạc nền MP3 sự kiện.
3. **Biến môi trường & Khóa bí mật (`.env.production`):**
   - `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `TURNSTILE_SECRET_KEY`, `SENTRY_DSN`.

---

## 2. QUY TRÌNH SAO LƯU CƠ SỞ DỮ LIỆU (DATABASE BACKUP)

### 2.1. Sao lưu tự động qua Supabase Dashboard (Khuyến nghị)
* Supabase tự động kích hoạt chế độ **Daily Automated Backups** (Lưu giữ 7 ngày cho gói Pro/Team hoặc Point-in-Time Recovery - PITR).
* Kiểm tra lịch sao lưu tại: *Project Settings ➔ Database ➔ Backups*.

### 2.2. Sao lưu thủ công qua dòng lệnh (CLI / pg_dump)
Sử dụng công cụ `pg_dump` để xuất bản sao lưu dạng nén (Custom format) hoặc tệp plain SQL:

```bash
# 1. Xuất toàn bộ cấu trúc và dữ liệu thành tệp SQL nén
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:5432/postgres" \
  --format=custom \
  --file="nhacotiec_backup_$(date +%Y%m%d_%H%M%S).dump"

# 2. Hoặc xuất tệp plain text SQL
pg_dump "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:5432/postgres" \
  --clean \
  --if-exists \
  --file="nhacotiec_backup_$(date +%Y%m%d).sql"
```

---

## 3. QUY TRÌNH SAO LƯU TỆP TIN (STORAGE BACKUP)

* **Phương pháp 1:** Sử dụng Supabase CLI hoặc S3-compatible API để đồng bộ bucket về máy chủ lưu trữ phụ:
```bash
# Đồng bộ bucket invitation-gallery về thư mục backup
aws s3 sync s3://[PROJECT-ID]/invitation-gallery ./backups/storage/invitation-gallery \
  --endpoint-url https://[PROJECT-ID].supabase.co/storage/v1/s3 \
  --profile supabase
```
* **Phương pháp 2:** Tải định kỳ tệp nén snapshot từ kho chứa.

---

## 4. QUY TRÌNH PHỤC HỒI DỮ LIỆU (RESTORE PROCEDURE)

### 4.1. Phục hồi Cơ sở dữ liệu từ tệp Backup Dump
```bash
# 1. Dừng tạm thời các kết nối ứng dụng hoặc chuyển sang Maintenance Mode
# 2. Khôi phục cơ sở dữ liệu bằng pg_restore
pg_restore --clean --if-exists \
  --dbname="postgresql://postgres:[YOUR-PASSWORD]@[YOUR-DB-HOST]:5432/postgres" \
  "nhacotiec_backup_20260903.dump"
```

### 4.2. Khôi phục Storage Buckets
```bash
# Đồng bộ ngược từ bản backup lên Supabase Storage
aws s3 sync ./backups/storage/invitation-gallery s3://[PROJECT-ID]/invitation-gallery \
  --endpoint-url https://[PROJECT-ID].supabase.co/storage/v1/s3 \
  --profile supabase
```

---

## 5. ĐÁNH GIÁ TÁC ĐỘNG SỰ CỐ (DISASTER IMPACT ANALYSIS)

| Tình huống sự cố | Tác động cụ thể | Kế hoạch ứng phó & Khôi phục |
|---|---|---|
| **Mất Database (Database Loss)** | Mọi thông tin tài khoản, danh sách khách mời và cấu hình thiệp bị mất. | Kích hoạt PITR (Point-in-Time Recovery) trên Supabase hoặc khôi phục bản `pg_dump` gần nhất (RPO: tối đa 24h, RTO: dưới 30 phút). |
| **Mất Storage (Storage Files Loss)** | Ảnh album cưới và chữ ký khách mời bị lỗi hiển thị (404). Database vẫn nguyên vẹn. | Đồng bộ lại các tệp từ S3 snapshot backup. Các thiệp vẫn hoạt động bình thường về thông tin chữ và RSVP. |
| **Lộ Khóa API / Service Role Key** | Kẻ xấu có thể can thiệp dữ liệu bỏ qua RLS. | Đổi (Rotate) ngay `SUPABASE_SERVICE_ROLE_KEY` và `JWT Secret` trên Supabase Console, cập nhật `.env` và redeploy ứng dụng. |

---

## 6. TẦN SUẤT SAO LƯU KHUYẾN NGHỊ

1. **Cơ sở dữ liệu (Database):**
   - Snapshot tự động: **Mỗi 24 giờ một lần** (02:00 sáng hàng ngày).
   - Snapshot thủ công: **Trước mỗi lần chạy migration lớn hoặc nâng cấp version**.
2. **Storage Files:**
   - Đồng bộ gia tăng (Incremental Sync): **Hàng tuần**.
3. **Biến môi trường (Environment Config):**
   - Lưu trữ an toàn trong trình quản lý bảo mật (Vercel Environment Variables / Vault / 1Password) có kiểm soát phiên bản.
