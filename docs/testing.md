# Testing & Quality Assurance — NHÀ CÓ TIỆC

Tài liệu hướng dẫn quy trình kiểm thử và chất lượng của dự án **Nhà Có Tiệc**.

---

## 1. Test Suite Structure

Tất cả các bộ test được lưu tại thư mục `tests/`:

- `tests/auth.test.ts`: Test đăng nhập, đăng ký và validate dữ liệu trùng lặp.
- `tests/invitation.test.ts`: Test khởi tạo thiệp, kiểm tra trùng lặp slug URL và cập nhật thông tin.
- `tests/rsvp.test.ts`: Test logic kiểm tra số lượng người tham dự tối đa (`max_guests`), quy tắc gán `guest_count = 0` khi vắng mặt.

---

## 2. Running Automated Tests

Chạy tất cả unit & integration tests:

```bash
npm run test
```

Kiểm tra gõ kiểu tĩnh TypeScript Strict:

```bash
npm run typecheck
```

Kiểm tra Linting:

```bash
npm run lint
```

Kiểm tra Build sản phẩm:

```bash
npm run build
```
