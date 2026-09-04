'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, Users, CheckCircle2 } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { AnalyticsService, InvitationAnalytics } from '@/services/analytics.service';
import { InvitationService } from '@/services/invitation.service';
import { Invitation } from '@/types/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

const COLORS = ['#10B981', '#F59E0B', '#EF4444', '#9CA3AF'];

export default function AnalyticsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const invitationId = resolvedParams.id;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [analytics, setAnalytics] = useState<InvitationAnalytics | null>(null);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('7d');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const inv = await InvitationService.getInvitationById(invitationId);
      setInvitation(inv);

      const data = await AnalyticsService.getInvitationAnalytics(invitationId, timeRange);
      setAnalytics(data);
      setLoading(false);
    }
    load();
  }, [invitationId, timeRange]);

  if (loading && !analytics) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center text-gray-500 text-xs">
        Đang tải báo cáo phân tích...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-600 hover:text-[#B76E79]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#292624]">Báo Cáo Thống Kê & Phân Tích</h1>
              <p className="text-xs text-gray-500">{invitation?.title}</p>
            </div>
          </div>

          {/* Time Range Filter Pills */}
          <div className="flex items-center bg-white p-1 rounded-2xl border border-[#E8DFD8] shadow-sm self-start sm:self-auto">
            {(
              [
                { key: '7d', label: '7 ngày' },
                { key: '30d', label: '30 ngày' },
                { key: '90d', label: '90 ngày' },
                { key: 'all', label: 'Tất cả' },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setTimeRange(t.key)}
                className={`px-3 py-1 text-xs font-semibold rounded-xl transition-all cursor-pointer ${
                  timeRange === t.key
                    ? 'btn-luxury-primary text-white shadow-sm'
                    : 'text-gray-600 hover:text-[#1F1B1C]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Top 4 Metrics Cards */}
        {analytics && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <Eye className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{analytics.totalViews}</div>
                <div className="text-xs text-gray-500 font-medium">Tổng Lượt Xem</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{analytics.uniqueSessions}</div>
                <div className="text-xs text-gray-500 font-medium">Khách Độc Lập</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">
                  {analytics.rsvpDistribution.find((r) => r.name === 'Tham dự')?.value || 0}
                </div>
                <div className="text-xs text-gray-500 font-medium">Xác Nhận Tham Dự</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <span className="text-lg font-bold font-mono">%</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{analytics.attendanceRate}%</div>
                <div className="text-xs text-gray-500 font-medium">Tỷ Lệ Tham Dự</div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Grid */}
        {analytics && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: Views over time */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD8] shadow-sm space-y-4">
              <h2 className="text-base font-serif font-bold text-[#292624]">Lượt Xem Theo Ngày</h2>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.viewsByDay}>
                    <XAxis dataKey="date" stroke="#888888" fontSize={11} />
                    <YAxis stroke="#888888" fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="views" fill="#B76E79" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: RSVP Status Pie */}
            <div className="bg-white p-6 rounded-3xl border border-[#E8DFD8] shadow-sm space-y-4">
              <h2 className="text-base font-serif font-bold text-[#292624]">Tỷ Lệ Phản Hồi RSVP</h2>
              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.rsvpDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {analytics.rsvpDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center items-center flex-wrap gap-4 text-xs font-medium">
                {analytics.rsvpDistribution.map((item, idx) => (
                  <div key={item.name} className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                    <span>{item.name}: {item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
