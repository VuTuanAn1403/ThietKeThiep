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
} from 'lucide-react';
import { RSVPService } from '@/services/rsvp.service';
import { GuestService } from '@/services/guest.service';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Guest, RSVP, Invitation } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';

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
          <h1 className="text-2xl font-serif font-bold text-neutral-900">Xác Nhận Tham Dự (RSVP)</h1>
          <p className="text-xs text-neutral-500 mt-1">
            Theo dõi danh sách và tỷ lệ phản hồi tham dự của tất cả khách mời
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="px-4 py-2 rounded-xl bg-white border border-neutral-200 text-neutral-700 text-xs font-semibold hover:bg-neutral-50 transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
        >
          <Download className="w-4 h-4 text-neutral-500" /> Xuất File CSV
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-soft">
          <span className="text-[11px] font-medium text-neutral-500">Tổng Khách Mời</span>
          <div className="text-2xl font-bold font-serif text-neutral-900 mt-1">{records.length}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-emerald-200 bg-emerald-50/30 shadow-soft">
          <span className="text-[11px] font-medium text-emerald-800">Sẽ Tham Dự</span>
          <div className="text-2xl font-bold font-serif text-emerald-600 mt-1">
            {attendingCount} <span className="text-xs font-sans font-normal text-emerald-700">({totalGuestCount} người)</span>
          </div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-rose-200 bg-rose-50/30 shadow-soft">
          <span className="text-[11px] font-medium text-rose-800">Vắng Mặt</span>
          <div className="text-2xl font-bold font-serif text-rose-600 mt-1">{notAttendingCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-amber-200 bg-amber-50/30 shadow-soft">
          <span className="text-[11px] font-medium text-amber-800">Chưa Chắc Chắn</span>
          <div className="text-2xl font-bold font-serif text-amber-600 mt-1">{maybeCount}</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-neutral-200/80 shadow-soft">
          <span className="text-[11px] font-medium text-neutral-500">Chưa Phản Hồi</span>
          <div className="text-2xl font-bold font-serif text-neutral-600 mt-1">{pendingCount}</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-soft flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {(['ALL', 'ATTENDING', 'NOT_ATTENDING', 'MAYBE', 'PENDING'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-[var(--primary,#B76E79)] text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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
            placeholder="Tìm theo tên, điện thoại..."
            className="w-full pl-9 pr-4 py-2 bg-[#FFFDF9] border border-neutral-200/80 rounded-xl text-xs focus:ring-2 focus:ring-[#B76E79] focus:outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="py-20">
          <LoadingState message="Đang tải dữ liệu RSVP..." />
        </div>
      ) : filteredRecords.length === 0 ? (
        <EmptyState
          icon={<Users className="w-6 h-6 text-neutral-400" />}
          title="Không có dữ liệu RSVP"
          description="Chưa có bản ghi nào khớp với điều kiện tìm kiếm hoặc bộ lọc hiện tại."
        />
      ) : (
        <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-soft overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF9] border-b border-neutral-200/80 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Khách Mời</th>
                  <th className="py-3.5 px-6">Thiệp Cưới</th>
                  <th className="py-3.5 px-6">Nhóm</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6">Số Lượng</th>
                  <th className="py-3.5 px-6">Ghi Chú</th>
                  <th className="py-3.5 px-6">Thời Gian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 font-medium">
                {filteredRecords.map((r, idx) => (
                  <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-neutral-900">{r.guest.name}</div>
                      {r.guest.phone && <div className="text-[11px] text-neutral-400">{r.guest.phone}</div>}
                    </td>
                    <td className="py-4 px-6 text-neutral-700 font-semibold">{r.invitationTitle}</td>
                    <td className="py-4 px-6">
                      <Badge variant="neutral" size="sm">
                        {r.guest.group_name}
                      </Badge>
                    </td>
                    <td className="py-4 px-6">
                      {r.rsvp ? (
                        r.rsvp.attendance === 'ATTENDING' ? (
                          <Badge variant="success" size="sm">
                            <CheckCircle className="w-3 h-3 mr-1 inline" /> Tham dự
                          </Badge>
                        ) : r.rsvp.attendance === 'NOT_ATTENDING' ? (
                          <Badge variant="danger" size="sm">
                            <XCircle className="w-3 h-3 mr-1 inline" /> Vắng mặt
                          </Badge>
                        ) : (
                          <Badge variant="warning" size="sm">
                            <HelpCircle className="w-3 h-3 mr-1 inline" /> Có thể
                          </Badge>
                        )
                      ) : (
                        <Badge variant="neutral" size="sm">
                          Chưa trả lời
                        </Badge>
                      )}
                    </td>
                    <td className="py-4 px-6 font-mono font-bold text-neutral-800">
                      {r.rsvp ? r.rsvp.guest_count : '-'}
                    </td>
                    <td className="py-4 px-6 text-neutral-600 max-w-xs truncate">
                      {r.rsvp?.note || '-'}
                    </td>
                    <td className="py-4 px-6 text-neutral-400 text-[11px] font-mono">
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
