'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, ArrowRight, AlertCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth/auth-context';

function AdminLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/admin';
  const { login, logout } = useAuth();

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
      } else if (res.user) {
        if (res.user.role !== 'ADMIN') {
          await logout();
          router.push('/403');
        } else {
          router.push(redirectTo);
        }
      }
    } catch {
      setError('Đã xảy ra lỗi khi đăng nhập Admin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#292E2B] rounded-3xl border border-[#3A403C] shadow-2xl max-w-md w-full p-8 space-y-6 text-white">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-[#B76E79]/20 text-[#B76E79] flex items-center justify-center mx-auto mb-2 border border-[#B76E79]/40">
          <Shield className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-white tracking-wide">
          ADMIN CENTER
        </h1>
        <p className="text-xs text-gray-400">
          Hệ thống Quản Trị Nền Tảng NHÀ CÓ TIỆC
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800/80 flex items-center gap-2 text-rose-300 text-xs font-medium">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block font-semibold text-gray-300 mb-1">Email Quản Trị</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Nhập email quản trị"
              className="w-full pl-10 pr-4 py-2.5 bg-[#1F2421] border border-[#3A403C] rounded-xl text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block font-semibold text-gray-300 mb-1">Mật Khẩu Quản Trị</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-3 text-gray-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu quản trị"
              className="w-full pl-10 pr-4 py-2.5 bg-[#1F2421] border border-[#3A403C] rounded-xl text-xs text-white placeholder-gray-500 focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-[#B76E79] text-white font-semibold text-xs shadow-md hover:bg-[#a25b66] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          {loading ? 'Đang xác thực...' : 'Đăng Nhập Quản Trị'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="text-center text-xs text-gray-500 pt-2 border-t border-[#3A403C]">
        Bạn là người dùng thông thường?{' '}
        <Link href="/login" className="font-bold text-[#B76E79] hover:underline">
          Đăng nhập User
        </Link>
      </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-[#1F2421] flex items-center justify-center p-4 selection:bg-[#B76E79]">
      <Suspense fallback={<div className="text-xs text-gray-400">Đang tải...</div>}>
        <AdminLoginForm />
      </Suspense>
    </div>
  );
}
