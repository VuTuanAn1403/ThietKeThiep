# Prompt: Redesign UI "NHÀ CÓ TIỆC" — phong cách Aurora Glass (Futuristic Luxury)

> Dùng prompt này với Claude Code / Cursor / bất kỳ AI coding agent nào đang làm việc trực tiếp trên repo `ThietKeThiep`. Prompt được thiết kế để agent làm việc có kỷ luật, không "vibe code" — nghĩa là không tự chế token màu, không đoán component, không refactor lan man ngoài phạm vi.

---

## 0. Bối cảnh dự án (bắt buộc đọc trước khi sửa code)

- Stack: Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, Recharts, Supabase.
- Cấu trúc thư mục hiện có: `app/`, `components/`, `components/invitation/`, `components/editor/`, `lib/`, `services/`, `types/`.
- Trước khi viết bất kỳ component nào, hãy **đọc `tailwind.config.ts` và các component hiện có trong `components/`** để tái sử dụng pattern đặt tên, biến, và cấu trúc đang tồn tại — không tạo hệ thống class song song.
- Không được cài thêm thư viện mới (animation, icon, UI kit...) nếu chưa liệt kê rõ trong mục 5. Nếu thấy cần, dừng lại và hỏi trước khi cài.

---

## 1. Nguyên tắc bắt buộc (Anti-vibe-coding rules)

Agent phải tuân thủ nghiêm ngặt các quy tắc sau trong suốt quá trình thực hiện:

1. **Không đoán, không bịa token thiết kế.** Mọi màu sắc, spacing, font-size, border-radius phải lấy từ bảng token ở Mục 2. Nếu cần giá trị không có trong bảng, dừng lại và hỏi thay vì tự chọn số ngẫu nhiên.
2. **Một thay đổi = một mục tiêu rõ ràng.** Không gộp việc đổi UI với việc sửa logic nghiệp vụ, đổi tên biến không liên quan, hoặc "tiện tay" refactor file khác không nằm trong phạm vi task.
3. **Không xóa/thay đổi hành vi hiện có** (validation, API call, RLS, auth flow) trừ khi được yêu cầu rõ ràng. Đây là thay đổi UI, không phải thay đổi logic.
4. **Tái sử dụng trước khi tạo mới.** Kiểm tra `components/` xem đã có component tương tự chưa trước khi tạo component mới. Nếu có, mở rộng nó bằng props thay vì tạo bản sao.
5. **Mọi component mới phải có:**
   - Kiểu TypeScript rõ ràng cho props (không dùng `any`).
   - Hỗ trợ dark/light nếu trang hiện tại có hỗ trợ theme.
   - Responsive tối thiểu 3 breakpoint: mobile (< 640px), tablet (640–1024px), desktop (> 1024px).
   - Tôn trọng `prefers-reduced-motion` cho mọi animation.
5. **Hiệu năng là yêu cầu, không phải tùy chọn.**
   - `backdrop-filter: blur()` chỉ dùng tối đa 2-3 lớp cùng lúc trên một viewport.
   - Ảnh nền/blob trang trí phải dùng `will-change` hợp lý, không animate `filter`/`box-shadow` liên tục (ưu tiên animate `transform` và `opacity`).
   - Không animation nào chạy khi phần tử nằm ngoài viewport (dùng `IntersectionObserver` hoặc Framer Motion `whileInView`).
6. **Accessibility không được đánh đổi vì thẩm mỹ.**
   - Tỷ lệ tương phản chữ/nền tối thiểu đạt WCAG AA (4.5:1 cho chữ thường, 3:1 cho chữ lớn).
   - Mọi nút/link giữ nguyên `aria-label`, `focus-visible` ring rõ ràng — không tắt outline focus vì lý do thẩm mỹ.
7. **Không tự ý đổi nội dung tiếng Việt** (copy, label, giá tiền) trừ khi task yêu cầu.
8. **Sau khi sửa xong mỗi phần, chạy:**
   ```
   npm run typecheck
   npx next lint
   npm run build
   ```
   Nếu bất kỳ lệnh nào lỗi, phải sửa trước khi coi task hoàn thành — không báo cáo "xong" khi build đang đỏ.
9. **Trình bày diff theo từng file, có giải thích ngắn gọn lý do thay đổi** — không trả về nguyên khối code không có ngữ cảnh.
10. **Nếu một yêu cầu trong prompt này mâu thuẫn với kiến trúc hiện tại của repo** (ví dụ: đã có design token khác trong `tailwind.config.ts`), ưu tiên kiến trúc hiện tại và báo lại chỗ mâu thuẫn thay vì tự ý ghi đè.

---

## 2. Design tokens — "Aurora Glass"

Thêm các token sau vào `tailwind.config.ts` (mục `theme.extend`), giữ nguyên token cũ đang có, không xóa:

```ts
colors: {
  aurora: {
    bg: '#0B0B12',        // nền tối chủ đạo
    surface: '#12121C',   // nền card/section
    glass: 'rgba(255,255,255,0.06)',   // nền kính mờ
    glassBorder: 'rgba(255,255,255,0.12)',
    violet: '#7C3AED',
    pink: '#EC4899',
    cyan: '#22D3EE',
    indigo: '#6366F1',
  },
},
backgroundImage: {
  'aurora-gradient': 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
  'aurora-gradient-alt': 'linear-gradient(135deg, #22D3EE 0%, #6366F1 100%)',
},
```

Typography:
- Heading (h1–h3): font display hiện có của dự án nếu đã import; nếu chưa có, dùng `Playfair Display` cho phần landing/thiệp cưới, giữ nguyên font UI hiện tại (Inter/hệ thống) cho dashboard/admin.
- Không đổi font cho phần dashboard/admin — chỉ áp dụng theme mới cho: trang chủ (`app/page.tsx`), trang pricing/section pricing, và (tùy chọn, hỏi trước) trang public thiệp `/i/[slug]`.

Spacing/radius: dùng đúng scale Tailwind mặc định (không tạo scale riêng). Card bo góc `rounded-2xl` (16px), nút bo góc `rounded-xl` (12px).

---

## 3. Component cần xây dựng — theo thứ tự ưu tiên

### 3.1 `GlassCard` (component dùng lại nhiều nơi)
- Props: `children`, `className?`, `glow?: boolean` (bật viền gradient phát sáng khi `true`).
- Style nền: `bg-aurora-glass backdrop-blur-xl border border-aurora-glassBorder rounded-2xl`.
- Khi `glow=true`: thêm pseudo-border gradient animate chậm (dùng CSS `@property` hoặc mask kỹ thuật border-gradient, KHÔNG dùng box-shadow nặng).
- Test: component phải render đúng cả khi không có nội dung (empty state) và khi nội dung dài (overflow).

### 3.2 `AuroraBackground` (nền hero + section landing)
- 2–3 blob hình tròn, `blur-[100px]`, opacity thấp (0.15–0.3), màu lấy từ `aurora-gradient`/`aurora-gradient-alt`.
- Animate vị trí bằng Framer Motion, loop 20–30s, dùng `transform: translate()`, KHÔNG dùng `top/left` để tránh reflow.
- Bọc trong `<div aria-hidden="true">` — đây là decoration, không phải nội dung.
- Bắt buộc: nếu `prefers-reduced-motion: reduce`, tắt animation, giữ blob đứng yên.

### 3.3 `GradientButton`
- Biến thể `primary` (nền gradient đặc, chữ trắng) và `ghost-glass` (nền kính mờ, viền gradient, chữ trắng/aurora).
- Hover: tăng nhẹ độ sáng viền/glow, KHÔNG đổi kích thước (tránh layout shift).
- Giữ nguyên props/behavior của button hiện tại trong `components/` nếu đã có — mở rộng thay vì viết mới nếu tìm thấy component nút chung.

### 3.4 Hero section (`app/page.tsx` — phần đầu trang)
- Nền: `bg-aurora-bg` + `AuroraBackground`.
- Tiêu đề: chữ lớn, một phần chữ áp `bg-clip-text text-transparent bg-aurora-gradient`.
- 2 CTA: 1 `GradientButton variant="primary"`, 1 `variant="ghost-glass"`.
- Ảnh mẫu thiệp: giữ nguyên logic hiện có, chỉ đổi shadow từ mặc định sang glow màu tím/hồng nhạt (`shadow-[0_0_60px_-15px_rgba(124,58,237,0.5)]`).
- Không đổi cấu trúc SEO/OG hiện có (không đụng vào metadata, JSON-LD).

### 3.5 Pricing cards (section `#pricing`)
- Card Premium (gói đang được đánh dấu nổi bật): dùng `GlassCard glow`.
- Card Free/Basic: dùng `GlassCard` không glow, tông trung tính hơn.
- Giữ nguyên toàn bộ nội dung, giá, link hiện có — chỉ đổi style.

---

## 4. Phạm vi KHÔNG được đụng vào trong lần này

- Không sửa `lib/`, `services/`, `supabase/`, logic RLS, auth.
- Không sửa API routes trong `app/api/`.
- Không đổi cấu trúc route hoặc URL slug.
- Không sửa `middleware.ts`.
- Không đổi theme của `admin/` và `dashboard/` trừ khi được yêu cầu ở lần sau — hai khu vực này ưu tiên rõ ràng dữ liệu hơn thẩm mỹ, giữ nguyên cho tới khi có prompt riêng.

---

## 5. Thư viện được phép dùng (đã có sẵn trong `package.json`, không cài thêm)

- `framer-motion` — animation, `whileInView`, `useMotionValue`.
- `tailwindcss` — toàn bộ style, không viết CSS thuần trừ khi kỹ thuật border-gradient bắt buộc cần `<style>` cục bộ.
- `lucide-react` (nếu đã có trong dependencies) — icon, không tự vẽ SVG icon mới.

Nếu cần bất kỳ thư viện nào ngoài danh sách này (ví dụ: `react-spring`, thư viện particle...), **dừng lại và hỏi trước**, không tự ý `npm install`.

---

## 6. Định nghĩa "hoàn thành" (Definition of Done)

Task chỉ được coi là xong khi:

- [ ] `npm run typecheck` pass.
- [ ] `npx next lint` pass, không warning mới phát sinh.
- [ ] `npm run build` thành công.
- [ ] Kiểm tra bằng mắt trên 3 kích thước: 375px (mobile), 768px (tablet), 1440px (desktop).
- [ ] Kiểm tra `prefers-reduced-motion` bằng DevTools emulation — animation phải tắt đúng.
- [ ] Không có console error/warning mới trong trình duyệt.
- [ ] Diff code được trình bày rõ theo từng file, kèm giải thích 1-2 câu mỗi thay đổi lớn.
- [ ] Không có TODO, code chết (dead code), hoặc component không dùng bị bỏ sót lại trong repo.

---

## 7. Cách giao task cho agent (copy phần dưới đây khi bắt đầu)

```
Đọc kỹ toàn bộ file prompt-redesign-ui-aurora-glass.md trước khi làm.
Bắt đầu với Mục 3.1 (GlassCard) và 3.2 (AuroraBackground) trước — đây là 2 component nền tảng.
Sau khi 2 component này hoàn thành và pass Definition of Done ở Mục 6,
dừng lại, báo cáo, và chờ xác nhận trước khi làm tiếp 3.3 → 3.5.
Không được tự động làm hết tất cả các mục trong một lần chạy.
```

> Lý do chia nhỏ: làm từng bước và dừng lại để review giúp bạn kiểm soát chất lượng, tránh tình trạng agent "chạy một mạch" tạo ra hàng trăm dòng code không ai review kỹ — đúng tinh thần "anti vibe coding".
