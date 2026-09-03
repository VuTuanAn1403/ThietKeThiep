'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, UserCheck, UserX, HelpCircle, Clock, Search } from 'lucide-react';
import { RSVPService, RSVPStats } from '@/services/rsvp.service';
import { GuestService } from '@/services/guest.service';
import { InvitationService } from '@/services/invitation.service';
import { Guest, Invitation, RSVP } from '@/types/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RSVPManagementPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const invitationId = resolvedParams.id;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, RSVP>>({});
  const [stats, setStats] = useState<RSVPStats | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const inv = await InvitationService.getInvitationById(invitationId);
      setInvitation(inv);

      const gstList = await GuestService.getGuests(invitationId);
      setGuests(gstList);

      const rsvpMap: Record<string, RSVP> = {};
      for (const g of gstList) {
        const r = await RSVPService.getRSVPByGuestId(g.id);
        if (r) rsvpMap[g.id] = r;
      }
      setRsvps(rsvpMap);

      const st = await RSVPService.getInvitationRSVPStats(invitationId);
      setStats(st);
      setLoading(false);
    }
    load();
  }, [invitationId]);

  const filteredGuests = guests.filter((g) => {
    const rsvp = rsvps[g.id];
    if (search.trim()) {
      const q = search.toLowerCase();
      if (!g.name.toLowerCase().includes(q)) return false;
    }
    if (filter === 'ATTENDING') return rsvp?.attendance === 'ATTENDING';
    if (filter === 'NOT_ATTENDING') return rsvp?.attendance === 'NOT_ATTENDING';
    if (filter === 'MAYBE') return rsvp?.attendance === 'MAYBE';
    if (filter === 'PENDING') return !rsvp;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-600 hover:text-[#B76E79]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#292624]">Báo Cáo RSVP & Phản Hồi</h1>
            <p className="text-xs text-gray-500">{invitation?.title}</p>
          </div>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{stats.attending}</div>
                <div className="text-xs text-gray-500 font-medium">Tham Dự ({stats.totalGuestCountAttending} người)</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{stats.maybe}</div>
                <div className="text-xs text-gray-500 font-medium">Có Thể</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center flex-shrink-0">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{stats.notAttending}</div>
                <div className="text-xs text-gray-500 font-medium">Vắng Mặt</div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-100 text-gray-700 flex items-center justify-center flex-shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <div className="text-2xl font-bold text-[#292624] font-mono">{stats.pending}</div>
                <div className="text-xs text-gray-500 font-medium">Chưa Phản Hồi</div>
              </div>
            </div>
          </div>
        )}

        {/* Filter & Table */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD8] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên khách..."
              className="w-full pl-9 pr-3 py-2 bg-[#FFFDF9] border border-[#E8DFD8] rounded-xl text-xs focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto">
            {['all', 'ATTENDING', 'MAYBE', 'NOT_ATTENDING', 'PENDING'].map((st) => (
              <button
                key={st}
                onClick={() => setFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === st ? 'bg-[#B76E79] text-white' : 'bg-[#F4EFEB] text-gray-700'
                }`}
              >
                {st === 'all'
                  ? 'Tất Cả'
                  : st === 'ATTENDING'
                  ? 'Tham Dự'
                  : st === 'MAYBE'
                  ? 'Có Thể'
                  : st === 'NOT_ATTENDING'
                  ? 'Vắng Mặt'
                  : 'Chưa Trả Lời'}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF9] border-b border-[#E8DFD8] text-gray-500 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Khách Mời</th>
                  <th className="py-3.5 px-4">Nhóm</th>
                  <th className="py-3.5 px-4">Trạng Thái RSVP</th>
                  <th className="py-3.5 px-4">Số Người Đi Cùng</th>
                  <th className="py-3.5 px-4">Lời Nhắn / Ghi Chú</th>
                  <th className="py-3.5 px-4 text-right">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD8]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Đang tải dữ liệu RSVP...
                    </td>
                  </tr>
                ) : filteredGuests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Không có phản hồi nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredGuests.map((gst) => {
                    const rsvp = rsvps[gst.id];
                    return (
                      <tr key={gst.id} className="hover:bg-[#FFFDF9]/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#292624]">{gst.name}</td>
                        <td className="py-3.5 px-4 text-gray-600">{gst.group_name}</td>
                        <td className="py-3.5 px-4">
                          {rsvp ? (
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                                rsvp.attendance === 'ATTENDING'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : rsvp.attendance === 'MAYBE'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {rsvp.attendance === 'ATTENDING'
                                ? 'Tham dự'
                                : rsvp.attendance === 'MAYBE'
                                ? 'Có thể'
                                : 'Vắng mặt'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px]">
                              Chưa trả lời
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 font-semibold text-gray-700">
                          {rsvp ? `${rsvp.guest_count} người` : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-gray-600 max-w-xs truncate">{rsvp?.note || '—'}</td>
                        <td className="py-3.5 px-4 text-right text-gray-400 text-[11px]">
                          {rsvp ? new Date(rsvp.submitted_at).toLocaleDateString('vi-VN') : '—'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
