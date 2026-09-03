'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  XCircle,
  HelpCircle,
  Users,
  Download,
  Search,
  Filter,
  ArrowRight,
} from 'lucide-react';
import { RSVPService } from '@/services/rsvp.service';
import { GuestService } from '@/services/guest.service';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Guest, RSVP, Invitation } from '@/types/database.types';

interface RSVPRecord {
  guest: Guest;
  rsvp: RSVP | null;
  invitationTitle: string;
}

export default function UserRSVPPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [records, setRecords] = useState<RSVPRecord[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ATTENDING' | 'NOT_ATTENDING' | 'MAYBE' | 'PENDING'>('ALL');
  const [selectedInvId, setSelectedInvId] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const userId = currentUser?.id || 'usr-demo-01';
      const invs = await InvitationService.getUserInvitations(userId);
      setInvitations(invs);

      let allRecords: RSVPRecord[] = [];
      for (const inv of invs) {
        const guests = await GuestService.getGuests(inv.id);
        for (const g of guests) {
          const r = await RSVPService.getRSVPByGuestId(g.id);
          allRecords.push({
            guest: g,
            rsvp: r,
            invitationTitle: inv.title,
          });
        }
      }

      setRecords(allRecords);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const attendingCount = records.filter((r) => r.rsvp?.attendance === 'ATTENDING').length;
  const notAttendingCount = records.filter((r) => r.rsvp?.attendance === 'NOT_ATTENDING').length;
  const maybeCount = records.filter((r) => r.rsvp?.attendance === 'MAYBE').length;
  const pendingCount = records.filter((r) => !r.rsvp).length;
  const totalGuestCount = records.reduce((acc, r) => acc + (r.rsvp?.attendance === 'ATTENDING' ? r.rsvp.guest_count : 0), 0);

  const handleExportCSV = () => {
    const headers = ['Tên khách mời', 'Thiệp mời', 'Nhóm', 'Điện thoại', 'Trạng thái', 'Số lượng', 'Ghi chú'];
    const rows = filteredRecords.map((r) => [
      `"${r.guest.name}"`,
      `"${r.invitationTitle}"`,
      `"${r.guest.group_name}"`,
      `"${r.guest.phone || ''}"`,
      `"${r.rsvp ? (r.rsvp.attendance === 'ATTENDING' ? 'Tham dự' : r.rsvp.attendance === 'NOT_ATTENDING' ? 'Vắng mặt' : 'Có thể') : 'Chưa trả lời'}"`,
      r.rsvp ? r.rsvp.guest_count : 0,
      `"${r.rsvp?.note || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `danh-sach-rsvp-${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredRecords = records.filter((r) => {
    let matchStatus = true;
    if (statusFilter === 'ATTENDING') matchStatus = r.rsvp?.attendance === 'ATTENDING';
    else if (statusFilter === 'NOT_ATTENDING') matchStatus = r.rsvp?.attendance === 'NOT_ATTENDING';
    else if (statusFilter === 'MAYBE') matchStatus = r.rsvp?.attendance === 'MAYBE';
    else if (statusFilter === 'PENDING') matchStatus = !r.rsvp;

    const matchInv = selectedInvId === 'ALL' || r.guest.invitation_id === selectedInvId;
    const matchSearch =
      r.guest.name.toLowerCase().includes(search.toLowerCase()) ||
      (r.guest.phone && r.guest.phone.includes(search)) ||
      r.invitationTitle.toLowerCase().includes(search.toLowerCase());

    return matchStatus && matchInv && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Export */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900">Xác Nhận Tham Dự (RSVP)</h1>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi danh sách và tỷ lệ phản hồi của tất cả khách mời
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-white border border-[#e8dfd8] text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Download className="w-4 h-4 text-gray-500" /> Xuất File CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-[#e8dfd8] shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500">Tổng Khách</span>
          <div className="text-2xl font-bold text-gray-900 mt-1">{records.length}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <span className="text-[11px] font-semibold text-emerald-800">Sẽ Tham Dự</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {attendingCount} <span className="text-xs font-normal text-emerald-700">({totalGuestCount} người)</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/40 shadow-xs">
          <span className="text-[11px] font-semibold text-rose-800">Vắng Mặt</span>
          <div className="text-2xl font-bold text-rose-600 mt-1">{notAttendingCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/40 shadow-xs">
          <span className="text-[11px] font-semibold text-amber-800">Chưa Chắc Chắn</span>
          <div className="text-2xl font-bold text-amber-600 mt-1">{maybeCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-[11px] font-semibold text-gray-500">Chưa Phản Hồi</span>
          <div className="text-2xl font-bold text-gray-600 mt-1">{pendingCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e8dfd8] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE', 'PENDING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                statusFilter === st
                  ? 'bg-[#e85d75] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {st === 'ALL'
                ? 'Tất cả'
                : st === 'ATTENDING'
                ? 'Tham dự'
                : st === 'NOT_ATTENDING'
                ? 'Vắng mặt'
                : st === 'MAYBE'
                ? 'Có thể'
                : 'Chưa trả lời'}
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
            placeholder="Tìm theo tên, điện thoại..."
            className="w-full pl-9 pr-4 py-2 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e8dfd8] text-center space-y-3">
          <Users className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">Không có dữ liệu RSVP</h3>
          <p className="text-xs text-gray-500">Chưa có bản ghi nào khớp với điều kiện tìm kiếm.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e8dfd8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fdfbf7] border-b border-[#e8dfd8] text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Khách Mời</th>
                  <th className="py-3.5 px-6">Thiệp Mời</th>
                  <th className="py-3.5 px-6">Nhóm</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6">Số Người</th>
                  <th className="py-3.5 px-6">Ghi Chú</th>
                  <th className="py-3.5 px-6">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-gray-900">{r.guest.name}</div>
                      {r.guest.phone && <div className="text-[11px] text-gray-400">{r.guest.phone}</div>}
                    </td>
                    <td className="py-4 px-6 text-gray-700 font-semibold">{r.invitationTitle}</td>
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold">
                        {r.guest.group_name}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {r.rsvp ? (
                        r.rsvp.attendance === 'ATTENDING' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold inline-flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" /> Tham dự
                          </span>
                        ) : r.rsvp.attendance === 'NOT_ATTENDING' ? (
                          <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold inline-flex items-center gap-1">
                            <XCircle className="w-3 h-3" /> Vắng mặt
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold inline-flex items-center gap-1">
                            <HelpCircle className="w-3 h-3" /> Có thể
                          </span>
                        )
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold">
                          Chưa trả lời
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-gray-800">
                      {r.rsvp ? r.rsvp.guest_count : '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-600 max-w-xs truncate">
                      {r.rsvp?.note || '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-[11px] font-mono">
                      {r.rsvp ? new Date(r.rsvp.submitted_at).toLocaleDateString('vi-VN') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
