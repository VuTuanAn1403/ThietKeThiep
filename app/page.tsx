'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useInView, useReducedMotion } from 'framer-motion';
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
  Mail,
  ChevronDown,
  QrCode,
  Music,
  Camera,
} from 'lucide-react';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';
import { NavAuth } from '@/components/NavAuth';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';

const DYNAMIC_TOPICS = ['đám cưới', 'lễ đính hôn', 'sinh nhật', 'tân gia', 'kỷ niệm'];

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

/* Reveal wrapper: fade-up when in viewport with reduced-motion support */
function RevealSection({
  children,
  className = '',
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const prefersReducedMotion = mounted && shouldReduceMotion;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={
        mounted && !prefersReducedMotion
          ? isInView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 24 }
          : undefined
      }
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function HomePage() {
  const [topicIndex, setTopicIndex] = useState(0);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -30]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setTopicIndex((prev) => (prev + 1) % DYNAMIC_TOPICS.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Desktop mouse parallax
  useEffect(() => {
    if (!mounted || shouldReduceMotion) return;
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    if (isMobile) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2;
      const y = (e.clientY / window.innerHeight - 0.5) * 2;
      setMousePos({ x, y });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mounted, shouldReduceMotion]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1F1B1C] font-sans selection:bg-[#B76E79]/15 selection:text-[#B76E79] pb-16 md:pb-0">
      {/* Sticky Mobile CTA Bar */}
      <StickyMobileCTA type="landing" />

      {/* Floating Editorial Navigation */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white/85 backdrop-blur-md border border-[#EAE4DF] rounded-full px-6 h-16 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(31,27,28,0.05)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#B76E79] to-[#E85B6A] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="tracking-tight text-[#1F1B1C] font-serif font-bold text-xl sm:text-2xl">
              NHÀ CÓ TIỆC
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
            <Link href="/" className="text-primary font-bold">
              Trang chủ
            </Link>
            <Link href="/templates" className="hover:text-primary transition-colors">
              Mẫu thiệp
            </Link>
            <Link href="/case-studies" className="hover:text-primary transition-colors">
              Case Studies
            </Link>
            <Link href="#pricing" className="hover:text-primary transition-colors">
              Bảng giá
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/dashboard/support" className="hover:text-primary transition-colors">
              Hỗ trợ
            </Link>
          </nav>

          <NavAuth />
        </div>
      </header>

      {/* ============================================================
          LUXURY EDITORIAL HERO SECTION
          ============================================================ */}
      <motion.section
        ref={heroRef}
        initial={false}
        style={mounted && !shouldReduceMotion ? { opacity: heroOpacity, y: heroY } : undefined}
        className="pt-12 sm:pt-20 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* Left Column: Editorial Headline & Actions */}
          <div className="lg:col-span-6 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF7F5] border border-[#EAE4DF] text-primary text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              <span className="tracking-wide uppercase text-[11px]">
                Nền tảng thiệp cưới &amp; sự kiện cao cấp
              </span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif font-bold tracking-tight text-[#1F1B1C] leading-[1.12]">
              Đổi mới cách gửi lời mời{' '}
              <span className="text-primary italic font-serif font-normal inline-block underline decoration-[#F27B88]/40 decoration-wavy decoration-2">
                {DYNAMIC_TOPICS[topicIndex]}
              </span>{' '}
              yêu thương.
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground font-normal leading-relaxed max-w-xl">
              <strong className="font-semibold text-[#1F1B1C]">NHÀ CÓ TIỆC</strong> là nơi tạo website thiệp online cao cấp và gửi thiệp cá nhân hóa — lưu giữ trọn vẹn khoảnh khắc trọng đại với giao diện tinh tế, RSVP tự động và mã QR thông minh.
            </p>

            <div className="text-xs text-muted-foreground font-medium flex items-center gap-5 flex-wrap pt-1">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> Khởi tạo miễn phí
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> Chuẩn phong cách Editorial
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-secondary" /> Hài lòng mới thanh toán
              </span>
            </div>

            {/* Primary & Secondary CTA */}
            <div className="pt-3 flex items-center gap-4 flex-wrap">
              <Link href="/dashboard/invitations/new">
                <Button variant="primary" size="lg" leftIcon={<Sparkles className="w-4 h-4" />}>
                  Tạo thiệp miễn phí
                </Button>
              </Link>
              <Link href="/templates">
                <Button variant="outline" size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                  Khám phá mẫu thiệp
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Column: Visual Invitation Showcase (Centerpiece) */}
          <div
            className="lg:col-span-6 relative"
            style={{ perspective: '1200px' }}
          >
            <div className="relative w-full aspect-[4/5] max-w-lg mx-auto">
              {/* Ambient warmth */}
              <div className="absolute -inset-6 bg-gradient-to-tr from-[#B76E79]/10 via-[#C5A880]/10 to-transparent rounded-[36px] blur-2xl pointer-events-none" />

              {/* Background Invitation Layer (Soft Angle) */}
              <div
                className="absolute w-[60%] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-[#EAE4DF] left-[4%] top-[6%] z-[1] transition-transform duration-500 will-change-transform"
                style={
                  mounted && !shouldReduceMotion
                    ? {
                        transform: `rotateY(6deg) rotateX(-2deg) translateZ(-20px) translateX(${mousePos.x * -5}px) translateY(${mousePos.y * -5}px)`,
                      }
                    : undefined
                }
              >
                <Image
                  src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu thiệp cưới phong cách Rustic Warm"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/25" />
              </div>

              {/* Secondary Background Layer (Right Side) */}
              <div
                className="absolute w-[58%] aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-[#EAE4DF] right-[4%] top-[10%] z-[2] transition-transform duration-500 will-change-transform"
                style={
                  mounted && !shouldReduceMotion
                    ? {
                        transform: `rotateY(-6deg) rotateX(-1deg) translateZ(-10px) translateX(${mousePos.x * -3}px) translateY(${mousePos.y * -3}px)`,
                      }
                    : undefined
                }
              >
                <Image
                  src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80"
                  alt="Mẫu thiệp cưới phong cách Classic Minimal"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/20" />
              </div>

              {/* Centerpiece Main Invitation Card */}
              <div
                className="absolute w-[70%] aspect-[3/4] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#B76E79]/30 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-[4] transition-transform duration-500 bg-white will-change-transform"
                style={
                  mounted && !shouldReduceMotion
                    ? {
                        transform: `translate(-50%, -50%) rotateY(${mousePos.x * 3}deg) rotateX(${mousePos.y * -2}deg) translateZ(25px)`,
                      }
                    : undefined
                }
              >
                <Image
                  src="https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=500&q=80"
                  alt="Mẫu thiệp cưới Golden Glamour — NHÀ CÓ TIỆC"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-[#FAF7F5]/80">
                    Mẫu Tiêu Biểu
                  </span>
                  <div className="text-base font-serif font-bold mt-0.5">Golden Glamour</div>
                  <div className="text-xs text-white/80 mt-1 font-light">
                    Hương Ly &amp; Minh Anh — 28.10.2026
                  </div>
                </div>
              </div>

              {/* Floating RSVP Badge */}
              <div
                className="absolute left-0 bottom-6 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-[#EAE4DF] shadow-lg flex items-center gap-3 z-10 will-change-transform"
                style={
                  mounted && !shouldReduceMotion
                    ? { transform: `translateX(${mousePos.x * -4}px) translateY(${mousePos.y * 4}px)` }
                    : undefined
                }
              >
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div className="text-left text-xs">
                  <div className="font-bold text-[#1F1B1C]">RSVP Tức Thì</div>
                  <div className="text-[11px] text-muted-foreground">128 khách đã xác nhận</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ============================================================
          FEATURES OVERVIEW (LUXURY EDITORIAL CARDS)
          ============================================================ */}
      <section id="features" className="py-20 bg-[#FAF7F5] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              TÍNH NĂNG ĐẶC QUYỀN
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F1B1C]">
              Trải nghiệm gửi thiệp <span className="text-primary italic">hoàn hảo &amp; tinh tế</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Mọi công cụ bạn cần để tạo ra tấm thiệp ấn tượng và quản lý khách mời trọn vẹn.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Layout,
                title: 'Thiết kế trực quan',
                desc: 'Tùy chỉnh thông tin ngày giờ, địa điểm, hình ảnh và câu chuyện kỷ niệm dễ dàng chỉ trong vài phút.',
                color: 'bg-rose-50 text-primary',
              },
              {
                icon: Users,
                title: 'Xác nhận RSVP tự động',
                desc: 'Khách mời phản hồi tham dự tức thì, hệ thống tự động tổng hợp số lượng bàn tiệc và khách đi kèm.',
                color: 'bg-emerald-50 text-secondary',
              },
              {
                icon: Sparkles,
                title: 'Mẫu thiệp đa dạng',
                desc: 'Thư viện mẫu thiệp phong phú cho Đám cưới, Sinh nhật, Thôi nôi, Tân gia được cập nhật liên tục.',
                color: 'bg-amber-50 text-accent',
              },
              {
                icon: Share2,
                title: 'Link & QR tiện lợi',
                desc: 'Gửi thiệp cá nhân hóa kèm tên từng khách mời qua Zalo, Messenger hoặc tải mã QR in kèm thiệp giấy.',
                color: 'bg-purple-50 text-purple-600',
              },
            ].map((feature, idx) => (
              <RevealSection key={idx} delay={idx * 0.08}>
                <Card hoverEffect className="p-7 space-y-4 h-full text-left">
                  <div className={`w-12 h-12 rounded-2xl ${feature.color} flex items-center justify-center border border-[#EAE4DF]`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#1F1B1C]">{feature.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{feature.desc}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          HOW IT WORKS (3 SIMPLE STEPS)
          ============================================================ */}
      <section className="py-20 bg-[#FFFDF9] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RevealSection className="text-center max-w-2xl mx-auto mb-14 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              QUY TRÌNH 3 BƯỚC
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F1B1C]">
              Khởi tạo thiệp mời chỉ trong <span className="text-primary italic">3 bước đơn giản</span>
            </h2>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                num: '1',
                title: 'Chọn mẫu yêu thích',
                desc: 'Khám phá bộ sưu tập mẫu thiệp phù hợp với phong cách sự kiện và cá tính riêng của bạn.',
              },
              {
                num: '2',
                title: 'Tùy chỉnh thông tin',
                desc: 'Điền ngày giờ, địa điểm tổ chức, tải album ảnh kỷ niệm và cài đặt nhạc nền MP3 lãng mạn.',
              },
              {
                num: '3',
                title: 'Gửi link & Nhận RSVP',
                desc: 'Chia sẻ link thiệp tới người thân, bạn bè và theo dõi phản hồi xác nhận trực tiếp trong Dashboard.',
              },
            ].map((step, idx) => (
              <RevealSection key={idx} delay={idx * 0.1}>
                <Card hoverEffect className="p-8 text-center space-y-4 h-full">
                  <div className="w-14 h-14 rounded-2xl bg-[#FAF7F5] border-2 border-accent/40 text-primary font-serif font-bold text-2xl flex items-center justify-center mx-auto shadow-sm">
                    {step.num}
                  </div>
                  <h3 className="font-serif font-bold text-lg text-[#1F1B1C]">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SHOWCASE GALLERY
          ============================================================ */}
      <section className="py-20 bg-[#FAF7F5] text-center relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <RevealSection className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              BỘ SƯU TẬP TIÊU BIỂU
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F1B1C]">
              Thiết kế trang nhã cho mọi khoảnh khắc
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto">
              Tương thích mượt mà trên mọi thiết bị di động, máy tính bảng và màn hình máy tính.
            </p>
          </RevealSection>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 pt-4">
            {[
              {
                src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80',
                alt: 'Thiệp cưới phong cách Rustic Warm',
              },
              {
                src: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80',
                alt: 'Thiệp cưới phong cách Classic Minimal',
              },
              {
                src: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=400&q=80',
                alt: 'Thiệp cưới phong cách Golden Glamour',
              },
              {
                src: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=400&q=80',
                alt: 'Thiệp thôi nôi sinh nhật bé gái',
              },
              {
                src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80',
                alt: 'Thiệp mừng tân gia sang trọng',
              },
              {
                src: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=400&q=80',
                alt: 'Thiệp kỷ niệm sự kiện gia đình',
              },
            ].map((item, idx) => (
              <RevealSection key={idx} delay={idx * 0.06}>
                <div className="relative aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-[#EAE4DF] group">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </RevealSection>
            ))}
          </div>

          <div className="pt-4">
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <span>Xem tất cả mẫu thiệp trong thư viện</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          PRICING PLANS SECTION
          ============================================================ */}
      <section id="pricing" className="py-20 bg-[#FFFDF9] relative">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-12">
          <RevealSection>
            <span className="text-xs font-bold uppercase tracking-widest text-primary">
              BẢNG GIÁ MINH BẠCH
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#1F1B1C] mt-2">
              Bảng giá <span className="text-primary italic">gói dịch vụ</span>
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-xl mx-auto mt-2">
              Lựa chọn gói dịch vụ phù hợp để tạo ra website thiệp mời ấn tượng nhất cho ngày trọng đại.
            </p>
          </RevealSection>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Free Plan */}
            <RevealSection delay={0}>
              <Card hoverEffect className="p-8 space-y-6 flex flex-col justify-between h-full">
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-bold text-[#1F1B1C]">Free Plan</h3>
                  <div className="text-3xl font-bold text-secondary">Miễn phí</div>
                  <Link href="/register" className="w-full block">
                    <Button variant="secondary" size="md" className="w-full">
                      Tạo tài khoản miễn phí ✨
                    </Button>
                  </Link>
                  <div className="border-t border-[#FAF7F5] pt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="font-semibold text-[#1F1B1C]">Tính năng gói:</div>
                    <div>• Giới hạn hình ảnh: 10 ảnh</div>
                    <div>• Giới hạn thiệp mời: 1 thiệp</div>
                    <div>• Giới hạn lượt xem: 300 lượt</div>
                    <div>• Phản hồi RSVP cơ bản</div>
                  </div>
                </div>
              </Card>
            </RevealSection>

            {/* Basic Plan */}
            <RevealSection delay={0.1}>
              <Card hoverEffect className="p-8 border-2 border-primary space-y-6 flex flex-col justify-between relative shadow-lg h-full">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-primary text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Lựa chọn phổ biến
                </span>
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-bold text-[#1F1B1C]">Basic Plan</h3>
                  <div>
                    <div className="text-3xl font-bold text-primary flex items-center gap-2">
                      169,000đ <Badge variant="danger">-43%</Badge>
                    </div>
                    <div className="text-xs text-gray-400 line-through mt-0.5">299,000đ</div>
                  </div>
                  <Link href="/register" className="w-full block">
                    <Button variant="primary" size="md" className="w-full">
                      Nâng cấp Basic Plan ngay ✨
                    </Button>
                  </Link>
                  <div className="border-t border-[#FAF7F5] pt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="font-semibold text-[#1F1B1C]">Tính năng gói:</div>
                    <div>• Giới hạn hình ảnh: 50 ảnh</div>
                    <div>• Không giới hạn lượt xem</div>
                    <div>• Mã QR Code cá nhân hóa</div>
                    <div>• Bản đồ Google Maps &amp; Chỉ đường</div>
                  </div>
                </div>
              </Card>
            </RevealSection>

            {/* Premium Plan */}
            <RevealSection delay={0.2}>
              <Card hoverEffect className="p-8 space-y-6 flex flex-col justify-between relative border border-accent/40 h-full">
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-[11px] font-bold uppercase tracking-wider shadow-sm">
                  Đầy đủ tính năng
                </span>
                <div className="space-y-4">
                  <h3 className="text-2xl font-serif font-bold text-[#1F1B1C]">Premium Plan</h3>
                  <div>
                    <div className="text-3xl font-bold text-accent flex items-center gap-2">
                      269,000đ <Badge variant="warning">-46%</Badge>
                    </div>
                    <div className="text-xs text-gray-400 line-through mt-0.5">499,000đ</div>
                  </div>
                  <Link href="/register" className="w-full block">
                    <Button variant="luxury" size="md" className="w-full">
                      Nâng cấp Premium Plan ngay ✨
                    </Button>
                  </Link>
                  <div className="border-t border-[#FAF7F5] pt-4 space-y-2 text-xs text-muted-foreground">
                    <div className="font-semibold text-[#1F1B1C]">Tính năng gói:</div>
                    <div>• Giới hạn hình ảnh: 100 ảnh</div>
                    <div>• Không giới hạn lượt xem</div>
                    <div>• Nhạc nền MP3 tự chọn</div>
                    <div>• Sổ lưu bút &amp; Chữ ký số</div>
                    <div>• Hỗ trợ ưu tiên 24/7</div>
                  </div>
                </div>
              </Card>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ============================================================
          FAQ SECTION
          ============================================================ */}
      <section className="py-20 bg-[#FAF7F5] relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <RevealSection className="text-center space-y-3">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
              GIẢI ĐÁP NHANH
            </span>
            <h2 className="text-3xl sm:text-5xl font-serif font-bold text-[#1F1B1C]">
              Câu hỏi <span className="text-primary italic font-serif font-normal">thường gặp</span>
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto font-normal leading-relaxed">
              Những thắc mắc phổ biến nhất khi bắt đầu sử dụng thiệp online.
            </p>
          </RevealSection>

          <div className="space-y-3.5">
            {LANDING_FAQ.map((item, idx) => (
              <RevealSection key={idx} delay={idx * 0.06}>
                <details className="group bg-white rounded-2xl border border-[#EAE4DF] p-6 [&_summary::-webkit-details-marker]:hidden open:border-primary/50 transition-all shadow-sm">
                  <summary className="flex items-center justify-between cursor-pointer font-serif font-bold text-base sm:text-lg text-[#1F1B1C] group-hover:text-primary transition-colors tracking-tight">
                    <span className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-rose-50 text-primary text-xs font-sans font-bold flex items-center justify-center flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span>{item.q}</span>
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground group-open:rotate-180 transition-transform ml-2 flex-shrink-0" />
                  </summary>
                  <div className="pt-4 mt-3 border-t border-[#FAF7F5] text-sm text-muted-foreground font-sans font-normal leading-relaxed pl-9">
                    {item.a}
                  </div>
                </details>
              </RevealSection>
            ))}
          </div>

          <div className="text-center pt-2">
            <Link
              href="/faq"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Xem toàn bộ danh sách câu hỏi thường gặp (FAQ)</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================================
          SUPPORT & COMMITMENT
          ============================================================ */}
      <section className="py-20 bg-[#FFFDF9]">
        <RevealSection className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Card className="p-8 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="space-y-2.5 p-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-primary flex items-center justify-center mx-auto border border-primary/20">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1F1B1C]">Giờ Làm Việc Hỗ Trợ</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Thứ 2 - Thứ 7: 08:00 - 18:00<br />
                Chủ Nhật: Hỗ trợ khẩn cấp qua ticket
              </p>
            </div>

            <div className="space-y-2.5 p-4 border-y md:border-y-0 md:border-x border-[#FAF7F5]">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-secondary flex items-center justify-center mx-auto border border-secondary/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1F1B1C]">Cam Kết Phản Hồi</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Phản hồi yêu cầu trong vòng 2 - 4 giờ làm việc. Cam kết minh bạch và tận tâm.
              </p>
            </div>

            <div className="space-y-2.5 p-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-accent flex items-center justify-center mx-auto border border-accent/20">
                <Mail className="w-5 h-5" />
              </div>
              <h3 className="font-serif font-bold text-base text-[#1F1B1C]">Liên Hệ Trực Tiếp</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Email: support@nhacotiec.vn<br />
                <Link href="/dashboard/support" className="text-primary font-semibold hover:underline">
                  Trung tâm trợ giúp
                </Link>
              </p>
            </div>
          </Card>
        </RevealSection>
      </section>

      {/* ============================================================
          COMPREHENSIVE LUXURY EDITORIAL FOOTER
          ============================================================ */}
      <footer className="py-14 bg-[#1F1B1C] text-[#FAF7F5]/70 text-xs border-t border-[#2F292B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-left">
            {/* Brand Column */}
            <div className="space-y-3.5">
              <div className="flex items-center gap-2.5 font-serif font-bold text-white text-xl">
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-primary to-[#E85B6A] text-white flex items-center justify-center">
                  <Heart className="w-3.5 h-3.5 fill-white text-white" />
                </div>
                <span>NHÀ CÓ TIỆC</span>
              </div>
              <p className="text-xs text-[#FAF7F5]/70 leading-relaxed">
                Nền tảng thiết kế &amp; quản lý thiệp mời online cao cấp tại Việt Nam. Cá nhân hóa từng khách mời, xác nhận RSVP tức thì.
              </p>
              <div className="text-[11px] text-accent">
                Email: support@nhacotiec.vn
              </div>
            </div>

            {/* Products Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-widest font-serif">
                Sản Phẩm
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/templates" className="hover:text-white transition-colors">
                    Mẫu thiệp đám cưới
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="hover:text-white transition-colors">
                    Mẫu thiệp sinh nhật
                  </Link>
                </li>
                <li>
                  <Link href="/templates" className="hover:text-white transition-colors">
                    Mẫu thiệp tân gia
                  </Link>
                </li>
                <li>
                  <Link href="/case-studies" className="hover:text-white transition-colors">
                    Case Studies thực tế
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="hover:text-white transition-colors">
                    Bảng giá dịch vụ
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-widest font-serif">
                Tài Nguyên
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/faq" className="hover:text-white transition-colors">
                    Câu hỏi thường gặp (FAQ)
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    Chính sách bảo mật
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard/support" className="hover:text-white transition-colors">
                    Trung tâm hỗ trợ
                  </Link>
                </li>
                <li>
                  <Link href="/swagger-ui" className="hover:text-white transition-colors">
                    API Documentation (v1.0)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Account & Admin Column */}
            <div className="space-y-3">
              <h4 className="font-bold text-white uppercase text-xs tracking-widest font-serif">
                Tài Khoản
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/login" className="hover:text-white transition-colors">
                    Đăng nhập người dùng
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Đăng ký tài khoản
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="hover:text-white transition-colors">
                    User Dashboard
                  </Link>
                </li>
                <li>
                  <Link href="/admin/login" className="hover:text-accent transition-colors text-gray-400">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2F292B] flex flex-col sm:flex-row items-center justify-between gap-4 text-[#FAF7F5]/50 text-[11px]">
            <p>© 2026 NHÀ CÓ TIỆC. Tất cả quyền được bảo lưu.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className="hover:text-white">
                Bảo mật
              </Link>
              <span>•</span>
              <Link href="/faq" className="hover:text-white">
                FAQ
              </Link>
              <span>•</span>
              <Link href="/case-studies" className="hover:text-white">
                Case Studies
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
