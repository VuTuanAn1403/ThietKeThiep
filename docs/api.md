# API & Service Specification — NHÀ CÓ TIỆC

Tài liệu mô tả chi tiết danh sách Service Layer API của hệ thống **Nhà Có Tiệc**.

---

## 1. AuthService (`lib/auth/auth-service.ts`)
- `login(data: LoginInput): Promise<{ user, error }>`: Thực hiện đăng nhập người dùng.
- `register(data: RegisterInput): Promise<{ user, error }>`: Đăng ký tài khoản mới.
- `logout(): Promise<void>`: Đăng xuất người dùng.
- `getCurrentUserSync(): UserProfile | null`: Lấy thông tin user hiện tại.

## 2. InvitationService (`services/invitation.service.ts`)
- `getUserInvitations(userId: string): Promise<Invitation[]>`: Lấy danh sách thiệp của user.
- `getInvitationById(id: string): Promise<Invitation | null>`: Lấy chi tiết thiệp theo ID.
- `getInvitationBySlug(slug: string): Promise<Invitation | null>`: Lấy thiệp công khai theo slug.
- `createInvitation(userId, templateId, categoryId, input): Promise<{ invitation, error }>`: Tạo thiệp mới.
- `updateInvitation(id, updates): Promise<{ invitation, error }>`: Cập nhật thông tin thiệp.
- `publishInvitation(id: string): Promise<{ success, error }>`: Xuất bản thiệp công khai.
- `unpublishInvitation(id: string): Promise<{ success, error }>`: Chuyển thiệp về trạng thái nháp (DRAFT).
- `deleteInvitation(id: string): Promise<boolean>`: Xóa thiệp và toàn bộ dữ liệu liên quan.

## 3. GuestService (`services/guest.service.ts`)
- `getGuests(invitationId, groupName, search): Promise<Guest[]>`: Tìm kiếm và lọc danh sách khách mời.
- `createGuest(invitationId, input): Promise<{ guest, error }>`: Thêm khách mời mới.
- `importCSV(invitationId, csvContent): Promise<ImportResult>`: Nhập danh sách khách hàng loạt từ CSV.
- `generateQRCodeDataUrl(url: string): Promise<string>`: Sinh ảnh Data URL chứa QR code.
- `generatePersonalizedUrl(invitationSlug, guestSlug): string`: Tạo URL cá nhân hóa cho từng khách.

## 4. RSVPService (`services/rsvp.service.ts`)
- `submitRSVP(guestId, input): Promise<{ rsvp, error }>`: Gửi phản hồi tham dự (ATTENDING, NOT_ATTENDING, MAYBE).
- `getInvitationRSVPStats(invitationId): Promise<RSVPStats>`: Thống kê tổng quan tỷ lệ phản hồi.

## 5. WishService (`services/wish.service.ts`)
- `submitWish(invitationId, guestName, message): Promise<Wish>`: Gửi lời chúc mới.
- `getVisibleWishes(invitationId): Promise<Wish[]>`: Lấy các lời chúc được hiển thị trên thiệp public.
- `toggleVisibility(wishId): Promise<Wish | null>`: Ẩn/hiện lời chúc (Moderation).
- `deleteWish(wishId): Promise<boolean>`: Xóa lời chúc.

## 6. AnalyticsService (`services/analytics.service.ts`)
- `getUserOverviewMetrics(userId): Promise<OverviewMetrics>`: Thống kê tổng quan cho Dashboard.
- `getInvitationAnalytics(invitationId): Promise<InvitationAnalytics>`: Thống kê lượt xem & biểu đồ Recharts.

## 7. AdminService (`services/admin.service.ts`)
- `getSystemStats(): Promise<SystemStats>`: Thống kê toàn hệ thống cho Admin.
- `getUsers(search): Promise<UserProfile[]>`: Lấy danh sách thành viên.
- `toggleUserStatus(userId): Promise<UserProfile | null>`: Khóa hoặc mở khóa tài khoản.
- `toggleTemplateStatus(templateId): Promise<Template | null>`: Ẩn/hiện mẫu thiệp trên thư viện.
