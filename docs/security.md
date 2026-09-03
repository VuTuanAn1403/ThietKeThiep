# CHÍNH SÁCH BẢO MẬT & TIÊU CHUẨN AN TOÀN
## DỰ ÁN: NHÀ CÓ TIỆC

---

## 1. MÔ HÌNH BẢO MẬT ĐA TẦNG (MULTI-TIER DEFENSE)

1. **Edge Middleware (`middleware.ts`):** Chặn các request không hợp lệ ngay tại tầng Network/Edge trước khi render server-side components.
2. **Server-Side Authorization (`lib/auth/server-auth.ts`):** Đối chiếu quyền hạn người dùng với cơ sở dữ liệu thật, không bao giờ tin cậy cookie client làm thẩm quyền duy nhất.
3. **Phân Lập Quyền Sở Hữu (Ownership Isolation):** Ngăn chặn người dùng A can thiệp hoặc xem dữ liệu của người dùng B.
4. **Row Level Security (RLS) trên Supabase:** Chính sách bảo mật cấp dòng dữ liệu trong PostgreSQL.
5. **Kiểm Soát Tải Lên & Input Validation:** Kiểm duyệt định dạng ảnh (JPEG, PNG, WebP) và dung lượng tệp tối đa 5MB.
6. **Không Rò Rỉ Bí Mật (Secret Safety):** Không đưa khóa `SERVICE_ROLE_KEY` hay thông tin nhạy cảm vào client bundle hoặc mã nguồn repository.
