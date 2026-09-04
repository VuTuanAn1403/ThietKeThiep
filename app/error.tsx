'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export default function RootErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    ErrorMonitoring.captureException(error, {
      route: typeof window !== 'undefined' ? window.location.pathname : 'root',
      classification: 'INTERNAL_SERVER_ERROR',
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1F1B1C] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-[#EAE4DF] shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="font-serif font-bold text-2xl sm:text-3xl text-[#1F1B1C]">
            Đã có sự cố xảy ra
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Hệ thống gặp lỗi không mong muốn khi tải trang này. Thông tin lỗi đã được ghi lại an toàn để đội ngũ kỹ thuật xử lý.
          </p>
        </div>

        {error.digest && (
          <div className="text-[11px] text-gray-400 font-mono bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100">
            Mã lỗi: {error.digest}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-all flex items-center gap-1.5 shadow-sm active:scale-95 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
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
