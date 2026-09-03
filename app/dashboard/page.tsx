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
  PenTool,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { AnalyticsService, OverviewMetrics } from '@/services/analytics.service';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Invitation } from '@/types/database.types';

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

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Banner / Greeting */}
      <div className="bg-gradient-to-r from-[#E85B6A]/10 via-[#FAF7F5] to-white p-7 sm:p-9 rounded-3xl border border-[#EAE4DF] flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-soft">
        <div className="space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white text-[#E85B6A] text-[11px] font-bold shadow-soft border border-[#EAE4DF]">
            <Sparkles className="w-3.5 h-3.5" /> Bảng Quản Trị Thiệp Mời
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1F1B1C]">
            Xin chào, {currentUser?.full_name || 'Bạn'}! ✨
          </h1>
          <p className="text-xs sm:text-sm text-[#756B70] max-w-xl leading-relaxed">
            Quản lý tất cả thiệp mời online, theo dõi phản hồi tham dự của khách mời và cấu hình quà tặng dễ dàng.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/invitations/new"
            className="px-5 py-2.5 rounded-2xl btn-luxury-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Tạo Thiệp Mới
          </Link>
          <Link
            href="/dashboard/invitations"
            className="px-5 py-2.5 rounded-2xl btn-luxury-secondary text-xs font-semibold"
          >
            Xem Tất Cả Thiệp
          </Link>
        </div>
      </div>

      {/* 8 Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="luxury-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B70]">Tổng Số Thiệp</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#1F1B1C]">{metrics.totalInvitations}</div>
          <div className="text-[11px] text-[#756B70]">Đã khởi tạo trong tài khoản</div>
        </div>

        <div className="luxury-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B70]">Đã Xuất Bản</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-emerald-600">{metrics.publishedInvitations}</div>
          <div className="text-[11px] text-[#756B70]">Đang hoạt động trực tuyến</div>
        </div>

        <div className="luxury-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B70]">Bản Nháp</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-amber-600">{metrics.draftInvitations}</div>
          <div className="text-[11px] text-[#756B70]">Đang chỉnh sửa</div>
        </div>

        <div className="luxury-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B70]">Tổng Lượt Xem</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-purple-600">{metrics.totalViews}</div>
          <div className="text-[11px] text-[#756B70]">Lượt truy cập từ khách</div>
        </div>

        <div className="luxury-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B70]">Tổng Khách Mời</span>
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center border border-teal-100">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-teal-600">{metrics.totalGuests}</div>
          <div className="text-[11px] text-[#756B70]">Danh sách đã thêm</div>
        </div>

        <div className="luxury-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B70]">Xác Nhận Tham Dự</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E85B6A] flex items-center justify-center border border-rose-100">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-bold font-serif text-[#E85B6A]">{metrics.totalAttending}</div>
          <div className="text-[11px] text-[#756B70]">Khách đã bấm tham gia</div>
        </div>

        <div className="luxury-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B70]">Lời Chúc</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <Link href="/dashboard/wishes" className="text-xl sm:text-2xl font-bold font-serif text-indigo-600 hover:underline block">
            Quản lý &rarr;
          </Link>
          <div className="text-[11px] text-[#756B70]">Sổ lời chúc khách mời</div>
        </div>

        <div className="luxury-card p-5 rounded-3xl space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#756B70]">Quà Tặng / STK</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100">
              <Gift className="w-4 h-4" />
            </div>
          </div>
          <Link href="/dashboard/gifts" className="text-xl sm:text-2xl font-bold font-serif text-amber-600 hover:underline block">
            Cấu hình &rarr;
          </Link>
          <div className="text-[11px] text-[#756B70]">QR chuyển khoản mừng</div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="luxury-card p-7 rounded-3xl space-y-4">
        <h2 className="text-base font-serif font-bold text-[#1F1B1C]">Thao Tác Nhanh</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/dashboard/invitations/new"
            className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE4DF] hover:border-[#E85B6A] transition-all text-center space-y-2 group shadow-xs"
          >
            <PlusCircle className="w-6 h-6 text-[#E85B6A] mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#1F1B1C]">Tạo Thiệp Mới</div>
          </Link>

          <Link
            href="/dashboard/invitations"
            className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE4DF] hover:border-blue-500 transition-all text-center space-y-2 group shadow-xs"
          >
            <FileText className="w-6 h-6 text-blue-600 mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#1F1B1C]">Thiệp Của Tôi</div>
          </Link>

          <Link
            href="/dashboard/rsvp"
            className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE4DF] hover:border-emerald-500 transition-all text-center space-y-2 group shadow-xs"
          >
            <CheckCircle className="w-6 h-6 text-emerald-600 mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#1F1B1C]">Xem RSVP</div>
          </Link>

          <Link
            href="/dashboard/wishes"
            className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE4DF] hover:border-purple-500 transition-all text-center space-y-2 group shadow-xs"
          >
            <MessageSquare className="w-6 h-6 text-purple-600 mx-auto group-hover:scale-110 transition-transform" />
            <div className="text-xs font-bold text-[#1F1B1C]">Xem Lời Chúc</div>
          </Link>
        </div>
      </div>

      {/* Recent Invitations */}
      <div className="luxury-card p-7 sm:p-9 rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1F1B1C]">Thiệp Gần Đây</h2>
            <p className="text-xs text-[#756B70]">Các thiệp mời bạn vừa chỉnh sửa hoặc tạo mới</p>
          </div>
          <Link href="/dashboard/invitations" className="text-xs font-semibold text-[#E85B6A] hover:underline flex items-center gap-1">
            Xem tất cả <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentInvitations.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <FileText className="w-10 h-10 text-[#756B70]/40 mx-auto" />
            <p className="text-xs text-[#756B70]">Bạn chưa có thiệp mời nào.</p>
            <Link
              href="/dashboard/invitations/new"
              className="inline-block px-5 py-2.5 rounded-full btn-luxury-primary text-white text-xs font-semibold"
            >
              Tạo Thiệp Đầu Tiên
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {recentInvitations.map((inv) => (
              <div key={inv.id} className="p-5 rounded-3xl border border-[#EAE4DF] bg-[#FAF7F5] space-y-4 hover:shadow-card transition-all">
                <div className="flex items-center justify-between">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    inv.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {inv.status === 'PUBLISHED' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                  </span>
                  <span className="text-[11px] text-[#756B70] font-mono">{inv.event_date}</span>
                </div>

                <div>
                  <h3 className="font-serif font-bold text-[#1F1B1C] text-base">{inv.title}</h3>
                  <p className="text-xs text-[#756B70] truncate mt-0.5">{inv.venue_name}</p>
                </div>

                <div className="pt-2.5 border-t border-[#EAE4DF] flex items-center justify-between">
                  <Link
                    href={`/dashboard/invitations/${inv.id}/edit`}
                    className="text-xs font-semibold text-[#E85B6A] hover:underline"
                  >
                    Chỉnh sửa &rarr;
                  </Link>
                  <Link
                    href={`/i/${inv.slug}`}
                    target="_blank"
                    className="text-xs text-[#756B70] hover:text-[#1F1B1C]"
                  >
                    Xem trước
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
