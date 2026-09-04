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
  Copy,
  Check,
} from 'lucide-react';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Invitation } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';

export default function MyInvitationsPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const userId = currentUser?.id || 'usr-demo-01';
      const list = await InvitationService.getUserInvitations(userId);
      setInvitations(list);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await InvitationService.deleteInvitation(deleteTarget.id);
      setInvitations((prev) => prev.filter((i) => i.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
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
    const matchSearch =
      inv.title.toLowerCase().includes(search.toLowerCase()) ||
      (inv.venue_name && inv.venue_name.toLowerCase().includes(search.toLowerCase()));
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Thiệp Của Tôi</h1>
          <p className="text-xs text-neutral-500 mt-1">Danh sách toàn bộ thiệp cưới online bạn đã khởi tạo</p>
        </div>
        <Link
          href="/dashboard/invitations/new"
          className="px-4 py-2.5 rounded-xl bg-[var(--primary,#B76E79)] text-white text-xs font-semibold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
        >
          <PlusCircle className="w-4 h-4" /> Tạo Thiệp Mới
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PUBLISHED', 'DRAFT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer shrink-0 ${
                filter === st
                  ? 'bg-[var(--primary,#B76E79)] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'PUBLISHED' ? 'Đã Xuất Bản' : 'Bản Nháp'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên thiệp, địa điểm..."
            className="w-full pl-9 pr-4 py-2 bg-[#FFFDF9] border border-neutral-200/80 rounded-xl text-xs focus:ring-2 focus:ring-[#B76E79] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Invitations Grid */}
      {loading ? (
        <div className="py-20">
          <LoadingState message="Đang tải danh sách thiệp cưới..." />
        </div>
      ) : filteredInvitations.length === 0 ? (
        <EmptyState
          icon={<FileText className="w-6 h-6 text-neutral-400" />}
          title="Không tìm thấy thiệp cưới nào"
          description={
            search
              ? 'Không có kết quả khớp với từ khóa tìm kiếm của bạn.'
              : 'Hãy tạo thiệp cưới online đầu tiên để chia sẻ khoảnh khắc đẹp đến người thân và bạn bè.'
          }
          action={
            search
              ? undefined
              : {
                  label: 'Tạo Thiệp Mới',
                  onClick: () => (window.location.href = '/dashboard/invitations/new'),
                }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInvitations.map((inv) => (
            <div
              key={inv.id}
              className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft overflow-hidden flex flex-col justify-between hover:shadow-card transition-all"
            >
              <div className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge variant={inv.status === 'PUBLISHED' ? 'success' : 'warning'} size="sm">
                    {inv.status === 'PUBLISHED' ? 'Đã Xuất Bản' : 'Bản Nháp'}
                  </Badge>
                  <span className="text-xs font-mono text-neutral-500">{inv.event_date}</span>
                </div>

                <div>
                  <h3 className="text-lg font-serif font-bold text-neutral-900 leading-snug">{inv.title}</h3>
                  <p className="text-xs text-neutral-500 truncate mt-1">📍 {inv.venue_name || 'Chưa đặt địa điểm'}</p>
                  <p className="text-[11px] font-mono text-neutral-400 mt-1">/i/{inv.slug}</p>
                </div>

                {/* Sub Navigation Links for this Invitation */}
                <div className="grid grid-cols-4 gap-2 pt-3 border-t border-neutral-100 text-center text-[11px] font-semibold text-neutral-600">
                  <Link
                    href={`/dashboard/invitations/${inv.id}/guests`}
                    className="p-2 rounded-xl hover:bg-neutral-50 hover:text-[#B76E79] transition-colors"
                  >
                    <Users className="w-4 h-4 mx-auto mb-1 text-teal-600" />
                    Khách mời
                  </Link>
                  <Link
                    href={`/dashboard/invitations/${inv.id}/rsvp`}
                    className="p-2 rounded-xl hover:bg-neutral-50 hover:text-[#B76E79] transition-colors"
                  >
                    <CheckCircle className="w-4 h-4 mx-auto mb-1 text-emerald-600" />
                    RSVP
                  </Link>
                  <Link
                    href={`/dashboard/invitations/${inv.id}/wishes`}
                    className="p-2 rounded-xl hover:bg-neutral-50 hover:text-[#B76E79] transition-colors"
                  >
                    <MessageSquare className="w-4 h-4 mx-auto mb-1 text-purple-600" />
                    Lời chúc
                  </Link>
                  <Link
                    href={`/dashboard/invitations/${inv.id}/analytics`}
                    className="p-2 rounded-xl hover:bg-neutral-50 hover:text-[#B76E79] transition-colors"
                  >
                    <BarChart2 className="w-4 h-4 mx-auto mb-1 text-blue-600" />
                    Thống kê
                  </Link>
                </div>
              </div>

              {/* Action Footer */}
              <div className="bg-[#FFFDF9] px-6 py-3 border-t border-neutral-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/dashboard/invitations/${inv.id}/edit`}
                    className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 font-semibold text-neutral-700 hover:text-[#B76E79] flex items-center gap-1 shadow-xs"
                  >
                    <Edit className="w-3.5 h-3.5" /> Sửa
                  </Link>
                  <Link
                    href={`/i/${inv.slug}`}
                    target="_blank"
                    className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 font-semibold text-neutral-700 hover:text-blue-600 flex items-center gap-1 shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Xem
                  </Link>
                  <button
                    onClick={() => handleCopyLink(inv.slug, inv.id)}
                    className="px-3 py-1.5 rounded-lg bg-white border border-neutral-200 font-semibold text-neutral-700 hover:text-emerald-600 flex items-center gap-1 shadow-xs cursor-pointer"
                  >
                    {copiedId === inv.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedId === inv.id ? 'Đã chép' : 'Link'}
                  </button>
                </div>

                <button
                  onClick={() => setDeleteTarget(inv)}
                  className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                  title="Xóa thiệp"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible ConfirmDialog for deletion */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xóa thiệp cưới"
        message={`Bạn có chắc chắn muốn xóa thiệp "${deleteTarget?.title}"? Toàn bộ danh sách khách mời, phản hồi RSVP và lời chúc gắn kèm sẽ bị xóa vĩnh viễn.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
