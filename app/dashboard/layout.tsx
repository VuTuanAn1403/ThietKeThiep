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
  Menu,
  X,
} from 'lucide-react';
import { AuthService } from '@/lib/auth/auth-service';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NotificationBell } from '@/components/NotificationBell';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentUser = AuthService.getCurrentUserSync();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
        { label: 'Quà tặng & QR', href: '/dashboard/gifts', icon: Gift },
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

  const sidebarContent = (
    <div className="flex flex-col justify-between h-full">
      <div className="p-6 space-y-6 overflow-y-auto">
        {/* Brand Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#B76E79] to-[#D4A373] text-white flex items-center justify-center font-bold text-base shadow-sm group-hover:scale-105 transition-transform">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="tracking-tight text-neutral-900 font-serif font-bold text-lg">NHÀ CÓ TIỆC</span>
          </Link>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Groups */}
        <div className="space-y-6">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-1">
              <div className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 px-3 py-1 font-serif">
                {group.group}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-[#B76E79]/10 text-[#B76E79] font-bold shadow-xs border border-[#B76E79]/20'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/70'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#B76E79]' : 'text-neutral-400'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}

          {currentUser?.role === 'ADMIN' && (
            <div className="pt-2 border-t border-neutral-100">
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-bold text-amber-200 bg-neutral-900 hover:bg-neutral-800 transition-all shadow-sm"
              >
                <Shield className="w-4 h-4 text-amber-300" />
                <span>Admin Control Center</span>
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* User Footer / Logout */}
      <div className="p-4 border-t border-neutral-200/70">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold cursor-pointer transition-colors shadow-xs"
        >
          <LogOut className="w-4 h-4 text-rose-500" /> <span>Đăng xuất</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[var(--background,#FFFDF9)] flex text-neutral-900 font-sans">
      {/* Desktop Left Sidebar */}
      <aside className="w-64 bg-white border-r border-neutral-200/70 flex-shrink-0 min-h-screen hidden md:flex flex-col sticky top-0 h-screen shadow-soft z-20">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-white h-full shadow-2xl z-10 flex flex-col">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Right Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200/70 h-16 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100"
              aria-label="Mở menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="md:hidden flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#B76E79] to-[#D4A373] text-white flex items-center justify-center">
                <Heart className="w-3.5 h-3.5 fill-white" />
              </div>
              <span className="font-serif font-bold text-sm tracking-tight text-neutral-900">NHÀ CÓ TIỆC</span>
            </div>

            <div className="hidden md:flex items-center">
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
          </div>

          <div className="flex items-center gap-3 relative">
            <NotificationBell />

            <Link
              href="/dashboard/invitations/new"
              className="hidden sm:inline-flex px-3.5 py-1.5 rounded-lg bg-[var(--primary,#B76E79)] text-white text-xs font-semibold hover:opacity-90 transition-all items-center gap-1.5 shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Tạo thiệp mới
            </Link>

            {/* Profile Dropdown Toggle */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-full hover:bg-neutral-100 transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#B76E79]/15 border border-[#B76E79]/30 text-[#B76E79] font-bold flex items-center justify-center text-xs overflow-hidden">
                  {currentUser?.avatar_url ? (
                    <img src={currentUser.avatar_url} alt="Ảnh đại diện" className="w-full h-full object-cover" />
                  ) : (
                    currentUser?.full_name?.charAt(0) || 'U'
                  )}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-500" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-2xl shadow-xl py-2 z-50 text-xs">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <div className="font-bold text-neutral-800 truncate">{currentUser?.full_name || 'Người dùng'}</div>
                    <div className="text-[11px] text-neutral-500 truncate">{currentUser?.email || 'user@nhacotiec.vn'}</div>
                    <div className="mt-1">
                      <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-700">
                        {currentUser?.role === 'ADMIN' ? 'Admin' : 'Thành viên'}
                      </span>
                    </div>
                  </div>
                  <Link
                    href="/dashboard/account"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700 font-medium"
                  >
                    Thông tin tài khoản
                  </Link>
                  <Link
                    href="/dashboard/subscription"
                    onClick={() => setDropdownOpen(false)}
                    className="block px-4 py-2 hover:bg-neutral-50 text-neutral-700 font-medium"
                  >
                    Gói dịch vụ
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-rose-50 text-rose-600 font-semibold border-t border-neutral-100 mt-1 flex items-center gap-1.5"
                  >
                    <LogOut className="w-3.5 h-3.5" /> Đăng xuất
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
