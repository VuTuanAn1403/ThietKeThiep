'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle, Heart, ArrowRight, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError('Mật khẩu mới phải có tối thiểu 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      if (supabaseUrl && !supabaseUrl.includes('placeholder')) {
        const supabase = createClient();
        const { error: updateError } = await supabase.auth.updateUser({
          password: password,
        });

        if (updateError) {
          setError(updateError.message || 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ.');
          setLoading(false);
          return;
        }
      }

      setSuccess(true);
    } catch {
      setError('Đã xảy ra lỗi khi cập nhật mật khẩu. Vui lòng thử lại.');
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
            Đặt lại mật khẩu mới 🔒
          </h1>
          <p className="text-xs text-gray-500">
            Vui lòng nhập mật khẩu mới bảo mật cho tài khoản của bạn.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success ? (
          <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-bold text-emerald-800">Đặt lại mật khẩu thành công!</h3>
            <p className="text-xs text-emerald-700">
              Mật khẩu tài khoản của bạn đã được cập nhật an toàn. Bạn có thể đăng nhập ngay bằng mật khẩu mới.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 mt-3 px-6 py-2.5 rounded-xl bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-all shadow-md"
            >
              Đăng nhập ngay <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập ít nhất 6 ký tự"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1">Xác nhận mật khẩu mới</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                  className="w-full pl-10 pr-10 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
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
                  Đang lưu mật khẩu...
                </>
              ) : (
                <>
                  Xác nhận đổi mật khẩu
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          <Link href="/login" className="font-bold text-gray-700 hover:text-[#e85d75]">
            Quay lại trang Đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
}
