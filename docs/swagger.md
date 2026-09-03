# HƯỚNG DẪN SỬ DỤNG SWAGGER UI & REST API v1
## DỰ ÁN: NHÀ CÓ TIỆC

---

## 1. TRUY CẬP SWAGGER UI

* **Đường dẫn Swagger UI:** `http://localhost:3000/swagger-ui`
* **Đường dẫn OpenAPI Spec JSON:** `http://localhost:3000/api/swagger`

---

## 2. CÁC NHÓM API ĐƯỢC CUNG CẤP

1. **Authentication:**
   - `POST /api/v1/auth/login`: Đăng nhập thành viên
   - `POST /api/v1/auth/register`: Đăng ký tài khoản mới
   - `POST /api/v1/auth/admin/login`: Đăng nhập quản trị viên
   - `POST /api/v1/auth/logout`: Đăng xuất phiên làm việc
2. **Users:**
   - `GET /api/v1/me`: Xem thông tin hồ sơ tài khoản
   - `PATCH /api/v1/me`: Cập nhật họ tên, điện thoại, avatar
3. **Invitations:**
   - `GET /api/v1/invitations`: Danh sách thiệp của người dùng
   - `POST /api/v1/invitations`: Tạo thiệp mời mới
   - `GET /api/v1/invitations/{id}`: Xem chi tiết thiệp
   - `PATCH /api/v1/invitations/{id}`: Cập nhật thông tin thiệp
   - `DELETE /api/v1/invitations/{id}`: Xóa thiệp
4. **Guests:**
   - `GET /api/v1/invitations/{id}/guests`: Danh sách khách mời của thiệp
   - `POST /api/v1/invitations/{id}/guests`: Thêm khách mời mới
5. **RSVP:**
   - `GET /api/v1/invitations/{id}/rsvps`: Thống kê xác nhận tham dự
   - `POST /api/v1/invitations/{id}/rsvps`: Khách gửi phản hồi RSVP
6. **Wishes:**
   - `GET /api/v1/invitations/{id}/wishes`: Danh sách lời chúc
   - `POST /api/v1/invitations/{id}/wishes`: Khách gửi lời chúc
7. **Gifts:**
   - `GET /api/v1/invitations/{id}/gifts`: Thông tin tài khoản mừng cưới
   - `POST /api/v1/invitations/{id}/gifts`: Cấu hình tài khoản mừng cưới
8. **Signatures:**
   - `GET /api/v1/invitations/{id}/signatures`: Danh sách chữ ký lưu bút
   - `POST /api/v1/invitations/{id}/signatures`: Khách ký tên lưu bút
9. **Feedback:**
   - `GET /api/v1/feedback`: Danh sách phản hồi góp ý
   - `POST /api/v1/feedback`: Gửi phản hồi / báo lỗi
