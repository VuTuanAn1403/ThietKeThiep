'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, AlertCircle, Heart, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';
import { GoogleAuthButton } from '@/components/auth/GoogleAuthButton';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const errorParam = searchParams.get('error');
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (errorParam === 'oauth_failed') {
      setError('Đăng ký bằng Google không thành công. Vui lòng thử lại.');
    } else if (errorParam === 'oauth_denied') {
      setError('Bạn đã từ chối cấp quyền từ tài khoản Google.');
    } else if (errorParam === 'account_suspended') {
      setError('Tài khoản này đang bị tạm khóa. Vui lòng liên hệ quản trị viên.');
    }
  }, [errorParam]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!agreeTerms) {
      setError('Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({ fullName, email, password, confirmPassword });
      if (res.error) {
        setError(res.error);
      } else {
        router.push('/dashboard');
      }
    } catch {
      setError('Đã xảy ra lỗi khi đăng ký.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex">
      {/* Left — Branding Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-[#1F1B1C] via-[#2F292B] to-[#1F1B1C] items-center justify-center p-12">
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
            Khởi tạo thiệp cưới<br />
            <span className="text-[#E85B6A]">hoàn toàn miễn phí</span>
          </h2>
          <p className="text-sm text-white/60 leading-relaxed">
            Tham gia cùng hàng nghìn cặp đôi tạo nên những tấm thiệp mời trực tuyến lãng mạn, hiện đại và sang trọng.
          </p>
          <div className="space-y-3 text-left bg-white/5 border border-white/10 rounded-2xl p-5 text-xs text-white/70">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#8FA79B] flex-shrink-0" />
              <span>Miễn phí 1 thiệp cưới với đầy đủ tính năng cơ bản</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#8FA79B] flex-shrink-0" />
              <span>Xác nhận tham dự (RSVP) & Sổ lưu bút tự động</span>
            </div>
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-[#8FA79B] flex-shrink-0" />
              <span>Tạo mã VietQR nhận quà mừng an toàn trực tiếp</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Register Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile brand */}
          <div className="lg:hidden mb-2">
            <Link href="/" className="inline-flex items-center gap-2 text-xl font-serif font-bold text-[#E85B6A]">
              <Heart className="w-5 h-5 fill-[#E85B6A]" /> NHÀ CÓ TIỆC
            </Link>
          </div>

          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FAF7F5] text-[#E85B6A] text-[11px] font-bold border border-[#EAE4DF]">
              <Sparkles className="w-3 h-3" /> Đăng ký tài khoản mới
            </div>
            <h1 className="text-3xl font-bold text-[#1F1B1C]">
              Tạo tài khoản <span className="text-2xl">✨</span>
            </h1>
            <p className="text-sm text-[#756B70]">
              Tạo thiệp cưới online miễn phí, đẹp mắt trong vài phút.
            </p>
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Google OAuth Register */}
          <div className="space-y-4">
            <GoogleAuthButton redirectTo="/dashboard" onError={(err) => setError(err)} />

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#EAE4DF] w-full" />
              <span className="bg-[#FFFDFB] px-3 text-[11px] font-semibold text-[#756B70] uppercase tracking-wider select-none absolute">
                hoặc
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#1F1B1C] mb-1.5">Họ và tên</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756B70]" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:ring-2 focus:ring-[#E85B6A] focus:border-[#E85B6A] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F1B1C] mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756B70]" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:ring-2 focus:ring-[#E85B6A] focus:border-[#E85B6A] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F1B1C] mb-1.5">Mật khẩu (tối thiểu 6 ký tự)</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756B70]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:ring-2 focus:ring-[#E85B6A] focus:border-[#E85B6A] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#1F1B1C] mb-1.5">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#756B70]" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:ring-2 focus:ring-[#E85B6A] focus:border-[#E85B6A] focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-[#EAE4DF] text-[#E85B6A] focus:ring-[#E85B6A] w-4 h-4"
              />
              <label htmlFor="terms" className="text-xs text-[#756B70]">
                Tôi đồng ý với{' '}
                <Link href="/privacy" className="text-[#E85B6A] hover:underline font-semibold">
                  Điều khoản & Chính sách bảo mật
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl btn-3d-primary text-white font-semibold text-sm flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:transform-none"
            >
              {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-sm text-[#756B70] pt-2 border-t border-[#EAE4DF]">
            Đã có tài khoản?{' '}
            <Link href="/login" className="font-bold text-[#E85B6A] hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDFB]" />}>
      <RegisterForm />
    </Suspense>
  );
}
