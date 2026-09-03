'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Heart, CheckCircle2, ArrowLeft, Home, Sparkles, MessageSquareHeart } from 'lucide-react';

function ThankYouContent() {
  const searchParams = useSearchParams();
  const type = searchParams.get('type') || 'rsvp';
  const slug = searchParams.get('slug');
  const guestName = searchParams.get('guest');

  let title = 'Cảm ơn bạn đã xác nhận tham dự ❤️';
  let message = 'Phản hồi của bạn đã được gửi thành công đến cô dâu & chú rể. Sự hiện diện của bạn là niềm vinh hạnh lớn nhất!';
  let icon = <CheckCircle2 className="w-12 h-12 text-emerald-500" />;

  if (type === 'wish') {
    title = 'Cảm ơn lời chúc tốt đẹp của bạn! ✨';
    message = 'Lời chúc ý nghĩa của bạn đã được lưu lại trong sổ lưu bút và sẽ được hiển thị trên trang thiệp.';
    icon = <MessageSquareHeart className="w-12 h-12 text-[#e85d75]" />;
  } else if (type === 'feedback') {
    title = 'Cảm ơn bạn đã đóng góp ý kiến! 💌';
    message = 'Chúng tôi rất trân trọng phản hồi của bạn để ngày càng hoàn thiện nền tảng NHÀ CÓ TIỆC tốt hơn.';
    icon = <Sparkles className="w-12 h-12 text-amber-500" />;
  }

  return (
    <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#e8dfd8] shadow-lg text-center space-y-6">
      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto shadow-inner">
        {icon}
      </div>

      <div className="space-y-2">
        {guestName && (
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-50 text-[#e85d75]">
            Khách mời: {guestName}
          </span>
        )}
        <h1 className="text-2xl font-serif font-bold text-gray-900 mt-2">{title}</h1>
        <p className="text-sm text-gray-600 leading-relaxed">{message}</p>
      </div>

      <div className="pt-4 flex flex-col gap-3">
        {slug ? (
          <Link
            href={`/i/${slug}`}
            className="w-full py-3.5 px-4 rounded-full bg-[#e85d75] text-white font-semibold text-sm hover:bg-[#d64c64] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại thiệp
          </Link>
        ) : (
          <Link
            href="/"
            className="w-full py-3.5 px-4 rounded-full bg-[#e85d75] text-white font-semibold text-sm hover:bg-[#d64c64] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Về trang chủ Nhà Có Tiệc
          </Link>
        )}

        <Link
          href="/templates"
          className="w-full py-3 px-4 rounded-full bg-white border border-[#e8dfd8] text-gray-700 font-semibold text-xs hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#e85d75]" />
          Khám phá tạo thiệp online miễn phí
        </Link>
      </div>

      <div className="pt-2 text-[11px] text-gray-400">
        NHÀ CÓ TIỆC — Giải pháp thiệp cưới & sự kiện online
      </div>
    </div>
  );
}

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center px-4 py-12 font-sans selection:bg-[#e85d75]/20">
      <Suspense
        fallback={
          <div className="max-w-md w-full bg-white rounded-3xl p-10 border border-[#e8dfd8] text-center">
            <Heart className="w-8 h-8 text-[#e85d75] animate-pulse mx-auto" />
            <p className="text-sm text-gray-500 mt-3">Đang tải...</p>
          </div>
        }
      >
        <ThankYouContent />
      </Suspense>
    </div>
  );
}
