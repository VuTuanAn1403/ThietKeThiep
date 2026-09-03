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
  Sparkles,
} from 'lucide-react';

export function NavAuth() {
  const { user, role, loading, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-20 bg-gray-100/80 animate-pulse rounded-full" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2.5">
        <Link
          href="/login"
          className="px-4 py-2 rounded-full text-xs font-medium text-[#756B70] hover:text-[#E85B6A] hover:bg-black/5 transition-all"
        >
          Đăng nhập
        </Link>
        <Link
          href="/register"
          className="px-5 py-2.5 rounded-full btn-luxury-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
        >
          <span>Tạo thiệp ngay</span>
          <Sparkles className="w-3.5 h-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="relative flex items-center gap-3">
      {role === 'ADMIN' ? (
        <Link
          href="/admin"
          className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#1F1B1C] text-[#C5A880] border border-[#C5A880]/30 text-xs font-semibold shadow-sm hover:bg-[#2F292B] transition-all"
        >
          <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
          <span>Admin Center</span>
        </Link>
      ) : null}

      <Link
        href="/dashboard"
        className="px-4 py-2 rounded-full btn-luxury-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
      >
        <LayoutDashboard className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">Vào</span> Dashboard
      </Link>

      {/* User Dropdown Toggle */}
      <div className="relative">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-1.5 p-1 rounded-full border border-[#EAE4DF] bg-white/90 hover:bg-white hover:border-[#D98B93] transition-all shadow-sm cursor-pointer"
          aria-label="User menu"
        >
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#E85B6A]/15 to-[#C5A880]/20 text-[#E85B6A] font-bold flex items-center justify-center text-xs overflow-hidden border border-[#E85B6A]/20">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name || 'User'} className="w-full h-full object-cover" />
            ) : (
              user.full_name?.charAt(0) || 'U'
            )}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-[#756B70] pr-0.5" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-60 bg-white/95 backdrop-blur-xl border border-[#EAE4DF] rounded-2xl shadow-floating py-2.5 z-50 text-xs text-left animate-in fade-in zoom-in-95 duration-150">
            <div className="px-4 py-2.5 border-b border-[#FAF7F5]">
              <div className="font-semibold text-[#1F1B1C] truncate text-sm">{user.full_name || 'Khách hàng'}</div>
              <div className="text-[11px] text-[#756B70] truncate mt-0.5">{user.email}</div>
              <div className="mt-2">
                <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-full ${role === 'ADMIN' ? 'bg-[#C5A880]/15 text-[#8C6D40] border border-[#C5A880]/30' : 'bg-[#FAF7F5] text-[#E85B6A] border border-[#EAE4DF]'}`}>
                  {role === 'ADMIN' ? 'QUẢN TRỊ VIÊN' : 'THÀNH VIÊN'}
                </span>
              </div>
            </div>

            <div className="py-1">
              {role === 'ADMIN' && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FAF7F5] text-[#8C6D40] font-semibold transition-colors"
                >
                  <Shield className="w-3.5 h-3.5 text-[#C5A880]" />
                  <span>Trang Quản Trị (Admin)</span>
                </Link>
              )}

              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FAF7F5] text-[#1F1B1C] font-medium transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5 text-[#756B70]" />
                <span>Trang tổng quan</span>
              </Link>

              <Link
                href="/templates"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FAF7F5] text-[#1F1B1C] font-medium transition-colors"
              >
                <LayoutTemplate className="w-3.5 h-3.5 text-[#756B70]" />
                <span>Mẫu thiệp yêu thích</span>
              </Link>

              <Link
                href="/dashboard/account"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FAF7F5] text-[#1F1B1C] font-medium transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#756B70]" />
                <span>Cài đặt tài khoản</span>
              </Link>

              <Link
                href="/dashboard/feedback"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FAF7F5] text-[#1F1B1C] font-medium transition-colors"
              >
                <MessageSquarePlus className="w-3.5 h-3.5 text-[#756B70]" />
                <span>Chia sẻ góp ý</span>
              </Link>
            </div>

            <div className="border-t border-[#FAF7F5] my-1" />

            <button
              onClick={async () => {
                setMenuOpen(false);
                await logout();
              }}
              className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-rose-50/80 text-rose-600 font-semibold transition-colors cursor-pointer"
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
