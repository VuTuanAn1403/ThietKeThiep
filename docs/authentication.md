# TÀI LIỆU KIẾN TRÚC XÁC THỰC VÀ PHÂN QUYỀN
## DỰ ÁN: NHÀ CÓ TIỆC

---

## 1. TỔNG QUAN HỆ THỐNG XÁC THỰC

Hệ thống xác thực của Nhà Có Tiệc được thiết kế theo mô hình **Multi-tier Authentication & Authorization**:
1. **Server-side Gatekeeper (Next.js Middleware):** Chặn các request không hợp lệ ngay tại tầng Network/Edge trước khi render server-side components.
2. **Cookie-backed Session Persistence:** Duy trì phiên đăng nhập xuyên suốt các lượt navigation, hard refresh, server render và client render qua cookies bảo mật.
3. **Reactive Client Context (AuthProvider):** Cung cấp state tức thì cho toàn bộ các component giao diện (Avatar, Role badges, Dynamic Navbar).
4. **Dual Auth Backend Support:** Hỗ trợ kết nối trực tiếp với Supabase Auth khi cấu hình production và fallback Standalone Auth cho môi trường phát triển / kiểm thử độc lập.

---

## 2. PHÂN QUYỀN VÀ BẢO VỆ ROUTE

### Ma trận phân quyền (Role Matrix):

| Route / Phân vùng | Anonymous (Khách vãng lai) | USER (Thành viên) | ADMIN (Quản trị viên) |
|---|---|---|---|
| `/` (Homepage) | ✅ Xem công khai | ✅ Xem + Menu Dashboard | ✅ Xem + Menu Admin |
| `/templates`, `/case-studies`, `/faq` | ✅ Xem công khai | ✅ Xem + Menu Dashboard | ✅ Xem + Menu Admin |
| `/i/[slug]` (Thiệp công khai) | ✅ Xem + Gửi RSVP/Lời chúc | ✅ Xem + Gửi RSVP/Lời chúc | ✅ Xem + Gửi RSVP/Lời chúc |
| `/dashboard/*` | ❌ Redirect `/login` | ✅ Toàn quyền quản lý thiệp cá nhân | ✅ Cho phép truy cập |
| `/admin/*` | ❌ Redirect `/admin/login` | ❌ Bị từ chối (Redirect `/403`) | ✅ Toàn quyền quản trị hệ thống |
| `/admin/login` | ✅ Truy cập form đăng nhập | ❌ (Bị từ chối nếu không phải Admin) | ✅ Đăng nhập vào `/admin` |

---

## 3. CÁC LUỒNG XÁC THỰC CHÍNH

### 3.1. Luồng Đăng Nhập Người Dùng (User Login Flow)
1. Người dùng truy cập `/login` (hoặc bị chuyển hướng từ `/dashboard` kèm `?redirect=/dashboard/...`).
2. Nhập Email & Mật khẩu.
3. `AuthService.login()` xác thực với Supabase Auth / Local Store:
   - Ghi cookie phiên `nha_co_tiec_role=USER` (Max-Age 7 ngày, SameSite=Lax).
   - Ghi cookie định danh `nha_co_tiec_user_id` và `nha_co_tiec_user`.
4. Chuyển hướng người dùng tới `/dashboard` (hoặc URL đích trong tham số `redirect`).
5. Khi người dùng bấm logo để về `/`, thanh Header tự động hiển thị Avatar, tên người dùng, nút "Vào Dashboard" và menu "Đăng xuất".

### 3.2. Luồng Đăng Nhập Quản Trị (Admin Login Flow)
1. Truy cập `/admin/login`.
2. Nhập Email & Mật khẩu Quản trị viên.
3. `AuthService.login()` kiểm tra thông tin và xác minh `user.role === 'ADMIN'`:
   - Nếu vai trò là `USER`: Lập tức gọi `AuthService.logout()`, hiển thị thông báo từ chối truy cập và không cấp quyền Admin.
   - Nếu vai trò là `ADMIN`: Ghi cookie `nha_co_tiec_role=ADMIN` và chuyển hướng vào `/admin`.

## 4. BẢO MẬT CHỐNG GIẢ MẠO COOKIE & PHÂN LẬP QUYỀN SỞ HỮU (OWNERSHIP ISOLATION)

### 4.1. Chống leo thang đặc quyền (Privilege Escalation Defense)
* Client Cookie (`nha_co_tiec_role`) chỉ là chỉ dẫn định tuyến cho giao diện, **không bao giờ được tin cậy đơn lẻ trên server**.
* Mọi hành động nhạy cảm trên API và Admin Layout đều gọi qua [`lib/auth/server-auth.ts`](file:///c:/thiepcuoi/nha-co-tiec/lib/auth/server-auth.ts) để đối chiếu `user_id` trực tiếp với bảng `users` trong cơ sở dữ liệu. Nếu người dùng `USER` sửa cookie thành `role=ADMIN`, hệ thống tự động phát hiện sự sai lệch và từ chối cấp quyền.

### 4.2. Phân lập dữ liệu người dùng (Ownership Enforcement)
* Tại tất cả các endpoint quản lý thiệp ([`/api/v1/invitations/*`](file:///c:/thiepcuoi/nha-co-tiec/app/api/v1/invitations)), hàm `requireInvitationOwnership(invitationId)` kiểm tra:
  * Nếu người dùng là `ADMIN`: Cho phép xem/quản lý toàn bộ.
  * Nếu người dùng là `USER`: Bắt buộc `invitation.user_id === user.id`. Nếu không trùng khớp, trả về **403 Forbidden**. Người dùng A không thể can thiệp vào thiệp, khách mời, lời chúc hay mừng cưới của Người dùng B.

### 3.3. Luồng Đăng Xuất An Toàn (Explicit Logout)
1. Người dùng bấm nút "Đăng xuất" trên Dropdown Menu.
2. `AuthService.logout()` kích hoạt:
   - Gửi yêu cầu `signOut` tới Supabase Auth.
   - Xóa bỏ toàn bộ cookie `nha_co_tiec_role`, `nha_co_tiec_user_id`, `nha_co_tiec_user`.
   - Xóa bộ nhớ in-memory `currentUser = null`.
   - Cập nhật reactive state trong `AuthProvider`.
3. Giao diện tức thì chuyển về trạng thái Anonymous.
