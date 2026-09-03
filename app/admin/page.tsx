'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Shield, Users, Layers, FileText, CheckCircle, ArrowRight } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      {/* Top Navbar */}
      <header className="bg-white border-b border-[#E8DFD8] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif font-bold text-xl text-purple-900">
            <Shield className="w-6 h-6 text-purple-700" />
            <span>NHÀ CÓ TIỆC — Quản Trị Hệ Thống</span>
          </div>
          <Link href="/dashboard" className="text-xs font-semibold text-gray-600 hover:text-[#B76E79]">
            Về Dashboard Người Dùng
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex items-center justify-between bg-purple-900 text-white p-8 rounded-3xl shadow-md">
          <div>
            <h1 className="text-3xl font-serif font-bold">Admin Control Center</h1>
            <p className="text-xs text-purple-200 mt-1">
              Quản lý người dùng, mẫu thiệp, danh mục sự kiện và theo dõi toàn bộ chỉ số nền tảng.
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{stats.totalUsers}</div>
                <div className="text-xs text-gray-500 font-medium">Người Dùng</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{stats.totalInvitations}</div>
                <div className="text-xs text-gray-500 font-medium">Thiệp Mời</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{stats.publishedInvitations}</div>
                <div className="text-xs text-gray-500 font-medium">Đã Xuất Bản</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{stats.totalTemplates}</div>
                <div className="text-xs text-gray-500 font-medium">Mẫu Thiệp Active</div>
              </div>
            </div>
          </div>
        )}

        {/* Management Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/admin/users"
            className="p-6 bg-white rounded-3xl border border-[#E8DFD8] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#292624] group-hover:text-purple-700 transition-colors">
                Quản Lý Người Dùng
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Xem danh sách người dùng, thay đổi quyền hạn và khóa/mở khóa tài khoản.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-purple-700">
              Truy cập quản lý <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/admin/categories"
            className="p-6 bg-white rounded-3xl border border-[#E8DFD8] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#292624] group-hover:text-blue-700 transition-colors">
                Quản Lý Danh Mục
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Tạo mới, chỉnh sửa và quản lý các loại tiệc (Đám cưới, Sinh nhật, Tân gia...).
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-blue-700">
              Truy cập quản lý <ArrowRight className="w-4 h-4" />
            </div>
          </Link>

          <Link
            href="/admin/templates"
            className="p-6 bg-white rounded-3xl border border-[#E8DFD8] shadow-sm hover:shadow-md transition-all group flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-serif font-bold text-[#292624] group-hover:text-emerald-700 transition-colors">
                Quản Lý Mẫu Thiệp
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                Thêm mới mẫu thiết kế, kích hoạt/vô hiệu hóa template trên thư viện công khai.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1 text-xs font-semibold text-emerald-700">
              Truy cập quản lý <ArrowRight className="w-4 h-4" />
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
}
