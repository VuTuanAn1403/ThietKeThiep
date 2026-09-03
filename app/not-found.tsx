import React from 'react';
import Link from 'next/link';
import { Heart, Home, Sparkles, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: '404 — Không tìm thấy trang | NHÀ CÓ TIỆC',
  description: 'Trang bạn tìm không tồn tại hoặc đã được chuyển sang đường dẫn khác.',
};

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center px-4 text-center font-sans">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-[#e8dfd8] shadow-sm space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#e85d75]/10 text-[#e85d75] flex items-center justify-center mx-auto">
          <Heart className="w-8 h-8 fill-[#e85d75]" />
        </div>

        <div className="space-y-2">
          <span className="text-5xl sm:text-6xl font-serif font-bold text-[#e85d75]">404</span>
          <h1 className="text-2xl font-serif font-bold text-gray-900">
            Trang bạn tìm không tồn tại
          </h1>
          <p className="text-sm text-gray-600 leading-relaxed">
            Đường dẫn có thể bị gõ nhầm, thiệp đã đổi link hoặc trang đã được chuyển sang địa chỉ mới.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="px-6 py-3 rounded-full bg-[#e85d75] text-white font-semibold text-sm hover:bg-[#d64c64] transition-all shadow-md flex items-center justify-center gap-2"
          >
            <Home className="w-4 h-4" />
            Về trang chủ
          </Link>
          <Link
            href="/templates"
            className="px-6 py-3 rounded-full bg-white border border-[#e8dfd8] text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-[#e85d75]" />
            Xem mẫu thiệp
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
          NHÀ CÓ TIỆC — Nền tảng thiệp mời online
        </div>
      </div>
    </div>
  );
}
