# Business Rules — NHÀ CÓ TIỆC

Tài liệu quy định các quy tắc nghiệp vụ (Business Rules & Validation Logic) cho nền tảng **Nhà Có Tiệc**.

---

## 1. Lifecycle của Thiệp (Invitation Lifecycle)

Thiệp có 3 trạng thái duy nhất:
1. `DRAFT`: Thiệp đang thiết kế.
   - Chỉ chủ sở hữu thiệp (owner) truy cập và xem preview được.
   - Trang public `/i/[slug]` từ người dùng vắng mặt/chưa đăng nhập sẽ trả về 404 hoặc thông báo thiệp chưa xuất bản.
2. `PUBLISHED`: Thiệp đã hoàn tất và xuất bản.
   - Mọi người dùng có đường dẫn URL đều truy cập được.
   - Khách mời có thể gửi RSVP, viết Lời chúc (Guestbook), xem thông tin sự kiện & bản đồ.
3. `ARCHIVED`: Thiệp đã lưu trữ sau khi sự kiện kết thúc.
   - Thiệp ẩn khỏi danh sách chính trên Dashboard.
   - Trang public truy cập sẽ hiển thị thông báo thiệp đã được lưu trữ.

---

## 2. Quy tắc Xuất bản Thiệp (Publish Validation Rules)

Để xuất bản thiệp (`DRAFT` -> `PUBLISHED`), thiệp phải đáp ứng các tiêu chí tối thiểu:
- Tên thiệp (`title`) không được để trống.
- Đã chọn Template mẫu (`template_id`).
- Ngày tổ chức sự kiện (`event_date`) phải là ngày hợp lệ.
- Tên địa điểm (`venue_name`) và Địa chỉ (`venue_address`) không được để trống.
- Đường dẫn slug (`slug`) phải duy nhất toàn hệ thống, viết thường, không chứa dấu tiếng Việt hoặc ký tự đặc biệt trừ dấu gạch ngang `-`.

---

## 3. Quy tắc Phản hồi RSVP (RSVP Rules)

- `ATTENDING` (Tham dự):
  - Số lượng người đi cùng (`guest_count`) phải >= 1 và <= `max_guests` được chủ thiệp cấu hình cho khách mời đó.
- `NOT_ATTENDING` (Không tham dự):
  - Số lượng người đi cùng (`guest_count`) tự động gán = 0.
- `MAYBE` (Có thể):
  - Số lượng người đi cùng (`guest_count`) phải >= 1 và <= `max_guests`.
- Mỗi khách mời (`guest_id`) chỉ được sở hữu 1 bản ghi phản hồi RSVP duy nhất. Gửi lần sau sẽ cập nhật bản ghi cũ.

---

## 4. Quy tắc Cá nhân hóa Khách mời (Personalized Guest Rules)

- Mỗi khách mời thuộc về 1 thiệp cụ thể.
- Slug của khách mời (`guest.slug`) phải duy nhất trong phạm vi thiệp đó (`UNIQUE(invitation_id, slug)`).
- Không bao giờ cho phép guest slug của thiệp A đọc thông tin khách mời của thiệp B (`/i/thiep-A?to=khach-B` sẽ coi như không tìm thấy khách mời và quay về chế độ thiệp chung).

---

## 5. Sổ Lời Chúc (Guestbook Rules)

- Mọi người xem thiệp công khai đều có thể gửi Lời chúc (`guest_name` & `message`).
- Trạng thái mặc định của Lời chúc là `is_visible = true`.
- Chủ sở hữu thiệp (owner) hoặc ADMIN có quyền ẩn (`is_visible = false`) hoặc xóa lời chúc không phù hợp từ Dashboard.
