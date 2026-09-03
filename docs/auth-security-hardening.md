# BÁO CÁO BẢO MẬT & KIẾN TRÚC XÁC THỰC: AUTH SECURITY HARDENING
## DỰ ÁN: NHÀ CÓ TIỆC

> **Workspace:** `C:\thiepcuoi\nha-co-tiec`  
> **Thời gian hoàn tất:** 03/09/2026  
> **Trạng thái:** ✅ AUTH SECURITY HARDENING PASSED  
> **Test Suite:** ✅ 38/38 Tests Passed (10 Suites, 100%)  
> **Typecheck:** ✅ `tsc --noEmit` 0 Lỗi  
> **Production Build:** ✅ 44 Routes Compiled Sạch Sẽ  

---

## 1. PHÂN TÍCH NGUYÊN TẮC BẢO MẬT & SOURCE OF TRUTH

### 1.1. Source of Truth (Nguồn Chân Lý Dữ Liệu)
* **Quyền hạn và danh tính người dùng** được xác thực duy nhất từ **Cơ sở dữ liệu (Supabase Database / Trusted User Store)**.
* **Client Cookies (`nha_co_tiec_role`, `nha_co_tiec_user_id`, `nha_co_tiec_user`)** chỉ đóng vai trò **Session Transport & Client Navigation Hint**, **TUYỆT ĐỐI KHÔNG PHẢI LÀ SECURITY AUTHORITY**.
* Nếu kẻ tấn công giả mạo cookie client bằng cách đặt `nha_co_tiec_role=ADMIN` với tài khoản thường (`usr-demo-01`), Server-side Auth Authority ([`lib/auth/server-auth.ts`](file:///c:/thiepcuoi/nha-co-tiec/lib/auth/server-auth.ts)) và [`AuthService.initFromCookies()`](file:///c:/thiepcuoi/nha-co-tiec/lib/auth/auth-service.ts) sẽ truy vấn cơ sở dữ liệu thật theo `user_id`, lấy vai trò thật (`USER`) và **bác bỏ hoàn toàn vai trò giả mạo `ADMIN`**.

---

## 2. KIẾN TRÚC PHÂN TẦNG BẢO MẬT (MULTI-TIER SECURITY BOUNDARY)

```mermaid
graph TD
    Client[Browser / Client Request] --> EdgeGuard[Tier 1: Next.js Edge Middleware]
    EdgeGuard -->|No Cookie/Invalid| LoginRedirect[Redirect to /login or /admin/login]
    EdgeGuard -->|Cookie Present| ServerLayout[Tier 2: Server/Layout Guard]
    ServerLayout -->|DB Role Check| RoleCheck{Verified Role in DB?}
    RoleCheck -->|Not ADMIN| Denied403[Redirect /403 Forbidden]
    RoleCheck -->|Is ADMIN| AdminConsole[Allow Admin Access]
    Client --> APIEndpoint[Tier 3: REST API v1 Authorization]
    APIEndpoint -->|requireAuth| CheckIdentity[Database Identity Lookup]
    APIEndpoint -->|requireInvitationOwnership| OwnershipCheck{Is Owner or Admin?}
    OwnershipCheck -->|No| Block403[403 Forbidden / 404]
    OwnershipCheck -->|Yes| ExecuteAction[Execute Business Logic]
```

### 🛡️ Tier 1: Next.js Edge Middleware ([`middleware.ts`](file:///c:/thiepcuoi/nha-co-tiec/middleware.ts))
* Chặn mọi truy cập Anonymous vào `/admin` và `/dashboard`.
* Chuyển hướng người dùng chưa đăng nhập về trang login tương ứng (`/admin/login?redirect=...` hoặc `/login?redirect=...`).

### 🛡️ Tier 2: Server & Layout Verification Guard ([`app/admin/layout.tsx`](file:///c:/thiepcuoi/nha-co-tiec/app/admin/layout.tsx))
* Trước khi render bất kỳ màn hình quản trị nào, layout kiểm tra danh tính thật trong cơ sở dữ liệu (`currentUser.role === 'ADMIN'`).
* Ngăn chặn hoàn toàn các nỗ lực vượt qua middleware bằng cách giả mạo request headers.

### 🛡️ Tier 3: REST API Server Authority & Ownership Enforcement ([`lib/auth/server-auth.ts`](file:///c:/thiepcuoi/nha-co-tiec/lib/auth/server-auth.ts))
* `requireAuth()`: Trả về 401 nếu request chưa được xác thực.
* `requireAdmin()`: Trả về 403 nếu vai trò trong database không phải `ADMIN`.
* `requireInvitationOwnership(invitationId)`: Xác minh người dùng đang đăng nhập chính là chủ sở hữu của thiệp mời (hoặc Quản trị viên). **Người dùng A tuyệt đối không thể đọc, cập nhật hay xóa thiệp/khách mời/quà tặng của Người dùng B**.

---

## 3. DANH SÁCH TEST CASES BẢO MẬT (AUTH-SEC SUITE)

| Mã Test | Tên Kịch Bản Kiểm Thử | Mục Đích & Điều Kiện | Kết Quả Thực Tế |
|---|---|---|:---:|
| **AUTH-SEC-01** | **Tampered Role Cookie Prevention** | Người dùng thường sửa cookie `role=ADMIN`. Hệ thống phải tra cứu DB và trả về `role=USER`, từ chối quyền Admin. | ✅ **PASS** |
| **AUTH-SEC-02** | **Cross-User Ownership Isolation** | User A cố ý truy cập và thao tác trên thiệp mời của User B. Hệ thống từ chối quyền sở hữu. | ✅ **PASS** |
| **AUTH-SEC-03** | **Anonymous Dashboard Guard** | Khách chưa đăng nhập vào `/dashboard` bị chuyển hướng về `/login?redirect=%2Fdashboard`. | ✅ **PASS** |
| **AUTH-SEC-04** | **Anonymous Admin Guard** | Khách chưa đăng nhập vào `/admin` bị chuyển hướng về `/admin/login?redirect=%2Fadmin`. | ✅ **PASS** |
| **AUTH-SEC-05** | **User Role Admin Protection** | User đăng nhập vào `/admin` bị chuyển hướng về `/403`. | ✅ **PASS** |
| **AUTH-SEC-06** | **Admin Role Access** | Admin đăng nhập vào `/admin` được cấp quyền truy cập hợp lệ (Status 200). | ✅ **PASS** |
| **AUTH-SEC-07** | **Session Route Persistence** | Session duy trì ổn định qua các bước chuyển trang `/dashboard` ↔ `/` ↔ `/templates`. | ✅ **PASS** |
| **AUTH-SEC-08** | **Session Hard Refresh Persistence** | Session được khôi phục chính xác từ cookie khi tải lại trang (F5/Hard refresh). | ✅ **PASS** |
| **AUTH-SEC-09** | **Explicit Logout Cleanup** | Người dùng bấm Đăng xuất xóa sạch session in-memory và cookies. | ✅ **PASS** |
| **TC-ADMIN-01..05** | **Server-side Middleware Guards** | Kiểm thử ma trận điều hướng phân quyền đầy đủ cho `/admin` và `/admin/users`. | ✅ **PASS** |

---

## 4. DANH SÁCH FILE THAY ĐỔI TRONG ĐỢT HARDENING

1. [`lib/auth/server-auth.ts`](file:///c:/thiepcuoi/nha-co-tiec/lib/auth/server-auth.ts) — **[TẠO MỚI]** Module xác thực Server Authority và kiểm soát quyền sở hữu thiệp.
2. [`lib/auth/auth-service.ts`](file:///c:/thiepcuoi/nha-co-tiec/lib/auth/auth-service.ts) — **[CẬP NHẬT]** Đồng bộ session chống giả mạo cookie, tra cứu database bắt buộc.
3. [`app/admin/layout.tsx`](file:///c:/thiepcuoi/nha-co-tiec/app/admin/layout.tsx) — **[CẬP NHẬT]** Bổ sung tầng kiểm tra quyền Admin từ database trước khi render layout.
4. [`app/api/v1/invitations/route.ts`](file:///c:/thiepcuoi/nha-co-tiec/app/api/v1/invitations/route.ts) — **[CẬP NHẬT]** Bắt buộc xác thực và gán quyền sở hữu theo server session.
5. [`app/api/v1/invitations/[id]/route.ts`](file:///c:/thiepcuoi/nha-co-tiec/app/api/v1/invitations/%5Bid%5D/route.ts) — **[CẬP NHẬT]** Bảo vệ GET/PATCH/DELETE theo quyền sở hữu.
6. [`app/api/v1/invitations/[id]/guests/route.ts`](file:///c:/thiepcuoi/nha-co-tiec/app/api/v1/invitations/%5Bid%5D/guests/route.ts) — **[CẬP NHẬT]** Bảo vệ danh sách khách mời theo quyền sở hữu.
7. [`app/api/v1/invitations/[id]/gifts/route.ts`](file:///c:/thiepcuoi/nha-co-tiec/app/api/v1/invitations/%5Bid%5D/gifts/route.ts) — **[CẬP NHẬT]** Bảo vệ cập nhật thông tin mừng cưới theo quyền sở hữu.
8. [`app/api/v1/invitations/[id]/rsvps/route.ts`](file:///c:/thiepcuoi/nha-co-tiec/app/api/v1/invitations/%5Bid%5D/rsvps/route.ts) — **[CẬP NHẬT]** Bảo vệ dữ liệu thống kê RSVP.
9. [`tests/auth-security.test.ts`](file:///c:/thiepcuoi/nha-co-tiec/tests/auth-security.test.ts) — **[TẠO MỚI]** Bộ test hồi quy bảo mật chống giả mạo cookie và phân lập người dùng.

---

## 5. KẾT LUẬN
Toàn bộ các tiêu chuẩn bảo mật trong yêu cầu **FINAL AUTH SECURITY HARDENING** đã được kiểm tra, xác thực và vượt qua toàn bộ 38 bài kiểm thử tự động, kiểm tra strict typecheck và biên dịch production build thành công 100%.
