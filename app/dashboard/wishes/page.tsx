'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Search,
} from 'lucide-react';
import { WishService } from '@/services/wish.service';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Wish, Invitation } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';

export default function UserWishesPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filterVisibility, setFilterVisibility] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [selectedInvId, setSelectedInvId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState<Wish | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      const userId = currentUser?.id || 'usr-demo-01';
      const invs = await InvitationService.getUserInvitations(userId);
      setInvitations(invs);

      let allUserWishes: Wish[] = [];
      for (const inv of invs) {
        const w = await WishService.getAllWishes(inv.id);
        allUserWishes = allUserWishes.concat(w);
      }
      setWishes(allUserWishes);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const handleToggle = async (id: string) => {
    const updated = await WishService.toggleVisibility(id);
    if (updated) {
      setWishes((prev) => prev.map((w) => (w.id === id ? updated : w)));
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await WishService.deleteWish(deleteTarget.id);
      setWishes((prev) => prev.filter((w) => w.id !== deleteTarget.id));
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredWishes = wishes.filter((w) => {
    const matchVis =
      filterVisibility === 'ALL' ||
      (filterVisibility === 'VISIBLE' && w.is_visible) ||
      (filterVisibility === 'HIDDEN' && !w.is_visible);
    const matchInv = selectedInvId === 'ALL' || w.invitation_id === selectedInvId;
    const matchSearch =
      w.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      w.message.toLowerCase().includes(search.toLowerCase());
    return matchVis && matchInv && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Quản Lý Lời Chúc</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Tổng hợp tất cả lời chúc của người thân và bạn bè gửi đến qua các thiệp cưới online của bạn
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'VISIBLE', 'HIDDEN'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterVisibility(v)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                filterVisibility === v
                  ? 'bg-[var(--primary,#B76E79)] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
              }`}
            >
              {v === 'ALL' ? 'Tất cả' : v === 'VISIBLE' ? 'Đang hiện' : 'Đã ẩn'}
            </button>
          ))}

          {invitations.length > 1 && (
            <select
              value={selectedInvId}
              onChange={(e) => setSelectedInvId(e.target.value)}
              className="px-3 py-1.5 bg-[#FFFDF9] border border-neutral-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
            >
              <option value="ALL">Tất cả thiệp</option>
              {invitations.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, nội dung lời chúc..."
            className="w-full pl-9 pr-4 py-2 bg-[#FFFDF9] border border-neutral-200/80 rounded-xl text-xs focus:ring-2 focus:ring-[#B76E79] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Wishes Table */}
      {loading ? (
        <div className="py-20">
          <LoadingState message="Đang tải danh sách lời chúc..." />
        </div>
      ) : filteredWishes.length === 0 ? (
        <EmptyState
          icon={<MessageSquare className="w-6 h-6 text-neutral-400" />}
          title="Chưa có lời chúc nào"
          description="Khi khách mời mở thiệp và gửi lời chúc, toàn bộ nội dung sẽ hiển thị tại đây."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF9] border-b border-neutral-200/80 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Người Gửi</th>
                  <th className="py-3.5 px-6">Nội Dung Lời Chúc</th>
                  <th className="py-3.5 px-6">Thiệp Cưới</th>
                  <th className="py-3.5 px-6">Thời Gian</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filteredWishes.map((w) => {
                  const inv = invitations.find((i) => i.id === w.invitation_id);
                  return (
                    <tr key={w.id} className="hover:bg-neutral-50/70 transition-colors">
                      <td className="py-4 px-6 font-bold text-neutral-900">{w.guest_name}</td>
                      <td className="py-4 px-6 text-neutral-700 max-w-sm leading-relaxed">{w.message}</td>
                      <td className="py-4 px-6 text-neutral-500 font-semibold">{inv?.title || w.invitation_id}</td>
                      <td className="py-4 px-6 text-neutral-400 text-[11px] font-mono">
                        {new Date(w.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-6">
                        <Badge variant={w.is_visible ? 'success' : 'neutral'} size="sm">
                          {w.is_visible ? 'Đang Hiện' : 'Đã Ẩn'}
                        </Badge>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(w.id)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                              w.is_visible
                                ? 'border-neutral-200 text-neutral-600 hover:bg-neutral-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {w.is_visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {w.is_visible ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button
                            onClick={() => setDeleteTarget(w)}
                            className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Xóa lời chúc"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Accessible ConfirmDialog for deletion */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Xóa lời chúc"
        message={`Bạn có chắc muốn xóa vĩnh viễn lời chúc từ "${deleteTarget?.guest_name}"? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận xóa"
        cancelText="Hủy bỏ"
        isDestructive={true}
        isLoading={isDeleting}
      />
    </div>
  );
}
