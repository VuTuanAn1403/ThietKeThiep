'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, LayoutDashboard } from 'lucide-react';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export default function DashboardErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    ErrorMonitoring.captureException(error, {
      route: '/dashboard',
      classification: 'INTERNAL_SERVER_ERROR',
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-[#EAE4DF] shadow-md">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-primary flex items-center justify-center mx-auto border border-primary/20">
          <AlertCircle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-[#1F1B1C]">
            Không thể tải nội dung
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Đã xảy ra sự cố khi tải trang Dashboard. Vui lòng kiểm tra lại kết nối mạng hoặc thử lại.
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
            className="px-5 py-2.5 rounded-full btn-luxury-primary text-white text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded-full bg-[#FAF7F5] border border-[#EAE4DF] text-xs font-semibold text-[#1F1B1C] hover:bg-[#F4EFEB] transition-all flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Về Dashboard</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
