'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, ArrowRight, AlertCircle, Heart } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const { login } = useAuth();

  const [email, setEmail] = useState('minh.anh@gmail.com');
  const [password, setPassword] = useState('123456');
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
    <div className="bg-white rounded-[32px] border border-[#e8dfd8] shadow-xl max-w-md w-full p-8 space-y-6">
      <div className="text-left space-y-2">
        <Link href="/" className="inline-flex items-center gap-2 text-xl font-serif font-bold text-[#e85d75]">
          <Heart className="w-5 h-5 fill-[#e85d75]" /> NHÀ CÓ TIỆC
        </Link>
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2 pt-2">
          Đăng nhập <span className="text-2xl">👋</span>
        </h1>
        <p className="text-xs text-gray-500">
          Đăng nhập để quản lý thiệp mời online và danh sách khách của bạn.
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
          <label className="block font-semibold text-gray-800 mb-1">Email</label>
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

        <div>
          <label className="block font-semibold text-gray-800 mb-1">Mật khẩu</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? 'Đang xử lý...' : 'Đăng nhập'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="relative flex py-1 items-center">
        <div className="flex-grow border-t border-gray-200"></div>
        <span className="flex-shrink mx-4 text-gray-400 text-[11px]">Hoặc</span>
        <div className="flex-grow border-t border-gray-200"></div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
        <button
          type="button"
          onClick={handleSubmit}
          className="py-2.5 border border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
        >
          <span className="font-bold text-blue-600">G</span> Google
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          className="py-2.5 border border-gray-200 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors text-blue-700"
        >
          <span className="font-bold">f</span> Facebook
        </button>
      </div>

      <div className="text-center text-xs text-gray-500 pt-2">
        Chưa có tài khoản?{' '}
        <Link href="/register" className="font-bold text-[#e85d75] hover:underline">
          Đăng ký ngay
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#fdfbf7] flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-xs text-gray-400">Đang tải...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
