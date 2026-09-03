'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';
import {
  LayoutDashboard,
  Shield,
  LogOut,
  User,
  ChevronDown,
  LayoutTemplate,
  MessageSquarePlus,
} from 'lucide-react';

export function NavAuth() {
  const { user, role, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-gray-100 animate-pulse rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:text-[#e85d75] transition-colors"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="px-5 py-2.5 rounded-full bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-all shadow-md"
        >
          Đăng ký
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-3">
      {role === 'ADMIN' ? (
        <Link
          href="/admin"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1F2421] text-amber-300 border border-amber-500/30 text-xs font-bold shadow-sm hover:bg-[#2F3531] transition-all"
        >
          <Shield className="w-3.5 h-3.5 text-amber-400" />
          Admin Center
        </Link>
      ) : null}

      <Link
        href="/dashboard"
        className="px-4 py-2 rounded-full bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-all shadow-md flex items-center gap-1.5"
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Vào</span> Dashboard
      </Link>

      {/* User Dropdown Toggle */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 p-1 rounded-full border border-[#e8dfd8] bg-white hover:bg-gray-50 transition-colors shadow-sm cursor-pointer"
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full bg-[#e85d75]/10 text-[#e85d75] font-bold flex items-center justify-center text-xs overflow-hidden">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
            ) : (
              user.full_name?.charAt(0) || 'U'
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-500 pr-0.5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-[#e8dfd8] rounded-2xl shadow-xl py-2 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-100">
            <div className="px-4 py-2 border-b border-gray-100">
              <div className="font-bold text-gray-900 truncate">{user.full_name || 'Khách hàng'}</div>
              <div className="text-[11px] text-gray-500 truncate">{user.email}</div>
              <div className="mt-1">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${role === 'ADMIN' ? 'bg-amber-100 text-amber-800' : 'bg-rose-50 text-[#e85d75]'}`}>
                  {role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
                </span>
              </div>
            </div>

            {role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-amber-50 text-amber-900 font-semibold"
              >
                <Shield className="w-3.5 h-3.5 text-amber-600" />
                <span>Trang Quản Trị (Admin)</span>
              </Link>
            )}

            <Link
              href="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 font-medium"
            >
              <LayoutDashboard className="w-3.5 h-3.5 text-gray-500" />
              <span>Trang tổng quan</span>
            </Link>

            <Link
              href="/templates"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 font-medium"
            >
              <LayoutTemplate className="w-3.5 h-3.5 text-gray-500" />
              <span>Mẫu thiệp yêu thích</span>
            </Link>

            <Link
              href="/dashboard/account"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 font-medium"
            >
              <User className="w-3.5 h-3.5 text-gray-500" />
              <span>Cài đặt tài khoản</span>
            </Link>

            <Link
              href="/dashboard/feedback"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-gray-50 text-gray-700 font-medium"
            >
              <MessageSquarePlus className="w-3.5 h-3.5 text-gray-500" />
              <span>Chia sẻ góp ý</span>
            </Link>

            <div className="border-t border-gray-100 my-1" />

            <button
              onClick={async () => {
                setMenuOpen(false);
                await logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-rose-50 text-rose-600 font-semibold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
