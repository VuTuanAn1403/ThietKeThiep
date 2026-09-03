'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, AlertCircle, CheckCircle2, Heart, ArrowLeft, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { mockStore } from '@/lib/supabase/mock-store';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient();
        const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${origin}/reset-password`,
        });

        if (resetError) {
          setError(resetError.message || 'Không thể gửi email khôi phục. Vui lòng kiểm tra lại địa chỉ email.');
          setLoading(false);
          return;
        }
      } else {
        // Standalone verification: check if user exists in database/store
        const found = mockStore.users.find(u => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!found) {
          setError('Không tìm thấy tài khoản với địa chỉ email này.');
          setLoading(false);
          return;
        }
      }

      setSent(true);
    } catch {
      setError('Đã xảy ra lỗi khi gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] border border-[#e8dfd8] shadow-xl max-w-md w-full p-8 space-y-6">
        <div className="text-left space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-serif font-bold text-[#e85d75]">
            <Heart className="w-5 h-5 fill-[#e85d75]" /> NHÀ CÓ TIỆC
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 pt-2">
            Khôi phục mật khẩu 🔐
          </h1>
          <p className="text-xs text-gray-500">
            Nhập email của bạn để nhận liên kết thiết lập lại mật khẩu an toàn.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {sent ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-800">Đã gửi hướng dẫn</h3>
            <p className="text-xs text-emerald-700">
              Chúng tôi đã gửi email hướng dẫn khôi phục mật khẩu đến <strong>{email}</strong>. Vui lòng kiểm tra hộp thư đến.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/reset-password"
                className="inline-block px-5 py-2.5 rounded-xl bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-all shadow-sm"
              >
                Chuyển đến trang Đặt lại mật khẩu (Demo)
              </Link>
              <Link
                href="/login"
                className="inline-block px-5 py-2 rounded-xl text-gray-600 text-xs font-semibold hover:bg-gray-100"
              >
                Quay lại Đăng nhập
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Email đăng ký</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-2xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Đang gửi yêu cầu...
                </>
              ) : (
                <>
                  Gửi liên kết khôi phục
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <Link href="/login" className="inline-flex items-center gap-1 font-bold text-gray-700 hover:text-[#e85d75]">
            <ArrowLeft className="w-3.5 h-3.5" /> Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
