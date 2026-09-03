'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Search,
  CheckCircle,
  XCircle,
  HelpCircle,
  Users,
} from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { mockStore } from '@/lib/supabase/mock-store';
import { RSVP, Guest } from '@/types/database.types';

export default function AdminRSVPPage() {
  const [rsvps, setRsvps] = useState<RSVP[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE'>('ALL');
  const [search, setSearch] = useState('');

  useEffect(() => {
    setRsvps(mockStore.rsvps);
    setGuests(mockStore.guests);
  }, []);

  const attendingCount = rsvps.filter((r) => r.attendance === 'ATTENDING').length;
  const notAttendingCount = rsvps.filter((r) => r.attendance === 'NOT_ATTENDING').length;
  const maybeCount = rsvps.filter((r) => r.attendance === 'MAYBE').length;
  const totalGuestsSum = rsvps.reduce((acc, r) => acc + (r.attendance === 'ATTENDING' ? r.guest_count : 0), 0);

  const filtered = rsvps.filter((r) => {
    const matchFilter = filter === 'ALL' || r.attendance === filter;
    const g = guests.find((guest) => guest.id === r.guest_id);
    const matchSearch =
      (g?.name.toLowerCase().includes(search.toLowerCase()) ?? false) ||
      (r.note?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-white">Thống Kê RSVP Hệ Thống</h1>
        <p className="text-xs text-gray-400 mt-1">Tổng quan phản hồi tham dự của toàn bộ khách mời trên hệ thống</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 bg-[#212623] rounded-2xl border border-[#2F3531]">
          <span className="text-[11px] font-semibold text-gray-400">Tổng Phản Hồi</span>
          <div className="text-2xl font-bold text-white mt-1">{rsvps.length}</div>
        </div>
        <div className="p-4 bg-[#212623] rounded-2xl border border-emerald-900/60 bg-emerald-950/20">
          <span className="text-[11px] font-semibold text-emerald-400">Tham Dự</span>
          <div className="text-2xl font-bold text-emerald-400 mt-1">
            {attendingCount} <span className="text-xs font-normal text-emerald-500">({totalGuestsSum} người)</span>
          </div>
        </div>
        <div className="p-4 bg-[#212623] rounded-2xl border border-rose-900/60 bg-rose-950/20">
          <span className="text-[11px] font-semibold text-rose-400">Vắng Mặt</span>
          <div className="text-2xl font-bold text-rose-400 mt-1">{notAttendingCount}</div>
        </div>
        <div className="p-4 bg-[#212623] rounded-2xl border border-amber-900/60 bg-amber-950/20">
          <span className="text-[11px] font-semibold text-amber-400">Chưa Chắc Chắn</span>
          <div className="text-2xl font-bold text-amber-400 mt-1">{maybeCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-[#212623] p-4 rounded-2xl border border-[#2F3531] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {(['ALL', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                filter === st
                  ? 'bg-[#B76E79] text-white'
                  : 'bg-[#2A302D] text-gray-400 hover:text-white'
              }`}
            >
              {st === 'ALL' ? 'Tất cả' : st === 'ATTENDING' ? 'Tham dự' : st === 'NOT_ATTENDING' ? 'Vắng mặt' : 'Có thể'}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên khách, ghi chú..."
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
                <th className="py-3.5 px-6">Khách Mời / Guest ID</th>
                <th className="py-3.5 px-6">Trạng Thái Phản Hồi</th>
                <th className="py-3.5 px-6">Số Người Đi Kèm</th>
                <th className="py-3.5 px-6">Ghi Chú</th>
                <th className="py-3.5 px-6">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2F3531] font-medium text-gray-300">
              {filtered.map((r) => {
                const g = guests.find((guest) => guest.id === r.guest_id);
                return (
                  <tr key={r.id} className="hover:bg-[#2A302D]/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{g?.name || 'Khách mời ẩn danh'}</div>
                      <div className="text-[11px] font-mono text-gray-500">{r.guest_id}</div>
                    </td>
                    <td className="py-4 px-6">
                      {r.attendance === 'ATTENDING' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800 text-emerald-400 text-[10px] font-bold">
                          Tham dự
                        </span>
                      ) : r.attendance === 'NOT_ATTENDING' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-rose-950/70 border border-rose-800 text-rose-400 text-[10px] font-bold">
                          Vắng mặt
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-950/70 border border-amber-800 text-amber-400 text-[10px] font-bold">
                          Có thể
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-white">{r.guest_count}</td>
                    <td className="py-4 px-6 text-gray-400 max-w-xs truncate">{r.note || '-'}</td>
                    <td className="py-4 px-6 text-gray-500 font-mono text-[11px]">
                      {new Date(r.submitted_at).toLocaleDateString('vi-VN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
