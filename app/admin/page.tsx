'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Layers, FileText, CheckCircle, ArrowRight, CreditCard, MessageSquare, UserCheck } from 'lucide-react';
import { AdminService, SystemStats } from '@/services/admin.service';

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const st = await AdminService.getSystemStats();
      setStats(st);
      setLoading(false);
    }
    load();
  }, []);

  const statCards = stats
    ? [
        { label: 'Người Dùng', value: stats.totalUsers, icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Thiệp Mời', value: stats.totalInvitations, icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Đã Xuất Bản', value: stats.publishedInvitations, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Mẫu Thiệp', value: stats.totalTemplates, icon: Layers, color: 'text-amber-600', bg: 'bg-amber-50' },
      ]
    : [];

  const quickLinks = [
    {
      label: 'Quản Lý Người Dùng',
      desc: 'Xem danh sách, thay đổi quyền hạn và quản lý tài khoản.',
      href: '/admin/users',
      icon: Users,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      label: 'Đơn Hàng & Thanh Toán',
      desc: 'Xem xét, phê duyệt hoặc từ chối yêu cầu thanh toán.',
      href: '/admin/payments',
      icon: CreditCard,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Quản Lý Mẫu Thiệp',
      desc: 'Thêm mới, kích hoạt hoặc vô hiệu hóa template.',
      href: '/admin/templates',
      icon: Layers,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'RSVP Hệ Thống',
      desc: 'Xem tổng hợp xác nhận tham dự trên toàn nền tảng.',
      href: '/admin/rsvp',
      icon: UserCheck,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
    },
    {
      label: 'Kiểm Duyệt Lời Chúc',
      desc: 'Kiểm duyệt lời chúc mới từ khách mời.',
      href: '/admin/wishes',
      icon: MessageSquare,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
    {
      label: 'Quản Lý Danh Mục',
      desc: 'Tạo mới và chỉnh sửa các loại tiệc.',
      href: '/admin/categories',
      icon: Layers,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="admin-card p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-admin-text">
              Chào mừng trở lại 👋
            </h1>
            <p className="text-sm text-admin-muted mt-1">
              Quản lý người dùng, mẫu thiệp, danh mục sự kiện và theo dõi toàn bộ chỉ số nền tảng.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="admin-btn-secondary px-4 py-2 text-xs flex items-center gap-1.5"
          >
            Về User Dashboard <ArrowRight className="w-3.5 h-3.5" />
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
              <div key={idx} className="admin-card p-5 flex items-start gap-4">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-admin-text tabular-nums">{stat.value}</div>
                  <div className="text-xs text-admin-muted font-medium mt-0.5">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick Links Grid */}
      <div>
        <h2 className="text-sm font-semibold text-admin-text mb-4">Truy cập nhanh</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className="admin-card p-5 group flex flex-col justify-between"
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
                  Truy cập <ArrowRight className="w-3 h-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
