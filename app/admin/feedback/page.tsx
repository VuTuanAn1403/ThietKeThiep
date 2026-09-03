'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Search,
  CheckCircle,
  Clock,
  Star,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { FeedbackService } from '@/services/feedback.service';
import { Feedback, FeedbackStatus } from '@/types/database.types';

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [filter, setFilter] = useState<'ALL' | FeedbackStatus>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const list = await FeedbackService.getAllFeedback();
      setFeedbacks(list);
      setLoading(false);
    }
    load();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: FeedbackStatus) => {
    const res = await FeedbackService.updateStatus(id, newStatus);
    if (res.feedback) {
      setFeedbacks((prev) => prev.map((f) => (f.id === id ? res.feedback! : f)));
    }
  };

  const filtered = feedbacks.filter((f) => {
    const matchFilter = filter === 'ALL' || f.status === filter;
    const matchSearch =
      f.title.toLowerCase().includes(search.toLowerCase()) ||
      f.content.toLowerCase().includes(search.toLowerCase()) ||
      f.user_id.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Quản Lý Góp Ý & Phản Hồi Người Dùng</h1>
        <p className="text-xs text-gray-400 mt-1">Tiếp nhận đánh giá, báo lỗi và ý kiến đóng góp tính năng từ các thành viên</p>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#212623] p-4 rounded-2xl border border-[#2F3531] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'NEW', 'REVIEWING', 'RESOLVED', 'CLOSED'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === st
                  ? 'bg-[#B76E79] text-white'
                  : 'bg-[#2A302D] text-gray-400 hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'Tất cả'
                : st === 'NEW'
                ? 'Mới gửi'
                : st === 'REVIEWING'
                ? 'Đang xem xét'
                : st === 'RESOLVED'
                ? 'Đã xử lý'
                : 'Đã đóng'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tiêu đề, nội dung..."
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
                <th className="py-3.5 px-6">Loại / Đánh Giá</th>
                <th className="py-3.5 px-6">Tiêu Đề & Nội Dung</th>
                <th className="py-3.5 px-6">User ID</th>
                <th className="py-3.5 px-6">Trạng Thái</th>
                <th className="py-3.5 px-6">Thời Gian</th>
                <th className="py-3.5 px-6 text-right">Chuyển Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F3531] font-medium text-gray-300">
              {filtered.map((fb) => (
                <tr key={fb.id} className="hover:bg-[#2A302D]/50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-bold text-white mb-1">{fb.type}</div>
                    <div className="flex items-center text-amber-400">
                      {[...Array(fb.rating)].map((_, i) => (
                        <Star key={i} className="w-3 h-3 fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="py-4 px-6 max-w-md">
                    <div className="font-bold text-white text-xs">{fb.title}</div>
                    <div className="text-gray-400 text-xs mt-1 leading-relaxed">{fb.content}</div>
                  </td>
                  <td className="py-4 px-6 font-mono text-gray-500 text-[11px]">{fb.user_id}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        fb.status === 'RESOLVED'
                          ? 'bg-emerald-950/70 border border-emerald-800 text-emerald-400'
                          : fb.status === 'REVIEWING'
                          ? 'bg-blue-950/70 border border-blue-800 text-blue-400'
                          : fb.status === 'NEW'
                          ? 'bg-amber-950/70 border border-amber-800 text-amber-400'
                          : 'bg-gray-800 text-gray-400'
                      }`}
                    >
                      {fb.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-500 font-mono text-[11px]">
                    {new Date(fb.created_at).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <select
                      value={fb.status}
                      onChange={(e) => handleUpdateStatus(fb.id, e.target.value as FeedbackStatus)}
                      className="px-2.5 py-1 rounded-lg bg-[#2A302D] border border-[#3A403C] text-xs text-gray-200 focus:outline-none focus:border-[#B76E79]"
                    >
                      <option value="NEW">Mới (NEW)</option>
                      <option value="REVIEWING">Đang xem xét</option>
                      <option value="RESOLVED">Đã giải quyết</option>
                      <option value="CLOSED">Đã đóng</option>
                    </select>
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
