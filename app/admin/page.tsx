'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Layers,
  FileText,
  CheckCircle,
  ArrowRight,
  CreditCard,
  MessageSquare,
  UserCheck,
  TrendingUp,
  Activity,
  ShieldCheck,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AdminService, SystemStats } from '@/services/admin.service';
import { Badge } from '@/components/ui/Badge';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [growthData, setGrowthData] = useState<Array<{ month: string; users: number; invitations: number }>>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const [st, growth] = await Promise.all([
        AdminService.getSystemStats(),
        AdminService.getGrowthMetrics(),
      ]);
      setStats(st);
      setGrowthData(growth);
      setLoading(false);
    }
    load();
  }, []);

  const statCards = stats
    ? [
        {
          label: 'Tổng Người Dùng',
          value: stats.totalUsers,
          trend: '+24% tháng này',
          icon: Users,
          color: 'text-indigo-600',
          bg: 'bg-indigo-50',
        },
        {
          label: 'Tổng Thiệp Mời',
          value: stats.totalInvitations,
          trend: '+18% tháng này',
          icon: FileText,
          color: 'text-blue-600',
          bg: 'bg-blue-50',
        },
        {
          label: 'Thiệp Đã Xuất Bản',
          value: stats.publishedInvitations,
          trend: 'Tỷ lệ 88%',
          icon: CheckCircle,
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
        },
        {
          label: 'Mẫu Thiệp Tuyển Chọn',
          value: stats.totalTemplates,
          trend: '100% active',
          icon: Layers,
          color: 'text-amber-600',
          bg: 'bg-amber-50',
        },
      ]
    : [];

  const quickLinks = [
    {
      label: 'Quản Lý Người Dùng',
      desc: 'Xem danh sách, kiểm duyệt quyền hạn và khóa/mở tài khoản.',
      href: '/admin/users',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Đơn Hàng & Thanh Toán',
      desc: 'Duyệt thủ công các giao dịch chuyển khoản VietQR đang chờ.',
      href: '/admin/payments',
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Quản Lý Mẫu Thiệp',
      desc: 'Thêm mới mẫu thiệp cưới luxury, kích hoạt hoặc sửa template.',
      href: '/admin/templates',
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'RSVP Toàn Hệ Thống',
      desc: 'Xem tổng hợp tỷ lệ tham dự của khách mời trên toàn nền tảng.',
      href: '/admin/rsvp',
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Kiểm Duyệt Lời Chúc',
      desc: 'Giám sát và kiểm duyệt các lời chúc công khai.',
      href: '/admin/wishes',
      icon: MessageSquare,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Nhật Ký Audit Logs',
      desc: 'Truy vết toàn bộ thao tác admin bảo mật không thể xóa sửa.',
      href: '/admin/audit-logs',
      icon: ShieldCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="admin-card p-6 sm:p-8 bg-gradient-to-r from-white via-white to-neutral-50/50">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Hệ thống vận hành ổn định
            </div>
            <h1 className="text-xl sm:text-2xl font-semibold text-admin-text">
              Admin Control Center 👋
            </h1>
            <p className="text-xs sm:text-sm text-admin-muted">
              Giám sát các chỉ số người dùng, đơn hàng và bảo mật toàn diện của nền tảng NHÀ CÓ TIỆC.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="admin-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5 shadow-xs"
          >
            Về User Workspace <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-card p-5 space-y-3">
              <div className="admin-skeleton h-8 w-8 rounded-lg" />
              <div className="admin-skeleton h-8 w-16" />
              <div className="admin-skeleton h-3 w-20" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="admin-card p-5 flex flex-col justify-between space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-admin-muted font-medium">{stat.label}</span>
                  <div className={`w-8 h-8 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-admin-text tabular-nums">{stat.value}</div>
                  <div className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3" /> {stat.trend}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Growth Trends Chart */}
      <div className="admin-card p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-admin-text flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" /> Tăng Trưởng Nền Tảng (6 Tháng Gần Nhất)
            </h2>
            <p className="text-xs text-admin-muted">Số lượng người dùng đăng ký mới và thiệp cưới được khởi tạo</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-neutral-600">
              <span className="w-3 h-3 rounded-full bg-indigo-500 inline-block" /> Người dùng
            </span>
            <span className="flex items-center gap-1.5 text-neutral-600">
              <span className="w-3 h-3 rounded-full bg-rose-400 inline-block" /> Thiệp cưới
            </span>
          </div>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={growthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="userGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366F1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="invGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6B7280' }} />
              <YAxis tick={{ fontSize: 11, fill: '#6B7280' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1F2937', color: '#FFF', borderRadius: '8px', border: 'none', fontSize: '12px' }}
              />
              <Area type="monotone" dataKey="users" stroke="#6366F1" strokeWidth={2} fillOpacity={1} fill="url(#userGrad)" name="Người dùng mới" />
              <Area type="monotone" dataKey="invitations" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#invGrad)" name="Thiệp cưới tạo mới" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-sm font-semibold text-admin-text mb-4">Các Khu Vực Điều Khiển</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="admin-card p-5 group flex flex-col justify-between hover:border-admin-accent transition-all"
              >
                <div>
                  <div className={`w-10 h-10 rounded-lg ${link.bg} ${link.color} flex items-center justify-center mb-3`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-admin-text group-hover:text-admin-accent transition-colors">
                    {link.label}
                  </h3>
                  <p className="text-xs text-admin-muted mt-1 leading-relaxed">
                    {link.desc}
                  </p>
                </div>
                <div className="mt-4 flex items-center gap-1 text-xs font-medium text-admin-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Truy cập quản trị <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
