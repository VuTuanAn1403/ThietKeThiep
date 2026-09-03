'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart,
  Sparkles,
  Share2,
  Users,
  Layout,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Clock,
  ShieldCheck,
  Headphones,
  Mail,
  ChevronDown,
} from 'lucide-react';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { NavAuth } from '@/components/NavAuth';

const DYNAMIC_TOPICS = ['sự kiện', 'sinh nhật', 'đám cưới', 'tân gia', 'kỷ niệm'];

const LANDING_FAQ = [
  {
    q: 'NHÀ CÓ TIỆC là gì và hoạt động như thế nào?',
    a: 'NHÀ CÓ TIỆC là nền tảng tạo thiệp mời online thông minh. Bạn chỉ cần chọn mẫu, tùy chỉnh thông tin sự kiện và hình ảnh, sau đó nhận ngay đường link thiệp riêng kèm mã QR để chia sẻ tới khách mời qua Zalo, Facebook hoặc tin nhắn.',
  },
  {
    q: 'Khách mời có cần tải ứng dụng hoặc tạo tài khoản không?',
    a: 'Hoàn toàn không. Khách mời mở trực tiếp đường link trên bất kỳ trình duyệt nào (điện thoại hoặc máy tính) để xem thiệp, album ảnh, bản đồ chỉ đường và gửi xác nhận tham dự (RSVP) tức thì.',
  },
  {
    q: 'Tôi có thể chỉnh sửa thiệp sau khi đã gửi link cho khách không?',
    a: 'Có. Bạn có thể cập nhật mọi thông tin và hình ảnh trong Dashboard bất cứ lúc nào. Thay đổi sẽ cập nhật ngay lập tức mà không làm thay đổi đường dẫn đã gửi.',
  },
  {
    q: 'Tính năng RSVP và quà tặng chuyển khoản hoạt động ra sao?',
    a: 'Khách mời xác nhận đi/không đi và số người đi cùng. Dữ liệu tự động lưu vào trang quản trị của bạn. Mục quà tặng hiển thị mã VietQR chuyển khoản trực tiếp vào tài khoản ngân hàng của bạn an toàn 100%.',
  },
  {
    q: 'Chi phí tạo thiệp như thế nào?',
    a: 'Bạn có thể bắt đầu tạo thiệp hoàn toàn miễn phí (Free Plan). Khi cần thêm nhiều ảnh, nhạc nền MP3 hoặc không giới hạn lượt xem, bạn có thể nâng cấp gói dịch vụ với chi phí chỉ từ 169.000đ/sự kiện.',
  },
];

export default function HomePage() {
  const [topicIndex, setTopicIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % DYNAMIC_TOPICS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#fdfbf7] text-[#2d3748] font-sans selection:bg-[#e85d75]/20 pb-16 md:pb-0">
      {/* Sticky Mobile CTA Bar */}
      <StickyMobileCTA type="landing" />

      {/* Floating Header Navigation */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4">
        <div className="bg-white/95 backdrop-blur-md rounded-full border border-[#e8dfd8] shadow-sm px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-[#e85d75]">
            <div className="w-9 h-9 rounded-full bg-[#e85d75] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <Heart className="w-5 h-5 fill-white text-white" />
            </div>
            <span className="tracking-tight text-gray-900 font-serif font-bold text-xl">NHÀ CÓ TIỆC</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-700">
            <Link href="/" className="text-[#e85d75] font-semibold">Trang chủ</Link>
            <Link href="/templates" className="hover:text-[#e85d75] transition-colors">Mẫu thiệp</Link>
            <Link href="/case-studies" className="hover:text-[#e85d75] transition-colors">Case Studies</Link>
            <Link href="#pricing" className="hover:text-[#e85d75] transition-colors">Bảng giá</Link>
            <Link href="/faq" className="hover:text-[#e85d75] transition-colors">FAQ</Link>
            <Link href="/dashboard/support" className="hover:text-[#e85d75] transition-colors">Hỗ trợ</Link>
          </nav>

          <NavAuth />
        </div>
      </header>

      {/* Hero Section — Strictly Above The Fold */}
      <section className="pt-10 sm:pt-16 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column Text & CTAs */}
          <div className="lg:col-span-6 space-y-5 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 border border-rose-200 text-[#e85d75] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Nền tảng thiệp mời online thông minh</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#2d3748] leading-[1.15]">
              Đổi mới cách gửi lời mời{' '}
              <span className="text-[#e85d75] font-serif italic inline-block min-w-[170px] transition-all duration-500">
                {DYNAMIC_TOPICS[topicIndex]}
              </span>{' '}
              với <span className="text-[#e85d75]">Nhà Có Tiệc.</span>
            </h1>

            <p className="text-sm sm:text-base text-gray-600 font-normal leading-relaxed">
              Giải pháp tạo thiệp online chuyên nghiệp giúp bạn gửi lời mời trang trọng qua một đường link cá nhân hóa, tự động thu thập RSVP và tiết kiệm 80% chi phí in ấn.
            </p>

            <div className="text-xs text-gray-500 font-medium flex items-center gap-4 flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Tạo miễn phí</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Mẫu đa dạng</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Hài lòng mới thanh toán</span>
            </div>

            {/* Primary & Secondary CTA Above The Fold */}
            <div className="pt-2 flex items-center gap-3.5 flex-wrap">
              <Link
                href="/dashboard/invitations/new"
                className="px-8 py-3.5 rounded-full bg-[#e85d75] text-white font-semibold text-sm shadow-lg hover:bg-[#d64c64] transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Tạo thiệp ngay
              </Link>
              <Link
                href="/templates"
                className="px-7 py-3.5 rounded-full bg-white border border-[#e8dfd8] text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all shadow-sm flex items-center gap-2"
              >
                <span>Xem mẫu thiệp</span>
                <ArrowRight className="w-4 h-4 text-gray-400" />
              </Link>
            </div>
          </div>

          {/* Right Column Showcase Grid */}
          <div className="lg:col-span-6 grid grid-cols-3 gap-3">
            <div className="space-y-3">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu thiệp cưới phong cách Rustic Warm"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu thiệp cưới phong cách Classic Minimal"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-3 pt-4 sm:pt-6">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-md border-2 border-[#e85d75]">
                <Image
                  src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu thiệp cưới phong cách Golden Glamour"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu thiệp sinh nhật thôi nôi phong cách Pastel"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <div className="space-y-3">
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu thiệp tân gia phong cách Modern Elegance"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-gray-200">
                <Image
                  src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu thiệp sự kiện kỷ niệm ngày cưới"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature Cards */}
      <section id="features" className="py-16 bg-white border-t border-[#e8dfd8]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e85d75]">Tính Năng Nổi Bật</span>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              Trải nghiệm gửi thiệp <span className="text-[#e85d75] italic">hoàn hảo</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Mọi công cụ bạn cần để tạo ra tấm thiệp ấn tượng và quản lý khách mời trọn vẹn.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-[#fdfbf7] rounded-3xl border border-[#e8dfd8] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Layout className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-gray-900">Thiết kế nhanh chóng</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Tùy chỉnh thông tin ngày giờ, địa điểm, hình ảnh và câu chuyện kỷ niệm dễ dàng chỉ trong vài phút.
              </p>
            </div>

            <div className="p-6 bg-[#fdfbf7] rounded-3xl border border-[#e8dfd8] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-gray-900">Xác nhận RSVP tự động</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Khách mời phản hồi tham dự tức thì, hệ thống tự động tổng hợp số lượng bàn tiệc và khách đi kèm.
              </p>
            </div>

            <div className="p-6 bg-[#fdfbf7] rounded-3xl border border-[#e8dfd8] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-pink-100 text-[#e85d75] flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-gray-900">Mẫu thiệp đa dạng</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Thư viện mẫu thiệp phong phú cho Đám cưới, Sinh nhật, Thôi nôi, Tân gia được cập nhật liên tục.
              </p>
            </div>

            <div className="p-6 bg-[#fdfbf7] rounded-3xl border border-[#e8dfd8] space-y-3 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center">
                <Share2 className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-base text-gray-900">Chia sẻ link & QR tiện lợi</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                Gửi thiệp cá nhân hóa kèm tên từng khách mời qua Zalo, Messenger hoặc tải mã QR in kèm thiệp giấy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 bg-[#fdfbf7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e85d75]">Quy Trình 3 Bước</span>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              Tạo thiệp đơn giản trong <span className="text-[#e85d75] italic">3 bước</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-3xl border border-[#e8dfd8] text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-[#e85d75] font-serif font-bold text-xl flex items-center justify-center mx-auto">
                1
              </div>
              <h3 className="font-bold text-base text-gray-900">Chọn mẫu yêu thích</h3>
              <p className="text-xs text-gray-600">
                Khám phá bộ sưu tập mẫu thiệp phù hợp với phong cách sự kiện của bạn.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#e8dfd8] text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-[#e85d75] font-serif font-bold text-xl flex items-center justify-center mx-auto">
                2
              </div>
              <h3 className="font-bold text-base text-gray-900">Tùy chỉnh thông tin</h3>
              <p className="text-xs text-gray-600">
                Điền ngày giờ, địa điểm tổ chức, tải album ảnh và cài đặt nhạc nền MP3.
              </p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-[#e8dfd8] text-center space-y-3 shadow-sm">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-[#e85d75] font-serif font-bold text-xl flex items-center justify-center mx-auto">
                3
              </div>
              <h3 className="font-bold text-base text-gray-900">Gửi link & Nhận RSVP</h3>
              <p className="text-xs text-gray-600">
                Chia sẻ link thiệp tới người thân, bạn bè và theo dõi phản hồi trong Dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showcase Gallery Section */}
      <section className="py-16 bg-white border-t border-[#e8dfd8] text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e85d75]">Bộ Sưu Tập Tiêu Biểu</span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-gray-900">
              Thiết kế trang nhã cho mọi khoảnh khắc
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
              Tương thích hoàn hảo trên mọi thiết bị di động, máy tính bảng và màn hình máy tính.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
            {[
              { src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80', alt: 'Thiệp cưới phong cách Rustic Warm' },
              { src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80', alt: 'Thiệp cưới phong cách Classic Minimal' },
              { src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80', alt: 'Thiệp cưới phong cách Golden Glamour' },
              { src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80', alt: 'Thiệp thôi nôi sinh nhật bé gái' },
              { src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80', alt: 'Thiệp mừng tân gia sang trọng' },
              { src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80', alt: 'Thiệp kỷ niệm sự kiện gia đình' },
            ].map((item, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-gray-200 hover:scale-105 transition-transform">
                <Image src={item.src} alt={item.alt} fill className="object-cover" />
              </div>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-xs font-bold text-[#e85d75] hover:underline"
            >
              <span>Xem tất cả mẫu thiệp trong thư viện</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing Plans Section */}
      <section id="pricing" className="py-20 bg-[#fdfbf7] border-t border-[#e8dfd8]">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#e85d75]">Bảng Giá Minh Bạch</span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-gray-900 mt-2">
              Bảng giá <span className="text-[#e85d75] italic">gói dịch vụ</span>
            </h2>
            <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto mt-2">
              Lựa chọn gói dịch vụ phù hợp với ngân sách của bạn để tạo ra những website thiệp mời tuyệt đẹp và ấn tượng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Free Plan */}
            <div className="bg-white p-8 rounded-3xl border border-[#e8dfd8] space-y-6 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Free Plan</h3>
                <div className="text-3xl font-bold text-emerald-600">Miễn phí</div>
                <Link
                  href="/register"
                  className="w-full block text-center py-3 px-4 rounded-2xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64]"
                >
                  Tạo tài khoản miễn phí ✨
                </Link>
                <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                  <div className="font-semibold text-gray-800">Tính năng gói:</div>
                  <div>• Giới hạn hình ảnh: 10 ảnh</div>
                  <div>• Giới hạn thiệp mời: 1 thiệp</div>
                  <div>• Giới hạn lượt xem: 300 lượt</div>
                  <div>• Phản hồi RSVP cơ bản</div>
                </div>
              </div>
            </div>

            {/* Basic Plan */}
            <div className="bg-white p-8 rounded-3xl border-2 border-[#e85d75] space-y-6 flex flex-col justify-between shadow-lg relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-blue-600 text-white text-[11px] font-bold uppercase tracking-wider">
                Lựa chọn phổ biến
              </span>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Basic Plan</h3>
                <div>
                  <div className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                    169,000đ <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">-43%</span>
                  </div>
                  <div className="text-xs text-gray-400 line-through mt-0.5">299,000đ</div>
                </div>
                <Link
                  href="/register"
                  className="w-full block text-center py-3 px-4 rounded-2xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64]"
                >
                  Nâng cấp Basic Plan ngay ✨
                </Link>
                <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                  <div className="font-semibold text-gray-800">Tính năng gói:</div>
                  <div>• Giới hạn hình ảnh: 50 ảnh</div>
                  <div>• Không giới hạn lượt xem</div>
                  <div>• Mã QR Code cá nhân hóa</div>
                  <div>• Bản đồ Google Maps & Chỉ đường</div>
                </div>
              </div>
            </div>

            {/* Premium Plan */}
            <div className="bg-white p-8 rounded-3xl border border-[#e8dfd8] space-y-6 flex flex-col justify-between shadow-sm relative">
              <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-white text-[11px] font-bold uppercase tracking-wider">
                Đầy đủ tính năng
              </span>
              <div className="space-y-4">
                <h3 className="text-2xl font-bold text-gray-900">Premium Plan</h3>
                <div>
                  <div className="text-3xl font-bold text-amber-600 flex items-center gap-2">
                    269,000đ <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 text-xs font-bold">-46%</span>
                  </div>
                  <div className="text-xs text-gray-400 line-through mt-0.5">499,000đ</div>
                </div>
                <Link
                  href="/register"
                  className="w-full block text-center py-3 px-4 rounded-2xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64]"
                >
                  Nâng cấp Premium Plan ngay ✨
                </Link>
                <div className="border-t border-gray-100 pt-4 space-y-2 text-xs text-gray-600">
                  <div className="font-semibold text-gray-800">Tính năng gói:</div>
                  <div>• Giới hạn hình ảnh: 100 ảnh</div>
                  <div>• Không giới hạn lượt xem</div>
                  <div>• Nhạc nền MP3 tự chọn</div>
                  <div>• Sổ lưu bút & Chữ ký số</div>
                  <div>• Hỗ trợ ưu tiên</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section on Landing */}
      <section className="py-16 bg-white border-t border-[#e8dfd8]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#e85d75]">Giải Đáp Nhanh</span>
            <h2 className="text-3xl font-serif font-bold text-gray-900">
              Câu hỏi thường gặp
            </h2>
            <p className="text-xs sm:text-sm text-gray-600">
              Những thắc mắc phổ biến nhất khi bắt đầu sử dụng thiệp online.
            </p>
          </div>

          <div className="space-y-3">
            {LANDING_FAQ.map((item, idx) => (
              <details
                key={idx}
                className="group bg-[#fdfbf7] rounded-2xl border border-[#e8dfd8] p-5 [&_summary::-webkit-details-marker]:hidden open:border-[#e85d75]/50 transition-all"
              >
                <summary className="flex items-center justify-between cursor-pointer font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#e85d75] transition-colors">
                  <span>{item.q}</span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-open:rotate-180 transition-transform" />
                </summary>
                <div className="pt-3 mt-2 border-t border-gray-200/60 text-xs sm:text-sm text-gray-600 leading-relaxed">
                  {item.a}
                </div>
              </details>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#e85d75] hover:underline"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Xem toàn bộ danh sách câu hỏi thường gặp (FAQ)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Support & Response Time Commitment Section */}
      <section className="py-16 bg-[#fdfbf7] border-t border-[#e8dfd8]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl border border-[#e8dfd8] p-8 sm:p-10 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2 p-4">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#e85d75] flex items-center justify-center mx-auto">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Giờ Làm Việc Hỗ Trợ</h3>
              <p className="text-xs text-gray-600">
                Thứ 2 - Thứ 7: 08:00 - 18:00<br />
                Chủ Nhật: Hỗ trợ khẩn cấp qua ticket
              </p>
            </div>

            <div className="space-y-2 p-4 border-y md:border-y-0 md:border-x border-gray-100">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Cam Kết Phản Hồi</h3>
              <p className="text-xs text-gray-600">
                Phản hồi yêu cầu trong vòng 2 - 4 giờ làm việc. Cam kết minh bạch và tận tâm.
              </p>
            </div>

            <div className="space-y-2 p-4">
              <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-gray-900">Liên Hệ Trực Tiếp</h3>
              <p className="text-xs text-gray-600">
                Email: support@nhacotiec.vn<br />
                <Link href="/dashboard/support" className="text-[#e85d75] font-semibold hover:underline">Trung tâm trợ giúp</Link>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section (Honest & Transparent) */}
      <section className="py-16 bg-white border-t border-[#e8dfd8] text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <span className="text-xs font-bold uppercase tracking-wider text-[#e85d75]">Về Chúng Tôi</span>
          <h2 className="text-3xl font-serif font-bold text-gray-900">
            Đội ngũ phát triển <span className="text-[#e85d75] italic">Nhà Có Tiệc</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
            Chúng tôi là đội ngũ kỹ sư và nhà thiết kế tại Việt Nam với mong muốn mang lại giải pháp công nghệ văn minh, tiện lợi và tiết kiệm cho ngày vui của các gia đình Việt.
          </p>

          <div className="pt-4 max-w-md mx-auto p-5 bg-[#fdfbf7] rounded-2xl border border-dashed border-[#e8dfd8] text-xs text-gray-500">
            <span className="font-semibold text-gray-700">Thông báo minh bạch:</span> Hình ảnh và hồ sơ chi tiết của ban điều hành & kỹ thuật sẽ được cập nhật chính thức trong các phiên bản tiếp theo.
          </div>
        </div>
      </section>

      {/* Comprehensive Footer */}
      <footer className="py-12 bg-[#1f2421] text-gray-400 text-xs border-t border-[#2f3531]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
            {/* Brand Col */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 font-serif font-bold text-white text-lg">
                <Heart className="w-5 h-5 fill-[#e85d75] text-[#e85d75]" />
                <span>NHÀ CÓ TIỆC</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">
                Nền tảng thiết kế & quản lý thiệp mời online cao cấp tại Việt Nam. Cá nhân hóa từng khách mời, xác nhận RSVP tức thì.
              </p>
              <div className="text-[11px] text-gray-500">
                Email: support@nhacotiec.vn
              </div>
            </div>

            {/* Products Col */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Sản Phẩm</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/templates" className="hover:text-white transition-colors">Mẫu thiệp đám cưới</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Mẫu thiệp sinh nhật</Link></li>
                <li><Link href="/templates" className="hover:text-white transition-colors">Mẫu thiệp tân gia</Link></li>
                <li><Link href="/case-studies" className="hover:text-white transition-colors">Case Studies thực tế</Link></li>
                <li><Link href="#pricing" className="hover:text-white transition-colors">Bảng giá dịch vụ</Link></li>
              </ul>
            </div>

            {/* Resources Col */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Tài Nguyên</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/faq" className="hover:text-white transition-colors">Câu hỏi thường gặp (FAQ)</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">Chính sách bảo mật</Link></li>
                <li><Link href="/dashboard/support" className="hover:text-white transition-colors">Trung tâm hỗ trợ</Link></li>
                <li><Link href="/swagger-ui" className="hover:text-white transition-colors">API Documentation (v1.0)</Link></li>
              </ul>
            </div>

            {/* Account & Admin Col */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">Tài Khoản</h4>
              <ul className="space-y-2 text-xs">
                <li><Link href="/login" className="hover:text-white transition-colors">Đăng nhập người dùng</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Đăng ký tài khoản</Link></li>
                <li><Link href="/dashboard" className="hover:text-white transition-colors">User Dashboard</Link></li>
                <li><Link href="/admin/login" className="hover:text-white transition-colors text-gray-500">Admin Portal</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2f3531] flex flex-col sm:flex-row items-center justify-between gap-4 text-gray-500 text-[11px]">
            <p>© 2026 NHÀ CÓ TIỆC. Tất cả quyền được bảo lưu.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-gray-300">Bảo mật</Link>
              <span>•</span>
              <Link href="/faq" className="hover:text-gray-300">FAQ</Link>
              <span>•</span>
              <Link href="/case-studies" className="hover:text-gray-300">Case Studies</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
