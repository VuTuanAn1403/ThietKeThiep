'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Eye,
  Users,
  CheckCircle,
  PlusCircle,
  MessageSquare,
  Gift,
  Clock,
  ArrowRight,
  Sparkles,
  HeartHandshake,
} from 'lucide-react';
import { AnalyticsService, OverviewMetrics } from '@/services/analytics.service';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Invitation } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';

export default function DashboardOverviewPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [metrics, setMetrics] = useState<OverviewMetrics>({
    totalInvitations: 0,
    publishedInvitations: 0,
    draftInvitations: 0,
    totalViews: 0,
    totalGuests: 0,
    totalAttending: 0,
  });
  const [recentInvitations, setRecentInvitations] = useState<Invitation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const userId = currentUser?.id || 'usr-demo-01';
      const m = await AnalyticsService.getUserOverviewMetrics(userId);
      const invs = await InvitationService.getUserInvitations(userId);
      setMetrics(m);
      setRecentInvitations(invs.slice(0, 3));
      setLoading(false);
    }
    load();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="py-20">
        <LoadingState message="Đang tải dữ liệu tổng quan..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner / Greeting */}
      <div className="bg-gradient-to-br from-[#B76E79]/10 via-[#FFFDF9] to-amber-50/40 p-6 sm:p-8 rounded-3xl border border-neutral-200/80 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-soft">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-[#B76E79] text-xs font-bold shadow-soft border border-neutral-200/60">
            <Sparkles className="w-3.5 h-3.5 text-[#B76E79]" /> Bảng Quản Trị Thiệp Cưới
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900">
            Xin chào, {currentUser?.full_name || 'Bạn'}! ✨
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 max-w-xl leading-relaxed">
            Quản lý tất cả thiệp cưới online, theo dõi phản hồi tham dự của khách mời và cấu hình quà mừng trực tuyến dễ dàng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/invitations/new"
            className="px-4 py-2.5 rounded-xl bg-[var(--primary,#B76E79)] hover:opacity-90 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <PlusCircle className="w-4 h-4" /> Tạo Thiệp Mới
          </Link>
          <Link
            href="/dashboard/invitations"
            className="px-4 py-2.5 rounded-xl bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold shadow-xs transition-colors"
          >
            Xem Tất Cả Thiệp
          </Link>
        </div>
      </div>

      {/* KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft space-y-2 hover:border-[#B76E79]/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Tổng Số Thiệp</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900">{metrics.totalInvitations}</div>
          <div className="text-[11px] text-neutral-400">Đã khởi tạo trong tài khoản</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft space-y-2 hover:border-emerald-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Đã Xuất Bản</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600">{metrics.publishedInvitations}</div>
          <div className="text-[11px] text-neutral-400">Đang trực tuyến công khai</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft space-y-2 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Bản Nháp</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-600">{metrics.draftInvitations}</div>
          <div className="text-[11px] text-neutral-400">Đang chuẩn bị nội dung</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft space-y-2 hover:border-purple-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Tổng Lượt Xem</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-purple-600">{metrics.totalViews}</div>
          <div className="text-[11px] text-neutral-400">Lượt truy cập từ khách</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft space-y-2 hover:border-teal-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Tổng Khách Mời</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-teal-600">{metrics.totalGuests}</div>
          <div className="text-[11px] text-neutral-400">Khách trong danh sách</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft space-y-2 hover:border-rose-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Xác Nhận Tham Dự</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#B76E79] flex items-center justify-center border border-rose-100">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#B76E79]">{metrics.totalAttending}</div>
          <div className="text-[11px] text-neutral-400">Khách đã bấm tham gia</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft space-y-2 hover:border-indigo-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Lời Chúc</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <Link href="/dashboard/wishes" className="text-xl sm:text-2xl font-bold font-serif text-indigo-600 hover:underline block">
            Quản lý &rarr;
          </Link>
          <div className="text-[11px] text-neutral-400">Sổ lời chúc khách mời</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-neutral-200/80 shadow-soft space-y-2 hover:border-amber-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Quà Tặng & QR</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <Link href="/dashboard/gifts" className="text-xl sm:text-2xl font-bold font-serif text-amber-600 hover:underline block">
            Cấu hình &rarr;
          </Link>
          <div className="text-[11px] text-neutral-400">QR chuyển khoản mừng cưới</div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="bg-white p-6 sm:p-7 rounded-3xl border border-neutral-200/80 shadow-soft space-y-4">
        <h2 className="text-base font-serif font-bold text-neutral-900">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/invitations/new"
            className="p-4 rounded-2xl bg-[#FFFDF9] border border-neutral-200/80 hover:border-[#B76E79] transition-all text-center space-y-2 group shadow-xs"
          >
            <PlusCircle className="w-6 h-6 text-[#B76E79] mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-neutral-900">Tạo Thiệp Mới</div>
          </Link>

          <Link
            href="/dashboard/invitations"
            className="p-4 rounded-2xl bg-[#FFFDF9] border border-neutral-200/80 hover:border-blue-500 transition-all text-center space-y-2 group shadow-xs"
          >
            <FileText className="w-6 h-6 text-blue-600 mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-neutral-900">Thiệp Của Tôi</div>
          </Link>

          <Link
            href="/dashboard/rsvp"
            className="p-4 rounded-2xl bg-[#FFFDF9] border border-neutral-200/80 hover:border-emerald-500 transition-all text-center space-y-2 group shadow-xs"
          >
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-neutral-900">Xem RSVP</div>
          </Link>

          <Link
            href="/dashboard/wishes"
            className="p-4 rounded-2xl bg-[#FFFDF9] border border-neutral-200/80 hover:border-purple-500 transition-all text-center space-y-2 group shadow-xs"
          >
            <MessageSquare className="w-6 h-6 text-purple-600 mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-neutral-900">Xem Lời Chúc</div>
          </Link>
        </div>
      </div>

      {/* Recent Invitations */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-neutral-200/80 shadow-soft space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-neutral-900">Thiệp Gần Đây</h2>
            <p className="text-xs text-neutral-500">Các thiệp cưới bạn vừa chỉnh sửa hoặc tạo mới</p>
          </div>
          <Link href="/dashboard/invitations" className="text-xs font-semibold text-[#B76E79] hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInvitations.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="w-10 h-10 text-neutral-300 mx-auto" />
            <p className="text-xs text-neutral-500">Bạn chưa có thiệp cưới nào.</p>
            <Link
              href="/dashboard/invitations/new"
              className="inline-block px-5 py-2.5 rounded-xl bg-[var(--primary,#B76E79)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Tạo Thiệp Đầu Tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {recentInvitations.map((inv) => (
              <div key={inv.id} className="p-5 rounded-2xl border border-neutral-200/80 bg-[#FFFDF9] space-y-4 hover:shadow-card transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={inv.status === 'PUBLISHED' ? 'success' : 'warning'} size="sm">
                      {inv.status === 'PUBLISHED' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                    </Badge>
                    <span className="text-[11px] text-neutral-500 font-mono">{inv.event_date}</span>
                  </div>

                  <div>
                    <h3 className="font-serif font-bold text-neutral-900 text-base leading-snug">{inv.title}</h3>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{inv.venue_name || 'Chưa thiết lập địa điểm'}</p>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-200/70 flex items-center justify-between text-xs font-semibold">
                  <Link
                    href={`/dashboard/invitations/${inv.id}/edit`}
                    className="text-[#B76E79] hover:underline"
                  >
                    Chỉnh sửa &rarr;
                  </Link>
                  <Link
                    href={`/i/${inv.slug}`}
                    target="_blank"
                    className="text-neutral-500 hover:text-neutral-900"
                  >
                    Xem thiệp
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
