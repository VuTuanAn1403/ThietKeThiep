'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, AlertCircle, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
      <div className="bg-white rounded-[32px] border border-[#e8dfd8] shadow-xl max-w-md w-full p-8 space-y-6">
        <div className="text-left space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-serif font-bold text-[#e85d75]">
            <Heart className="w-5 h-5 fill-[#e85d75]" /> NHÀ CÓ TIỆC
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 pt-2">
            Tạo tài khoản <span className="text-2xl">👋</span>
          </h1>
          <p className="text-xs text-gray-500">
            Tạo thiệp cưới online miễn phí, đẹp mắt trong vài phút.
          </p>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Họ và tên</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ví dụ: Nguyễn Văn A"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Mật khẩu (tối thiểu 6 ký tự)</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Xác nhận mật khẩu</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="rounded border-[#e8dfd8] text-[#e85d75] focus:ring-[#e85d75]"
            />
            <label htmlFor="terms" className="text-[11px] text-gray-600">
              Tôi đồng ý với{' '}
              <Link href="/privacy" className="text-[#e85d75] hover:underline font-semibold">
                Điều khoản & Chính sách bảo mật
              </Link>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-2xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
          Đã có tài khoản?{' '}
          <Link href="/login" className="font-bold text-[#e85d75] hover:underline">
            Đăng nhập ngay
          </Link>
        </div>
      </div>
    </div>
  );
}
