'use client';

import React, { useEffect } from 'react';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    ErrorMonitoring.captureException(error, {
      route: 'global',
      classification: 'INTERNAL_SERVER_ERROR',
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <html lang="vi">
      <body className="min-h-screen bg-[#FFFDF9] text-[#1F1B1C] flex items-center justify-center p-6 font-sans">
        <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-[#EAE4DF] shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200 font-bold text-xl">
            !
          </div>
          <div className="space-y-2">
            <h1 className="font-serif font-bold text-2xl text-[#1F1B1C]">
              Lỗi ứng dụng nghiêm trọng
            </h1>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ứng dụng gặp sự cố không thể khôi phục tự động. Vui lòng làm mới trang.
            </p>
          </div>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-full bg-[#B76E79] text-white text-xs font-semibold hover:bg-[#A25B66] transition-all cursor-pointer shadow-sm"
          >
            Tải lại ứng dụng
          </button>
        </div>
      </body>
    </html>
  );
}
