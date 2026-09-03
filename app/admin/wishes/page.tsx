'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Search,
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { mockStore } from '@/lib/supabase/mock-store';
import { WishService } from '@/services/wish.service';
import { Wish } from '@/types/database.types';

export default function AdminWishesPage() {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'VISIBLE' | 'HIDDEN'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setWishes([...mockStore.wishes]);
  }, []);

  const handleToggle = async (id: string) => {
    const updated = await WishService.toggleVisibility(id);
    if (updated) {
      setWishes((prev) => prev.map((w) => (w.id === id ? updated : w)));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Admin xác nhận xóa lời chúc này khỏi hệ thống?')) {
      await WishService.deleteWish(id);
      setWishes((prev) => prev.filter((w) => w.id !== id));
    }
  };

  const filtered = wishes.filter((w) => {
    const matchFilter =
      filter === 'ALL' ||
      (filter === 'VISIBLE' && w.is_visible) ||
      (filter === 'HIDDEN' && !w.is_visible);
    const matchSearch =
      w.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      w.message.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Kiểm Duyệt Lời Chúc Hệ Thống</h1>
        <p className="text-xs text-gray-400 mt-1">Kiểm tra và kiểm duyệt toàn bộ lời chúc khách mời gửi lên hệ thống</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#212623] p-4 rounded-2xl border border-[#2F3531] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'VISIBLE', 'HIDDEN'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === st
                  ? 'bg-[#B76E79] text-white'
                  : 'bg-[#2A302D] text-gray-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'VISIBLE' ? 'Đang hiện' : 'Đã ẩn'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo người gửi, nội dung..."
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
                <th className="py-3.5 px-6">Người Gửi</th>
                <th className="py-3.5 px-6">Nội Dung Lời Chúc</th>
                <th className="py-3.5 px-6">Thuộc Thiệp ID</th>
                <th className="py-3.5 px-6">Thời Gian</th>
                <th className="py-3.5 px-6">Trạng Thái</th>
                <th className="py-3.5 px-6 text-right">Kiểm Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F3531] font-medium text-gray-300">
              {filtered.map((w) => (
                <tr key={w.id} className="hover:bg-[#2A302D]/50 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">{w.guest_name}</td>
                  <td className="py-4 px-6 text-gray-300 max-w-sm">{w.message}</td>
                  <td className="py-4 px-6 font-mono text-gray-500 text-[11px]">{w.invitation_id}</td>
                  <td className="py-4 px-6 text-gray-500 font-mono text-[11px]">
                    {new Date(w.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        w.is_visible
                          ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {w.is_visible ? 'Đang Hiện' : 'Đã Ẩn'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(w.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors ${
                          w.is_visible
                            ? 'bg-[#2A302D] text-gray-300 hover:text-white'
                            : 'bg-emerald-900/40 border border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/60'
                        }`}
                      >
                        {w.is_visible ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {w.is_visible ? 'Ẩn' : 'Hiện'}
                      </button>
                      <button
                        onClick={() => handleDelete(w.id)}
                        className="p-1.5 text-gray-500 hover:text-rose-400 transition-colors"
                        title="Xóa lời chúc"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
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
