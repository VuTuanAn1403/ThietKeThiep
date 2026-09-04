'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { HeartCrack, RefreshCw, Home } from 'lucide-react';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export default function InvitationErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const slug = params?.slug as string | undefined;

  useEffect(() => {
    ErrorMonitoring.captureException(error, {
      route: `/i/${slug || 'unknown'}`,
      classification: 'UNEXPECTED_CLIENT_ERROR',
      extra: {
        invitationSlug: slug,
        digest: error.digest,
      },
    });
  }, [error, slug]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1F1B1C] flex items-center justify-center p-6 font-serif">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#EAE4DF] shadow-xl">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#B76E79] flex items-center justify-center mx-auto border border-rose-100 shadow-inner">
          <HeartCrack className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="font-bold text-2xl sm:text-3xl text-[#1F1B1C]">
            Không thể tải thiệp mời
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-sans leading-relaxed">
            Đã xảy ra sự cố khi hiển thị thông tin thiệp mời này. Vui lòng thử tải lại trang hoặc kiểm tra lại đường dẫn chia sẻ.
          </p>
        </div>

        {error.digest && (
          <div className="text-[11px] text-stone-400 font-mono bg-stone-50 py-1.5 px-3 rounded-lg border border-stone-100">
            Mã tham chiếu: {error.digest}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-3 font-sans">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full bg-[#B76E79] text-white text-xs font-semibold hover:bg-[#A25B66] transition-all flex items-center gap-1.5 shadow-md active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Tải lại trang</span>
          </button>
          <Link
            href="/"
            className="px-5 py-2.5 rounded-full bg-[#FAF7F5] border border-[#EAE4DF] text-xs font-semibold text-[#1F1B1C] hover:bg-[#F4EFEB] transition-all flex items-center gap-1.5 active:scale-95"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Trang chủ</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
