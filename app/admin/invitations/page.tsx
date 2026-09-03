'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  ExternalLink,
  Archive,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { Invitation } from '@/types/database.types';

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const list = await AdminService.getAllInvitations();
      setInvitations(list);
      setLoading(false);
    }
    load();
  }, []);

  const handleArchive = async (id: string) => {
    const updated = await AdminService.archiveInvitation(id);
    if (updated) {
      setInvitations((prev) => prev.map((i) => (i.id === id ? updated : i)));
    }
  };

  const filtered = invitations.filter((inv) => {
    const matchFilter = filter === 'ALL' || inv.status === filter;
    const matchSearch =
      inv.title.toLowerCase().includes(search.toLowerCase()) ||
      inv.venue_name.toLowerCase().includes(search.toLowerCase()) ||
      inv.slug.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Quản Lý Thiệp Toàn Hệ Thống</h1>
        <p className="text-xs text-gray-400 mt-1">Danh sách tất cả các thiệp mời do thành viên tạo trên nền tảng</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#212623] p-4 rounded-2xl border border-[#2F3531] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === st
                  ? 'bg-[#B76E79] text-white'
                  : 'bg-[#2A302D] text-gray-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'PUBLISHED' ? 'Đã Xuất Bản' : st === 'DRAFT' ? 'Bản Nháp' : 'Đã Lưu Trữ'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, slug, địa điểm..."
            className="w-full pl-9 pr-4 py-2 bg-[#191D1B] border border-[#2F3531] rounded-xl text-xs text-white focus:outline-none focus:border-[#B76E79]"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-[#212623] rounded-3xl border border-[#2F3531] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#191D1B] border-b border-[#2F3531] text-gray-400 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-3.5 px-6">Tên Thiệp / Slug</th>
                <th className="py-3.5 px-6">Chủ Tiệc / User ID</th>
                <th className="py-3.5 px-6">Ngày Sự Kiện</th>
                <th className="py-3.5 px-6">Địa Điểm</th>
                <th className="py-3.5 px-6">Trạng Thái</th>
                <th className="py-3.5 px-6 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F3531] font-medium text-gray-300">
              {filtered.map((inv) => (
                <tr key={inv.id} className="hover:bg-[#2A302D]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white text-sm">{inv.title}</div>
                    <div className="text-[11px] font-mono text-[#B76E79]">/i/{inv.slug}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-medium text-gray-200">{inv.host_name || 'Chưa đặt'}</div>
                    <div className="text-[11px] font-mono text-gray-500">{inv.user_id}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-gray-400">{inv.event_date}</td>
                  <td className="py-4 px-6 text-gray-400 max-w-xs truncate">{inv.venue_name}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PUBLISHED'
                          ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400'
                          : inv.status === 'DRAFT'
                          ? 'bg-amber-950/70 border border-amber-800 text-amber-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/i/${inv.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg bg-[#2A302D] text-gray-300 hover:text-white transition-colors"
                        title="Xem thiệp"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      {inv.status !== 'ARCHIVED' && (
                        <button
                          onClick={() => handleArchive(inv.id)}
                          className="p-1.5 rounded-lg bg-[#2A302D] text-gray-400 hover:text-amber-400 transition-colors"
                          title="Lưu trữ thiệp"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
