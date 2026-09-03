'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  FolderTree,
  LayoutTemplate,
  FileText,
  UserCheck,
  MessageSquare,
  MessageSquarePlus,
  Shield,
  LogOut,
  ExternalLink,
  History,
  CreditCard,
} from 'lucide-react';
import { AuthService } from '@/lib/auth/auth-service';
import { useAuth } from '@/lib/auth/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (pathname === '/admin/login') {
      setAuthorized(true);
      return;
    }

    if (loading) return;

    // Check trusted database user identity
    const currentUser = AuthService.getCurrentUserSync();
    if (!currentUser) {
      router.push(`/admin/login?redirect=${encodeURIComponent(pathname)}`);
      setAuthorized(false);
      return;
    }

    if (currentUser.role !== 'ADMIN') {
      router.push('/403');
      setAuthorized(false);
      return;
    }

    setAuthorized(true);
  }, [loading, user, role, pathname, router]);

  // If on admin login page, do not render admin sidebar/layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  const handleLogout = async () => {
    await AuthService.logout();
    window.location.href = '/admin/login';
  };

  if (authorized === false || (loading && !AuthService.getCurrentUserSync())) {
    return (
      <div className="min-h-screen bg-[#191D1B] flex items-center justify-center text-gray-400 text-xs">
        Đang kiểm tra quyền truy cập Quản trị...
      </div>
    );
  }

  const navItems = [
    { label: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { label: 'Người dùng', href: '/admin/users', icon: Users },
    { label: 'Đơn hàng & Thanh toán', href: '/admin/payments', icon: CreditCard },
    { label: 'Danh mục', href: '/admin/categories', icon: FolderTree },
    { label: 'Mẫu thiệp', href: '/admin/templates', icon: LayoutTemplate },
    { label: 'Thiệp mời', href: '/admin/invitations', icon: FileText },
    { label: 'RSVP hệ thống', href: '/admin/rsvp', icon: UserCheck },
    { label: 'Kiểm duyệt lời chúc', href: '/admin/wishes', icon: MessageSquare },
    { label: 'Góp ý người dùng', href: '/admin/feedback', icon: MessageSquarePlus },
    { label: 'Nhật ký hệ thống', href: '/admin/audit-logs', icon: History },
  ];

  return (
    <div className="min-h-screen bg-[#191D1B] text-gray-200 flex font-sans selection:bg-[#B76E79]">
      {/* Left Admin Sidebar */}
      <aside className="w-64 bg-[#212623] border-r border-[#2F3531] flex flex-col justify-between flex-shrink-0 min-h-screen hidden md:flex sticky top-0 h-screen">
        <div className="p-6 space-y-6 overflow-y-auto">
          {/* Logo & Admin Tag */}
          <div className="space-y-1">
            <Link href="/admin" className="flex items-center gap-2.5 font-serif font-bold text-lg text-white">
              <div className="w-8 h-8 rounded-xl bg-[#B76E79] text-white flex items-center justify-center font-bold text-sm shadow-md">
                <Shield className="w-4 h-4" />
              </div>
              <span className="tracking-wide">ADMIN CENTER</span>
            </Link>
            <div className="text-[10px] text-gray-400 font-mono pl-10">NHÀ CÓ TIỆC v1.0</div>
          </div>

          {/* Nav List */}
          <nav className="space-y-1 text-xs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-semibold transition-all ${
                    isActive
                      ? 'bg-[#B76E79] text-white shadow-sm'
                      : 'text-gray-400 hover:bg-[#2A302D] hover:text-white'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Footer */}
        <div className="p-4 border-t border-[#2F3531] space-y-2">
          <Link
            href="/dashboard"
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#2A302D] text-xs font-semibold text-gray-300 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" /> Chuyển sang User App
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-rose-900/50 text-xs font-semibold text-rose-400 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" /> Đăng xuất Admin
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-[#212623]/90 backdrop-blur-md border-b border-[#2F3531] h-16 px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <Link href="/" className="text-gray-400 hover:text-[#B76E79]">Trang chủ</Link>
            <span>/</span>
            <Link href="/admin" className="text-gray-300 hover:text-white">Admin</Link>
            {pathname !== '/admin' && (
              <>
                <span>/</span>
                <span className="font-semibold text-white capitalize">
                  {(() => {
                    const sub = pathname.replace('/admin/', '');
                    const labels: Record<string, string> = {
                      users: 'Người dùng',
                      categories: 'Danh mục',
                      templates: 'Mẫu thiệp',
                      invitations: 'Thiệp mời',
                      rsvp: 'RSVP hệ thống',
                      wishes: 'Kiểm duyệt lời chúc',
                      feedback: 'Góp ý người dùng',
                    };
                    return labels[sub] || sub;
                  })()}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/swagger-ui"
              target="_blank"
              className="px-3.5 py-1.5 rounded-xl bg-blue-900/30 border border-blue-700/50 text-blue-300 text-xs font-semibold hover:bg-blue-900/50 transition-colors flex items-center gap-1.5"
            >
              Swagger API Docs
            </Link>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
