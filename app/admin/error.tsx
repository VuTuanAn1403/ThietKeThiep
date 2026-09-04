'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { ShieldAlert, RefreshCw, LayoutDashboard } from 'lucide-react';
import { ErrorMonitoring } from '@/lib/monitoring/sentry';

export default function AdminErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    ErrorMonitoring.captureException(error, {
      route: '/admin',
      role: 'ADMIN',
      classification: 'INTERNAL_SERVER_ERROR',
      extra: { digest: error.digest },
    });
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6 bg-white p-8 rounded-3xl border border-[#EAE4DF] shadow-md">
        <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
          <ShieldAlert className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h2 className="font-serif font-bold text-2xl text-[#1F1B1C]">
            Lỗi Trang Quản Trị
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hệ thống Admin Control Center không thể tải dữ liệu mô-đun này. Sự cố đã được chuyển tiếp đến hệ thống giám sát Sentry.
          </p>
        </div>

        {error.digest && (
          <div className="text-[11px] text-gray-400 font-mono bg-gray-50 py-1.5 px-3 rounded-lg border border-gray-100">
            Error ID: {error.digest}
          </div>
        )}

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="px-5 py-2.5 rounded-full bg-[#1F1B1C] text-[#FAF7F5] text-xs font-semibold hover:bg-[#332C2E] transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Thử lại</span>
          </button>
          <Link
            href="/admin"
            className="px-5 py-2.5 rounded-full bg-[#FAF7F5] border border-[#EAE4DF] text-xs font-semibold text-[#1F1B1C] hover:bg-[#F4EFEB] transition-all flex items-center gap-1.5"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Tổng quan Admin</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
