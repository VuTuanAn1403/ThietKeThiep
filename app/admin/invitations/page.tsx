'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  Search,
  ExternalLink,
  Archive,
  RefreshCw,
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { Invitation } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function AdminInvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'ALL' | 'PUBLISHED' | 'DRAFT' | 'ARCHIVED'>('ALL');
  const [loading, setLoading] = useState(true);
  const [archiveTarget, setArchiveTarget] = useState<Invitation | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const list = await AdminService.getAllInvitations();
    setInvitations(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      const updated = await AdminService.archiveInvitation(archiveTarget.id);
      if (updated) {
        setInvitations((prev) => prev.map((i) => (i.id === archiveTarget.id ? updated : i)));
      }
      setArchiveTarget(null);
    } finally {
      setIsArchiving(false);
    }
  };

  const filtered = invitations.filter((inv) => {
    const matchFilter = filter === 'ALL' || inv.status === filter;
    const matchSearch =
      inv.title.toLowerCase().includes(search.toLowerCase()) ||
      (inv.venue_name && inv.venue_name.toLowerCase().includes(search.toLowerCase())) ||
      inv.slug.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-admin-text flex items-center gap-2">
            <FileText className="w-5 h-5 text-admin-accent" /> Quản Lý Thiệp Cưới Toàn Hệ Thống
          </h1>
          <p className="text-xs sm:text-sm text-admin-muted mt-0.5">
            Danh sách tất cả các thiệp cưới online do thành viên khởi tạo trên nền tảng
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="admin-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="admin-card p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'PUBLISHED', 'DRAFT', 'ARCHIVED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-xs ${
                filter === st
                  ? 'bg-admin-accent text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'PUBLISHED' ? 'Đã Xuất Bản' : st === 'DRAFT' ? 'Bản Nháp' : 'Đã Lưu Trữ'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-admin-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, slug, địa điểm..."
            className="admin-input pl-9 text-xs"
          />
        </div>
      </div>

      {/* Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tên Thiệp / Slug</th>
                <th>Chủ Tiệc / User ID</th>
                <th>Ngày Sự Kiện</th>
                <th>Địa Điểm</th>
                <th>Trạng Thái</th>
                <th className="text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-admin-muted text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-admin-accent" />
                    Đang tải danh sách thiệp...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-admin-muted text-xs">
                    Không có thiệp nào phù hợp với bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filtered.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td>
                      <div className="font-bold text-neutral-900 text-xs">{inv.title}</div>
                      <div className="text-[11px] font-mono text-admin-accent mt-0.5">/i/{inv.slug}</div>
                    </td>
                    <td>
                      <div className="font-medium text-neutral-800 text-xs">{inv.host_name || 'Chưa đặt'}</div>
                      <div className="text-[10px] font-mono text-admin-muted">{inv.user_id}</div>
                    </td>
                    <td className="font-mono text-xs text-neutral-600">{inv.event_date}</td>
                    <td className="text-neutral-600 text-xs max-w-xs truncate">{inv.venue_name || 'Chưa đặt'}</td>
                    <td>
                      <Badge
                        variant={
                          inv.status === 'PUBLISHED'
                            ? 'success'
                            : inv.status === 'DRAFT'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {inv.status}
                      </Badge>
                    </td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/i/${inv.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-admin-accent hover:bg-neutral-50 transition-colors"
                          title="Xem trước thiệp"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        {inv.status !== 'ARCHIVED' && (
                          <button
                            onClick={() => setArchiveTarget(inv)}
                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Lưu trữ thiệp"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Accessible ConfirmDialog for Archive */}
      <ConfirmDialog
        isOpen={Boolean(archiveTarget)}
        onClose={() => setArchiveTarget(null)}
        onConfirm={confirmArchive}
        title="Lưu trữ thiệp cưới"
        message={`Bạn có chắc chắn muốn chuyển thiệp "${archiveTarget?.title}" sang trạng thái lưu trữ (ARCHIVED)?`}
        confirmText="Xác nhận lưu trữ"
        cancelText="Hủy bỏ"
        isDestructive={false}
        isLoading={isArchiving}
      />
    </div>
  );
}
