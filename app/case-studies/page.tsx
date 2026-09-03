import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { Heart, Sparkles, ArrowRight, CheckCircle2, ShieldAlert } from 'lucide-react';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NavAuth } from '@/components/NavAuth';

export const metadata: Metadata = {
  title: 'Case Studies — Các trường hợp ứng dụng mẫu | NHÀ CÓ TIỆC',
  description: 'Khám phá các trường hợp ứng dụng mẫu thực tế của Nhà Có Tiệc: Đám cưới, Sinh nhật, Tân gia. Giải pháp tiết kiệm 80% chi phí in ấn và quản lý khách mời hiệu quả.',
  openGraph: {
    title: 'Case Studies — Mẫu thực tế | NHÀ CÓ TIỆC',
    description: 'Trải nghiệm cách thiệp online tối ưu hóa chi phí và quản lý RSVP cho các sự kiện gia đình.',
  },
};

interface CaseStudy {
  id: string;
  title: string;
  eventType: string;
  badgeColor: string;
  coverImage: string;
  demoSlug: string;
  description: string;
  challenge: string;
  solution: string;
  results: string[];
}

const CASE_STUDIES: CaseStudy[] = [
  {
    id: 'wedding-rustic',
    title: 'Lễ Cưới Minh Trí & Ngọc Anh — Phong Cách Rustic Warm',
    eventType: 'Đám Cưới',
    badgeColor: 'bg-rose-100 text-rose-700',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=800&q=80',
    demoSlug: 'minh-anh-wedding',
    description: 'Một đám cưới 350 khách với nhiều bạn bè ở xa và đồng nghiệp tại các thành phố khác nhau.',
    challenge: 'Cặp đôi gặp khó khăn khi gửi thiệp giấy cho hơn 120 khách ở nước ngoài và ngoại tỉnh; việc gọi điện hỏi từng người có đi hay không mất hơn 2 tuần và dễ nhầm lẫn số lượng bàn tiệc.',
    solution: 'Ứng dụng NHÀ CÓ TIỆC tạo link thiệp cá nhân hóa kèm mã QR riêng cho từng nhóm khách. Khách mời nhận link qua Zalo/Facebook, xác nhận RSVP chỉ với 1 chạm và nhận chỉ đường Google Maps.',
    results: [
      'Tiết kiệm 85% chi phí in ấn thiệp phụ cho khách ở xa',
      'Thu về 94% phản hồi RSVP trước ngày cưới 1 tuần',
      'Hơn 80 lời chúc và 45 lưu bút được gửi tặng trực tiếp trên thiệp',
    ],
  },
  {
    id: 'birthday-pastel',
    title: 'Tiệc Thôi Nôi & Sinh Nhật Bé Gia Hân — Phong Cách Pastel Joy',
    eventType: 'Sinh Nhật / Thôi Nôi',
    badgeColor: 'bg-pink-100 text-pink-700',
    coverImage: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=800&q=80',
    demoSlug: 'gia-han-1st-birthday',
    description: 'Tiệc kỷ niệm thôi nôi 1 tuổi ấm cúng cùng đại gia đình và bạn bè thân thiết.',
    challenge: 'Gia đình muốn có album ảnh quá trình 12 tháng đầu đời của bé kèm âm nhạc vui tươi để khách mời cùng chia sẻ khoảnh khắc, nhưng thiệp giấy truyền thống không thể truyền tải được media.',
    solution: 'Sử dụng mẫu thiệp sinh nhật của Nhà Có Tiệc với tính năng Story timeline, album ảnh tương tác và nhạc nền MP3 bài hát yêu thích của bé.',
    results: [
      'Album ảnh kỷ niệm 12 tháng đạt hơn 600 lượt xem từ họ hàng',
      'Khách mời gửi kèm hình ảnh chúc mừng đáng yêu',
      'Thông tin địa điểm nhà hàng và thực đơn tiệc được trình bày trực quan',
    ],
  },
  {
    id: 'housewarming-modern',
    title: 'Tiệc Mừng Tân Gia Gia Đình Hoàng Long — Phong Cách Modern Minimal',
    eventType: 'Tân Gia',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    coverImage: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    demoSlug: 'hoang-long-housewarming',
    description: 'Sự kiện mừng nhà mới với 80 khách mời là họ hàng, hàng xóm và đối tác kinh doanh.',
    challenge: 'Khu đô thị mới có địa chỉ phức tạp, khách mời thường bị lạc đường khi tìm nhà. Chủ nhà cũng muốn hạn chế nhận phong bì tiền mặt truyền thống.',
    solution: 'Tích hợp bản đồ vệ tinh chính xác kèm tọa độ GPS và tích hợp mã QR chuyển khoản mừng tân gia tiện lợi, lịch sự.',
    results: [
      '100% khách mời đến đúng giờ nhờ tính năng chỉ đường chính xác',
      'Không còn tình trạng khách gọi điện hỏi đường liên tục trong giờ đón tiếp',
      'Giao diện hiện đại, sang trọng phù hợp với không gian nhà mới',
    ],
  },
];

export default function CaseStudiesPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2d3748] font-sans selection:bg-[#e85d75]/20">
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
            <Link href="/case-studies" className="text-[#e85d75] font-semibold">Case Studies</Link>
            <Link href="/faq" className="hover:text-[#e85d75] transition-colors">FAQ</Link>
            <Link href="/privacy" className="hover:text-[#e85d75] transition-colors">Bảo mật</Link>
          </nav>

          <NavAuth />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <Breadcrumbs items={[{ label: 'Case Studies' }]} />

        {/* Notice Badge */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Ghi chú minh bạch (Demo Case Studies):</span> Các trường hợp dưới đây là dữ liệu minh họa dựa trên các kịch bản thực tế phổ biến của khách hàng sử dụng nền tảng Nhà Có Tiệc. Chúng tôi cam kết không tạo đánh giá giả mạo nhằm mục đích thương mại.
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#e85d75]">Trường Hợp Ứng Dụng Mẫu</span>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 leading-tight">
            Giải pháp thiệp online cho từng <span className="text-[#e85d75] italic">sự kiện ý nghĩa</span>
          </h1>
          <p className="text-sm sm:text-base text-gray-600">
            Xem cách các gia đình và cặp đôi đã ứng dụng thiệp online để tiết kiệm thời gian, chi phí và nâng tầm trải nghiệm của khách mời.
          </p>
        </div>

        {/* Case Studies Grid */}
        <div className="space-y-12 pt-6">
          {CASE_STUDIES.map((cs, idx) => (
            <article
              key={cs.id}
              className="bg-white rounded-3xl border border-[#e8dfd8] overflow-hidden shadow-sm hover:shadow-md transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center"
            >
              {/* Cover Column */}
              <div className="lg:col-span-5 relative aspect-[4/3] rounded-2xl overflow-hidden border border-gray-100">
                <Image
                  src={cs.coverImage}
                  alt={`Minh họa ${cs.title}`}
                  fill
                  className="object-cover"
                />
                <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${cs.badgeColor}`}>
                  {cs.eventType}
                </span>
                <span className="absolute bottom-3 right-3 px-2.5 py-0.5 rounded-full bg-black/60 text-white text-[10px] font-medium backdrop-blur-sm">
                  Demo Scenario #{idx + 1}
                </span>
              </div>

              {/* Detail Column */}
              <div className="lg:col-span-7 space-y-4">
                <h2 className="text-2xl font-serif font-bold text-gray-900 leading-snug">
                  {cs.title}
                </h2>
                <p className="text-xs text-gray-600 italic">
                  {cs.description}
                </p>

                <div className="space-y-3 text-xs">
                  <div className="p-3.5 bg-rose-50/60 rounded-xl border border-rose-100">
                    <span className="font-bold text-rose-900 block mb-1">Thách thức ban đầu:</span>
                    <span className="text-rose-800 leading-relaxed">{cs.challenge}</span>
                  </div>

                  <div className="p-3.5 bg-blue-50/60 rounded-xl border border-blue-100">
                    <span className="font-bold text-blue-900 block mb-1">Giải pháp từ Nhà Có Tiệc:</span>
                    <span className="text-blue-800 leading-relaxed">{cs.solution}</span>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <span className="font-bold text-gray-900 block">Kết quả đạt được:</span>
                    {cs.results.map((res, rIdx) => (
                      <div key={rIdx} className="flex items-center gap-2 text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>{res}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 flex items-center gap-3 flex-wrap">
                  <Link
                    href={`/templates`}
                    className="px-5 py-2.5 rounded-full bg-[#e85d75] text-white font-semibold text-xs hover:bg-[#d64c64] transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Tạo thiệp tương tự
                  </Link>
                  <Link
                    href={`/templates`}
                    className="px-5 py-2.5 rounded-full bg-white border border-[#e8dfd8] text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all flex items-center gap-1.5"
                  >
                    Xem thư viện mẫu
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-[#e85d75] to-[#c94b62] text-white rounded-3xl p-8 sm:p-12 text-center space-y-4 shadow-lg">
          <h2 className="text-2xl sm:text-4xl font-serif font-bold">
            Sẵn sàng tổ chức sự kiện đặc biệt của bạn?
          </h2>
          <p className="text-xs sm:text-sm text-white/90 max-w-xl mx-auto">
            Tạo thiệp hoàn toàn miễn phí, thử nghiệm mọi tính năng và chỉ thanh toán khi bạn thực sự hài lòng với thiết kế.
          </p>
          <div className="pt-2">
            <Link
              href="/dashboard/invitations/new"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full bg-white text-[#e85d75] font-bold text-xs hover:bg-gray-100 transition-all shadow-md"
            >
              Bắt đầu tạo thiệp ngay
              <ArrowRight className="w-4 h-4" />
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
