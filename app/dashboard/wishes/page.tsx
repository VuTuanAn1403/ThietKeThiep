'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MessageSquare,
  Eye,
  EyeOff,
  Trash2,
  Search,
  Filter,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { WishService } from '@/services/wish.service';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Wish, Invitation } from '@/types/database.types';

export default function UserWishesPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [filterVisibility, setFilterVisibility] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [selectedInvId, setSelectedInvId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

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

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa vĩnh viễn lời chúc này?')) {
      await WishService.deleteWish(id);
      setWishes((prev) => prev.filter((w) => w.id !== id));
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
          <h1 className="text-2xl font-serif font-bold text-gray-900">Quản Lý Lời Chúc</h1>
          <p className="text-xs text-gray-500 mt-1">
            Tổng hợp tất cả lời chúc của khách mời gửi đến các thiệp mời của bạn
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e8dfd8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'VISIBLE', 'HIDDEN'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setFilterVisibility(v)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filterVisibility === v
                  ? 'bg-[#e85d75] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {v === 'ALL' ? 'Tất cả' : v === 'VISIBLE' ? 'Đang hiện' : 'Đã ẩn'}
            </button>
          ))}

          {invitations.length > 1 && (
            <select
              value={selectedInvId}
              onChange={(e) => setSelectedInvId(e.target.value)}
              className="px-3 py-1.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs font-semibold focus:outline-none"
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
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, nội dung lời chúc..."
            className="w-full pl-9 pr-4 py-2 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
          />
        </div>
      </div>

      {/* Wishes Table */}
      {filteredWishes.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e8dfd8] text-center space-y-3">
          <MessageSquare className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">Chưa có lời chúc nào</h3>
          <p className="text-xs text-gray-500">
            Khi khách mời mở thiệp và gửi lời chúc, toàn bộ nội dung sẽ hiển thị tại đây.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e8dfd8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fdfbf7] border-b border-[#e8dfd8] text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Người Gửi</th>
                  <th className="py-3.5 px-6">Nội Dung Lời Chúc</th>
                  <th className="py-3.5 px-6">Thiệp Mời</th>
                  <th className="py-3.5 px-6">Thời Gian</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredWishes.map((w) => {
                  const inv = invitations.find((i) => i.id === w.invitation_id);
                  return (
                    <tr key={w.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">{w.guest_name}</td>
                      <td className="py-4 px-6 text-gray-700 max-w-sm">{w.message}</td>
                      <td className="py-4 px-6 text-gray-500 font-semibold">{inv?.title || w.invitation_id}</td>
                      <td className="py-4 px-6 text-gray-400 text-[11px] font-mono">
                        {new Date(w.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            w.is_visible
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {w.is_visible ? 'Đang Hiện' : 'Đã Ẩn'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(w.id)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                              w.is_visible
                                ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {w.is_visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {w.is_visible ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button
                            onClick={() => handleDelete(w.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
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
    </div>
  );
}
