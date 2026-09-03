'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Heart, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.error) {
        setError(res.error);
      } else {
        router.push(redirectTo);
      }
    } catch {
      setError('Đã xảy ra lỗi khi đăng nhập.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1F1B1C] via-[#2F292B] to-[#1F1B1C] items-center justify-center p-12">
        {/* Decorative background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-64 h-64 bg-[#E85B6A] rounded-full blur-[120px]" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-[#C5A880] rounded-full blur-[100px]" />
        </div>

        <div className="relative z-10 max-w-md space-y-8 text-center">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#E85B6A] to-[#F27B88] text-white flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 fill-white" />
            </div>
          </div>
          <h2 className="text-4xl font-serif font-bold text-white leading-tight">
            Chào mừng bạn đến<br />
            <span className="text-[#E85B6A]">NHÀ CÓ TIỆC</span>
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Nền tảng tạo thiệp mời online cao cấp. Thiết kế trang nhã, gửi lời mời trang trọng và quản lý khách mời thông minh.
          </p>
          <div className="flex items-center justify-center gap-6 text-xs text-white/40">
            <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Premium Templates</span>
            <span>•</span>
            <span>RSVP Tức Thì</span>
            <span>•</span>
            <span>VietQR</span>
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md space-y-7">
          {/* Mobile brand */}
          <div className="lg:hidden mb-4">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-serif font-bold text-[#E85B6A]">
              <Heart className="w-5 h-5 fill-[#E85B6A]" /> NHÀ CÓ TIỆC
            </Link>
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-[#1F1B1C]">
              Đăng nhập <span className="text-2xl">👋</span>
            </h1>
            <p className="text-sm text-[#756B70]">
              Đăng nhập để quản lý thiệp mời online và danh sách khách của bạn.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-[#1F1B1C] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756B70]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Nhập email của bạn"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:ring-2 focus:ring-[#E85B6A] focus:border-[#E85B6A] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-[#1F1B1C]">Mật khẩu</label>
                <Link href="/forgot-password" className="text-xs text-[#E85B6A] font-medium hover:underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756B70]" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu"
                  className="w-full pl-10 pr-4 py-3 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:ring-2 focus:ring-[#E85B6A] focus:border-[#E85B6A] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-3d-primary text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Đang xử lý...' : 'Đăng nhập'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-[#EAE4DF]"></div>
            <span className="flex-shrink mx-4 text-[#756B70] text-xs">Hoặc</span>
            <div className="flex-grow border-t border-[#EAE4DF]"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={handleSubmit}
              className="py-2.5 border border-[#EAE4DF] rounded-xl flex items-center justify-center gap-2 hover:bg-[#FAF7F5] transition-colors text-sm font-medium text-[#1F1B1C]"
            >
              <span className="font-bold text-blue-600">G</span> Google
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="py-2.5 border border-[#EAE4DF] rounded-xl flex items-center justify-center gap-2 hover:bg-[#FAF7F5] transition-colors text-sm font-medium text-blue-700"
            >
              <span className="font-bold">f</span> Facebook
            </button>
          </div>

          <div className="text-center text-sm text-[#756B70] pt-2">
            Chưa có tài khoản?{' '}
            <Link href="/register" className="font-bold text-[#E85B6A] hover:underline">
              Đăng ký ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDFB] flex items-center justify-center text-sm text-[#756B70]">Đang tải...</div>}>
      <LoginForm />
    </Suspense>
  );
}
