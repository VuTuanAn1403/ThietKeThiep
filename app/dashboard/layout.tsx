'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  MessageSquare,
  UserCheck,
  Gift,
  PenTool,
  User,
  CreditCard,
  HelpCircle,
  MessageSquarePlus,
  LogOut,
  Shield,
  Heart,
  ChevronDown,
  History,
} from 'lucide-react';
import { AuthService } from '@/lib/auth/auth-service';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NotificationBell } from '@/components/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = AuthService.getCurrentUserSync();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await AuthService.logout();
    window.location.href = '/login';
  };

  const navItems = [
    {
      group: 'TRANG CHÍNH',
      items: [
        { label: 'Tổng quan', href: '/dashboard', icon: LayoutDashboard },
        { label: 'Thiệp của tôi', href: '/dashboard/invitations', icon: FileText },
        { label: 'Tạo thiết kế', href: '/dashboard/invitations/new', icon: PlusCircle },
      ],
    },
    {
      group: 'QUẢN LÝ KHÁCH MỜI',
      items: [
        { label: 'Lời chúc', href: '/dashboard/wishes', icon: MessageSquare },
        { label: 'Xác nhận tham dự', href: '/dashboard/rsvp', icon: UserCheck },
        { label: 'Quà tặng', href: '/dashboard/gifts', icon: Gift },
        { label: 'Chữ ký khách mời', href: '/dashboard/signatures', icon: PenTool },
      ],
    },
    {
      group: 'TÀI KHOẢN',
      items: [
        { label: 'Thông tin tài khoản', href: '/dashboard/account', icon: User },
        { label: 'Gói dịch vụ của tôi', href: '/dashboard/subscription', icon: CreditCard },
        { label: 'Lịch sử thanh toán', href: '/dashboard/payments', icon: History },
      ],
    },
    {
      group: 'HỖ TRỢ',
      items: [
        { label: 'Hướng dẫn & FAQ', href: '/dashboard/support', icon: HelpCircle },
        { label: 'Chia sẻ góp ý', href: '/dashboard/feedback', icon: MessageSquarePlus },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#FFFDFB] flex text-[#1F1B1C] font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-[#EAE4DF] flex flex-col justify-between flex-shrink-0 min-h-screen hidden md:flex sticky top-0 h-screen shadow-soft z-20">
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#E85B6A] to-[#F27B88] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="tracking-tight text-[#1F1B1C] font-serif font-bold text-lg">NHÀ CÓ TIỆC</span>
          </Link>

          {/* Navigation Groups */}
          <div className="space-y-6">
            {navItems.map((group) => (
              <div key={group.group} className="space-y-1.5">
                <div className="text-[10px] font-bold uppercase tracking-widest text-[#756B70] px-3 py-1 font-serif">
                  {group.group}
                </div>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-[#FAF7F5] text-[#E85B6A] border border-[#EAE4DF] shadow-xs font-bold'
                          : 'text-[#756B70] hover:text-[#1F1B1C] hover:bg-[#FAF7F5]/60'
                      }`}
                    >
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#E85B6A]' : 'text-[#756B70]'}`} />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            ))}

            {currentUser?.role === 'ADMIN' && (
              <div className="pt-2 border-t border-[#FAF7F5]">
                <Link
                  href="/admin"
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-[#C5A880] bg-[#1F1B1C] hover:bg-[#2F292B] transition-all shadow-sm"
                >
                  <Shield className="w-4 h-4 text-[#C5A880]" />
                  <span>Admin Center</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* User Footer / Logout */}
        <div className="p-4 border-t border-[#EAE4DF]">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-2xl btn-luxury-secondary text-xs font-semibold cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-[#E85B6A]" /> <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="glass-header border-b border-[#EAE4DF] h-16 px-6 flex items-center justify-between sticky top-0 z-30 shadow-soft">
          <div className="flex items-center gap-2 md:hidden">
            <Link href="/" className="flex items-center gap-2 font-serif font-bold text-[#E85B6A]">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#E85B6A] to-[#F27B88] text-white flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="text-[#1F1B1C] text-sm">NHÀ CÓ TIỆC</span>
            </Link>
          </div>

          <div className="hidden sm:flex items-center">
            <Breadcrumbs
              items={(() => {
                const parts = pathname.split('/').filter(Boolean);
                const items: { label: string; href?: string }[] = [{ label: 'Dashboard', href: '/dashboard' }];
                if (parts.length > 1) {
                  const sub = parts[1];
                  const labels: Record<string, string> = {
                    invitations: 'Thiệp của tôi',
                    wishes: 'Lời chúc',
                    rsvp: 'Xác nhận tham dự',
                    gifts: 'Quà tặng',
                    signatures: 'Chữ ký lưu bút',
                    account: 'Thông tin tài khoản',
                    subscription: 'Gói dịch vụ',
                    payments: 'Lịch sử thanh toán',
                    support: 'Hỗ trợ & FAQ',
                    feedback: 'Chia sẻ góp ý',
                  };
                  items.push({
                    label: labels[sub] || sub,
                    href: parts.length > 2 ? `/dashboard/${sub}` : undefined,
                  });
                  if (parts.length > 2) {
                    if (parts[2] === 'new') items.push({ label: 'Tạo thiệp mới' });
                    else if (parts[3]) items.push({ label: parts[3] });
                    else items.push({ label: 'Chi tiết' });
                  }
                }
                return items;
              })()}
            />
          </div>

          <div className="flex items-center gap-3 relative">
            <NotificationBell />

            <Link
              href="/dashboard/invitations/new"
              className="px-4 py-2 rounded-full bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Tạo thiệp mới
            </Link>

            {/* Profile Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#e85d75]/10 border border-[#e85d75]/30 text-[#e85d75] font-bold flex items-center justify-center text-xs overflow-hidden">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Ảnh đại diện người dùng" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white border border-[#e8dfd8] rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-gray-100">
                    <div className="font-bold text-gray-800 truncate">{currentUser?.full_name}</div>
                    <div className="text-[11px] text-gray-500 truncate">{currentUser?.email}</div>
                  </div>
                  <Link
                    href="/dashboard/account"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    Thông tin tài khoản
                  </Link>
                  <Link
                    href="/dashboard/subscription"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-700 font-medium"
                  >
                    Gói dịch vụ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold border-t border-gray-100 mt-1"
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Children Container */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
