import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-serif font-bold text-gray-900">403 — Không Có Quyền Truy Cập</h1>
      <p className="text-sm text-gray-600 mt-2 max-w-md">
        Bạn không có quyền quản trị viên hoặc quyền hạn phù hợp để truy cập vào tài nguyên này.
      </p>
      <div className="mt-6 flex items-center gap-3">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 rounded-xl bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-colors"
        >
          Về Dashboard
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Trang Chủ
        </Link>
      </div>
    </div>
  );
}
