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
  Menu,
  X,
  Bell,
  ChevronRight,
} from 'lucide-react';
import { AuthService } from '@/lib/auth/auth-service';
import { useAuth } from '@/lib/auth/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, role, loading } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="admin-skeleton w-8 h-8 rounded-lg mx-auto" />
          <p className="text-sm text-gray-500">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  const currentUser = AuthService.getCurrentUserSync();

  const navGroups = [
    {
      label: 'TỔNG QUAN',
      items: [
        { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
      ],
    },
    {
      label: 'QUẢN LÝ',
      items: [
        { label: 'Người dùng', href: '/admin/users', icon: Users },
        { label: 'Đơn hàng', href: '/admin/payments', icon: CreditCard },
        { label: 'Danh mục', href: '/admin/categories', icon: FolderTree },
        { label: 'Mẫu thiệp', href: '/admin/templates', icon: LayoutTemplate },
        { label: 'Thiệp mời', href: '/admin/invitations', icon: FileText },
      ],
    },
    {
      label: 'NỘI DUNG',
      items: [
        { label: 'RSVP hệ thống', href: '/admin/rsvp', icon: UserCheck },
        { label: 'Lời chúc', href: '/admin/wishes', icon: MessageSquare },
        { label: 'Góp ý', href: '/admin/feedback', icon: MessageSquarePlus },
        { label: 'Nhật ký', href: '/admin/audit-logs', icon: History },
      ],
    },
  ];

  const breadcrumbLabels: Record<string, string> = {
    users: 'Người dùng',
    categories: 'Danh mục',
    templates: 'Mẫu thiệp',
    invitations: 'Thiệp mời',
    rsvp: 'RSVP hệ thống',
    wishes: 'Lời chúc',
    feedback: 'Góp ý',
    payments: 'Đơn hàng',
    'audit-logs': 'Nhật ký',
  };

  const currentSub = pathname.replace('/admin/', '').split('/')[0];
  const currentLabel = breadcrumbLabels[currentSub] || currentSub;

  const SidebarContent = () => (
    <>
      <div className="p-5 space-y-6 overflow-y-auto flex-1">
        {/* Logo */}
        <Link href="/admin" className="flex items-center gap-2.5" onClick={() => setSidebarOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-admin-accent text-white flex items-center justify-center font-bold text-sm shadow-sm">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold text-sm text-admin-text">Admin Center</div>
            <div className="text-[10px] text-admin-muted">NHÀ CÓ TIỆC v1.0</div>
          </div>
        </Link>

        {/* Nav Groups */}
        <nav className="space-y-5">
          {navGroups.map((group) => (
            <div key={group.label} className="space-y-0.5">
              <div className="text-[10px] font-semibold uppercase tracking-widest text-admin-muted px-3 py-1.5">
                {group.label}
              </div>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors ${
                      isActive
                        ? 'bg-admin-accentSoft text-admin-accent font-semibold'
                        : 'text-admin-muted hover:bg-admin-hover hover:text-admin-text'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-admin-accent' : 'text-admin-muted'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-admin-border space-y-2">
        <Link
          href="/dashboard"
          onClick={() => setSidebarOpen(false)}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg admin-btn-secondary text-xs"
        >
          <ExternalLink className="w-3.5 h-3.5" /> User App
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg admin-btn-danger text-xs cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" /> Đăng xuất
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-[#F8F9FB] flex font-sans">
      {/* Desktop Sidebar */}
      <aside className="w-60 bg-white border-r border-admin-border flex-col justify-between flex-shrink-0 min-h-screen hidden md:flex sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-xl flex flex-col animate-slide-up">
            <div className="flex items-center justify-between px-4 py-3 border-b border-admin-border">
              <span className="font-semibold text-sm text-admin-text">Menu</span>
              <button onClick={() => setSidebarOpen(false)} className="p-1 rounded hover:bg-admin-hover">
                <X className="w-5 h-5 text-admin-muted" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="bg-white border-b border-admin-border h-14 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-1.5 rounded-lg hover:bg-admin-hover md:hidden"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-admin-muted" />
            </button>

            {/* Breadcrumb */}
            <nav className="flex items-center gap-1.5 text-xs text-admin-muted">
              <Link href="/admin" className="hover:text-admin-accent transition-colors">Admin</Link>
              {pathname !== '/admin' && (
                <>
                  <ChevronRight className="w-3 h-3" />
                  <span className="font-semibold text-admin-text">{currentLabel}</span>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* API Docs link */}
            <Link
              href="/swagger-ui"
              target="_blank"
              className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-admin-muted hover:text-admin-accent hover:bg-admin-hover transition-colors"
            >
              API Docs
              <ExternalLink className="w-3 h-3" />
            </Link>

            {/* Notification placeholder */}
            <button className="relative p-1.5 rounded-lg hover:bg-admin-hover" aria-label="Thông báo">
              <Bell className="w-4.5 h-4.5 text-admin-muted" />
            </button>

            {/* Admin profile */}
            <div className="flex items-center gap-2 pl-3 border-l border-admin-border">
              <div className="w-7 h-7 rounded-lg bg-admin-accentSoft text-admin-accent font-bold text-xs flex items-center justify-center">
                {currentUser?.full_name?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block">
                <div className="text-xs font-semibold text-admin-text truncate max-w-[120px]">{currentUser?.full_name || 'Admin'}</div>
                <div className="text-[10px] text-admin-muted truncate max-w-[120px]">{currentUser?.email}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}
