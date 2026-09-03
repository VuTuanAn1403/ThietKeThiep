'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Search,
  ExternalLink,
  Edit,
  Users,
  CheckCircle,
  MessageSquare,
  BarChart2,
  Trash2,
  AlertCircle,
  Share2,
  Copy,
  Check,
} from 'lucide-react';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Invitation } from '@/types/database.types';

export default function MyInvitationsPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const userId = currentUser?.id || 'usr-demo-01';
      const list = await InvitationService.getUserInvitations(userId);
      setInvitations(list);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa thiệp mời này cùng toàn bộ dữ liệu khách và lời chúc?')) {
      await InvitationService.deleteInvitation(id);
      setInvitations((prev) => prev.filter((i) => i.id !== id));
    }
  };

  const handleCopyLink = (slug: string, id: string) => {
    const url = `${window.location.origin}/i/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredInvitations = invitations.filter((inv) => {
    const matchFilter = filter === 'ALL' || inv.status === filter;
    const matchSearch = inv.title.toLowerCase().includes(search.toLowerCase()) || inv.venue_name.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Thiệp Của Tôi</h1>
          <p className="text-xs text-gray-500 mt-1">Danh sách toàn bộ thiệp mời online bạn đã khởi tạo</p>
        </div>
        <Link
          href="/dashboard/invitations/new"
          className="px-5 py-2.5 rounded-full bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Tạo Thiệp Mới
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e8dfd8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === st
                  ? 'bg-[#e85d75] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'PUBLISHED' ? 'Đã Xuất Bản' : 'Bản Nháp'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên thiệp, địa điểm..."
            className="w-full pl-9 pr-4 py-2 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
          />
        </div>
      </div>

      {/* Invitations Table / Grid */}
      {filteredInvitations.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e8dfd8] text-center space-y-3">
          <FileText className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">Không tìm thấy thiệp mời</h3>
          <p className="text-xs text-gray-500">Hãy tạo thiệp mời mới để bắt đầu chia sẻ đến bạn bè và người thân.</p>
          <Link
            href="/dashboard/invitations/new"
            className="inline-block mt-2 px-5 py-2.5 rounded-xl bg-[#e85d75] text-white text-xs font-semibold"
          >
            Tạo Thiệp Ngay
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-3xl border border-[#e8dfd8] shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span
                    className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                      inv.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {inv.status === 'PUBLISHED' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                  </span>
                  <span className="text-xs font-mono text-gray-500">{inv.event_date}</span>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-gray-900">{inv.title}</h3>
                  <p className="text-xs text-gray-500 truncate mt-1">📍 {inv.venue_name}</p>
                  <p className="text-[11px] font-mono text-gray-400 mt-1">/i/{inv.slug}</p>
                </div>

                {/* Sub Navigation Links for this Invitation */}
                <div className="grid grid-cols-4 gap-2 pt-2 border-t border-gray-100 text-center text-[11px] font-semibold text-gray-600">
                  <Link
                    href={`/dashboard/invitations/${inv.id}/guests`}
                    className="p-2 rounded-xl hover:bg-gray-50 hover:text-[#e85d75] transition-colors"
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                    Khách mời
                  </Link>
                  <Link
                    href={`/dashboard/invitations/${inv.id}/rsvp`}
                    className="p-2 rounded-xl hover:bg-gray-50 hover:text-[#e85d75] transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    RSVP
                  </Link>
                  <Link
                    href={`/dashboard/invitations/${inv.id}/wishes`}
                    className="p-2 rounded-xl hover:bg-gray-50 hover:text-[#e85d75] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    Lời chúc
                  </Link>
                  <Link
                    href={`/dashboard/invitations/${inv.id}/analytics`}
                    className="p-2 rounded-xl hover:bg-gray-50 hover:text-[#e85d75] transition-colors"
                  >
                    <BarChart2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    Thống kê
                  </Link>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-[#fdfbf7] px-6 py-3 border-t border-[#e8dfd8] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/invitations/${inv.id}/edit`}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold text-gray-700 hover:text-[#e85d75] flex items-center gap-1 shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" /> Sửa
                  </Link>
                  <Link
                    href={`/i/${inv.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold text-gray-700 hover:text-blue-600 flex items-center gap-1 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Xem
                  </Link>
                  <button
                    onClick={() => handleCopyLink(inv.slug, inv.id)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 font-semibold text-gray-700 hover:text-emerald-600 flex items-center gap-1 shadow-xs"
                  >
                    {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === inv.id ? 'Đã chép' : 'Link'}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(inv.id)}
                  className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                  title="Xóa thiệp"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
