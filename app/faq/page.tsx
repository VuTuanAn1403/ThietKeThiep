import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { Heart, HelpCircle, ArrowRight, Sparkles, MessageCircleQuestion } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NavAuth } from '@/components/NavAuth';

export const metadata: Metadata = {
  title: 'Câu hỏi thường gặp (FAQ) | NHÀ CÓ TIỆC',
  description: 'Tổng hợp các câu hỏi thường gặp về cách tạo thiệp online, quản lý khách mời, xác nhận tham dự RSVP, cấu hình quà tặng và chia sẻ link thiệp trên Nhà Có Tiệc.',
  openGraph: {
    title: 'Câu hỏi thường gặp — Giải đáp thắc mắc | NHÀ CÓ TIỆC',
    description: 'Tìm hiểu cách sử dụng thiệp online Nhà Có Tiệc nhanh chóng và hiệu quả.',
  },
};

const FAQ_ITEMS = [
  {
    q: '1. NHÀ CÓ TIỆC là gì?',
    a: 'NHÀ CÓ TIỆC là nền tảng trực tuyến chuyên biệt giúp các gia đình, cặp đôi và cá nhân thiết kế thiệp mời online thông minh cho các dịp: Đám cưới, Sinh nhật, Thôi nôi, Tân gia, Khai trương và Kỷ niệm. Người dùng có thể cá nhân hóa từng tấm thiệp, gửi link qua mạng xã hội, nhận phản hồi tham dự (RSVP) tức thì và quản lý sổ lưu bút tiện lợi.',
  },
  {
    q: '2. Tôi có thể tạo những loại thiệp nào trên nền tảng?',
    a: 'Bạn có thể tạo thiệp cho hầu hết mọi sự kiện: Đám cưới (Wedding), Lễ đính hôn, Sinh nhật, Thôi nôi / Đầy tháng, Mừng tân gia, Tiệc khai trương và Kỷ niệm ngày cưới. Chúng tôi liên tục cập nhật các phong cách thiết kế từ Cổ điển (Rustic), Sang trọng (Luxury), Tối giản (Minimalist) đến Tươi trẻ (Pastel).',
  },
  {
    q: '3. Khách mời có cần phải đăng ký tài khoản để xem thiệp hay gửi RSVP không?',
    a: 'Hoàn toàn không. Khách mời chỉ cần nhấn vào đường link thiệp do bạn gửi (qua Zalo, Messenger, SMS,...) là có thể xem toàn bộ nội dung thiệp, album ảnh, bản đồ và gửi xác nhận tham dự (RSVP), lời chúc hoặc lưu bút mà không cần tạo bất kỳ tài khoản nào.',
  },
  {
    q: '4. Tính năng xác nhận tham dự (RSVP) hoạt động như thế nào?',
    a: 'Khi nhận được thiệp, khách mời chọn một trong các tùy chọn: "Sẽ tham dự", "Không thể tham dự" hoặc "Chưa chắc chắn", đồng thời nhập số lượng người đi cùng và lời nhắn (nếu có). Toàn bộ dữ liệu sẽ được tổng hợp ngay lập tức về trang quản trị Dashboard của bạn để bạn dễ dàng lên danh sách bàn tiệc.',
  },
  {
    q: '5. Tôi có thể chỉnh sửa nội dung sau khi đã xuất bản thiệp không?',
    a: 'Có, bạn có thể chỉnh sửa mọi thông tin (ngày giờ, địa điểm, hình ảnh, câu chuyện tình yêu, nhạc nền,...) bất kỳ lúc nào ngay trong Dashboard. Các thay đổi sẽ có hiệu lực ngay lập tức mà không làm thay đổi đường dẫn (link) thiệp đã gửi cho khách.',
  },
  {
    q: '6. Có thể tạo đường link riêng hoặc mã QR riêng cho từng khách mời không?',
    a: 'Chắc chắn có. Trong mục Quản lý khách mời, bạn có thể thêm danh sách khách và hệ thống sẽ tự sinh link riêng (Ví dụ: nhacotiec.vn/i/dam-cuoi-minh-anh?guest=anh-hoang). Khi khách mở link, thiệp sẽ hiển thị lời chào trân trọng đích danh như: "Thân mời: Anh Hoàng". Bạn cũng có thể tải mã QR riêng cho từng khách để in kèm thiệp giấy.',
  },
  {
    q: '7. Tính năng Quà mừng / Mừng cưới chuyển khoản có an toàn không?',
    a: 'Tính năng Quà tặng cho phép bạn cấu hình thông tin ngân hàng, chủ tài khoản và mã QR VietQR chuẩn ngân hàng. Khách mời có thể quét mã QR để chuyển khoản trực tiếp vào tài khoản của bạn qua ứng dụng ngân hàng của họ mà không thông qua bất kỳ cổng trung gian nào, đảm bảo 100% an toàn và bảo mật.',
  },
  {
    q: '8. Tôi có thể thêm nhạc nền MP3 và album ảnh cưới chất lượng cao không?',
    a: 'Có. Bạn có thể tải lên bài hát yêu thích định dạng MP3 tự động phát khi khách mở thiệp, đồng thời đăng tải album ảnh chất lượng cao lên đến 50-100 ảnh tùy theo gói dịch vụ.',
  },
];

export default function FAQPage() {
  // Generate FAQ JSON-LD Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.q.replace(/^\d+\.\s*/, ''),
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    })),
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2d3748] font-sans selection:bg-[#e85d75]/20">
      {/* FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Header */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4">
        <div className="bg-white/90 backdrop-blur-md rounded-full border border-[#e8dfd8] shadow-sm px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-[#e85d75]">
            <div className="w-9 h-9 rounded-full bg-[#e85d75] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="tracking-tight text-gray-900 font-serif font-bold text-xl">NHÀ CÓ TIỆC</span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-700">
            <Link href="/" className="hover:text-[#e85d75] transition-colors">Trang chủ</Link>
            <Link href="/templates" className="hover:text-[#e85d75] transition-colors">Mẫu thiệp</Link>
            <Link href="/case-studies" className="hover:text-[#e85d75] transition-colors">Case Studies</Link>
            <Link href="/faq" className="text-[#e85d75] font-semibold">FAQ</Link>
            <Link href="/privacy" className="hover:text-[#e85d75] transition-colors">Bảo mật</Link>
          </nav>

          <NavAuth />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Breadcrumbs items={[{ label: 'Câu hỏi thường gặp' }]} />

        {/* Title Header */}
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#e85d75] flex items-center justify-center mx-auto">
            <HelpCircle className="w-6 h-6" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#e85d75]">Giải Đáp Thắc Mắc</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 leading-tight">
            Câu hỏi <span className="text-[#e85d75] italic">thường gặp</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Mọi thông tin bạn cần biết về cách thức hoạt động, tính năng và hướng dẫn sử dụng nền tảng Nhà Có Tiệc.
          </p>
        </div>

        {/* Accordion / List of FAQ items */}
        <div className="space-y-4 pt-4">
          {FAQ_ITEMS.map((item, idx) => (
            <details
              key={idx}
              className="group bg-white rounded-2xl border border-[#e8dfd8] p-6 shadow-sm [&_summary::-webkit-details-marker]:hidden open:border-[#e85d75]/50 transition-all"
              open={idx === 0}
            >
              <summary className="flex items-center justify-between cursor-pointer font-serif font-bold text-base sm:text-lg text-gray-900 group-hover:text-[#e85d75] transition-colors">
                <span className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-full bg-rose-50 text-[#e85d75] text-xs font-sans font-bold flex items-center justify-center flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span>{item.q.replace(/^\d+\.\s*/, '')}</span>
                </span>
                <span className="transition group-open:rotate-180 text-gray-400 group-hover:text-[#e85d75] text-xl font-bold ml-2">
                  ↓
                </span>
              </summary>
              <div className="pt-4 mt-3 border-t border-gray-100 text-xs sm:text-sm text-gray-600 leading-relaxed pl-10">
                {item.a}
              </div>
            </details>
          ))}
        </div>

        {/* Support Callout */}
        <div className="bg-white rounded-3xl border border-[#e8dfd8] p-8 text-center space-y-4 shadow-sm">
          <div className="w-10 h-10 rounded-full bg-rose-50 text-[#e85d75] flex items-center justify-center mx-auto">
            <MessageCircleQuestion className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-serif font-bold text-gray-900">
            Bạn vẫn còn câu hỏi khác?
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Đội ngũ hỗ trợ của Nhà Có Tiệc luôn sẵn sàng giải đáp thắc mắc của bạn trong giờ hành chính (Thứ 2 - Thứ 7, 08:00 - 18:00).
          </p>
          <div className="pt-2 flex justify-center gap-3">
            <Link
              href="/dashboard/support"
              className="px-6 py-3 rounded-full bg-[#e85d75] text-white font-semibold text-xs hover:bg-[#d64c64] transition-all shadow-md"
            >
              Gửi yêu cầu hỗ trợ
            </Link>
            <Link
              href="/templates"
              className="px-6 py-3 rounded-full bg-white border border-[#e8dfd8] text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all"
            >
              Khám phá mẫu thiệp
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-[#e8dfd8] text-center text-xs text-gray-500 mt-16">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-bold text-[#e85d75] text-lg">
            <span>NHÀ CÓ TIỆC</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/templates" className="hover:text-[#e85d75]">Mẫu thiệp</Link>
            <Link href="/case-studies" className="hover:text-[#e85d75]">Case Studies</Link>
            <Link href="/faq" className="hover:text-[#e85d75]">FAQ</Link>
            <Link href="/privacy" className="hover:text-[#e85d75]">Bảo mật</Link>
          </div>
          <p>© 2026 NHÀ CÓ TIỆC. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
