'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Search,
  Plus,
  QrCode,
  Copy,
  Trash2,
  Edit2,
  FileSpreadsheet,
  Check,
  X,
  AlertCircle,
} from 'lucide-react';
import { GuestService } from '@/services/guest.service';
import { RSVPService } from '@/services/rsvp.service';
import { InvitationService } from '@/services/invitation.service';
import { Guest, Invitation, RSVP } from '@/types/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function GuestManagementPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const invitationId = resolvedParams.id;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [rsvps, setRsvps] = useState<Record<string, RSVP>>({});

  const [search, setSearch] = useState<string>('');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showCSVModal, setShowCSVModal] = useState<boolean>(false);
  const [activeQRGuest, setActiveQRGuest] = useState<{ guest: Guest; qrUrl: string } | null>(null);

  // Add form fields
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [groupName, setGroupName] = useState<string>('Khách mời');
  const [maxGuests, setMaxGuests] = useState<number>(1);

  // CSV content state
  const [csvRaw, setCsvRaw] = useState<string>('');
  const [csvResult, setCsvResult] = useState<{ total: number; success: number; failed: number; errors: string[] } | null>(null);

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const inv = await InvitationService.getInvitationById(invitationId);
    setInvitation(inv);

    const list = await GuestService.getGuests(invitationId, selectedGroup, search);
    setGuests(list);

    const rsvpMap: Record<string, RSVP> = {};
    for (const g of list) {
      const r = await RSVPService.getRSVPByGuestId(g.id);
      if (r) rsvpMap[g.id] = r;
    }
    setRsvps(rsvpMap);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [invitationId, selectedGroup, search]);

  const showToast = (text: string) => {
    setToastMsg(text);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleAddGuest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const res = await GuestService.createGuest(invitationId, {
      name: name.trim(),
      phone: phone.trim() || null,
      email: email.trim() || null,
      groupName: groupName.trim() || 'Khách mời',
      maxGuests: maxGuests || 1,
    });

    if (res.error) {
      alert(res.error);
    } else {
      setShowAddModal(false);
      setName('');
      setPhone('');
      setEmail('');
      showToast('Đã thêm khách mời thành công!');
      loadData();
    }
  };

  const handleDeleteGuest = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa khách mời này?')) {
      await GuestService.deleteGuest(id);
      showToast('Đã xóa khách mời.');
      loadData();
    }
  };

  const handleCopyLink = (guestSlug: string) => {
    if (!invitation) return;
    const url = GuestService.generatePersonalizedUrl(invitation.slug, guestSlug);
    navigator.clipboard.writeText(url);
    showToast('Đã sao chép link cá nhân hóa!');
  };

  const handleShowQR = async (guest: Guest) => {
    if (!invitation) return;
    const url = GuestService.generatePersonalizedUrl(invitation.slug, guest.slug);
    const qrDataUrl = await GuestService.generateQRCodeDataUrl(url);
    setActiveQRGuest({ guest, qrUrl: qrDataUrl });
  };

  const handleImportCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvRaw.trim()) return;

    const res = await GuestService.importCSV(invitationId, csvRaw);
    setCsvResult(res);
    loadData();
  };

  const groups = Array.from(new Set(guests.map((g) => g.group_name)));

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="text-gray-600 hover:text-[#B76E79]">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-bold text-[#292624]">Quản Lý Khách Mời</h1>
              <p className="text-xs text-gray-500">{invitation?.title}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowCSVModal(true)}
              className="px-4 py-2.5 rounded-xl border border-[#E8DFD8] bg-white text-xs font-semibold text-[#292624] hover:bg-[#F4EFEB] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Import CSV
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 rounded-xl bg-[#B76E79] text-white text-xs font-semibold hover:bg-[#a25b66] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Thêm Khách Mời
            </button>
          </div>
        </div>

        {toastMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>{toastMsg}</span>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD8] shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên, SĐT, Email..."
              className="w-full pl-9 pr-3 py-2 bg-[#FFFDF9] border border-[#E8DFD8] rounded-xl text-xs focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedGroup === 'all' ? 'bg-[#B76E79] text-white' : 'bg-[#F4EFEB] text-gray-700'
              }`}
            >
              Tất Cả ({guests.length})
            </button>
            {groups.map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGroup(g)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedGroup === g ? 'bg-[#B76E79] text-white' : 'bg-[#F4EFEB] text-gray-700'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        {/* Guests Table */}
        <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF9] border-b border-[#E8DFD8] text-gray-500 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Tên Khách Mời</th>
                  <th className="py-3.5 px-4">Nhóm</th>
                  <th className="py-3.5 px-4">SĐT / Email</th>
                  <th className="py-3.5 px-4">Số Khách Tối Đa</th>
                  <th className="py-3.5 px-4">Trạng Thái RSVP</th>
                  <th className="py-3.5 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD8]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Đang tải danh sách khách...
                    </td>
                  </tr>
                ) : guests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">
                      Chưa có khách mời nào. Bấm nút &ldquo;Thêm Khách Mời&rdquo; hoặc &ldquo;Import CSV&rdquo; để bắt đầu.
                    </td>
                  </tr>
                ) : (
                  guests.map((gst) => {
                    const rsvp = rsvps[gst.id];
                    return (
                      <tr key={gst.id} className="hover:bg-[#FFFDF9]/60 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-[#292624]">
                          {gst.name}
                          <div className="text-[10px] font-mono text-gray-400 font-normal">slug: {gst.slug}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="px-2.5 py-1 rounded-full bg-[#F4EFEB] text-[#292624] text-[11px] font-semibold">
                            {gst.group_name}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-gray-600">
                          <div>{gst.phone || '—'}</div>
                          <div className="text-[10px] text-gray-400">{gst.email || ''}</div>
                        </td>
                        <td className="py-3.5 px-4 text-gray-700 font-semibold">{gst.max_guests} người</td>
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
                                ? `Tham dự (${rsvp.guest_count})`
                                : rsvp.attendance === 'MAYBE'
                                ? `Có thể (${rsvp.guest_count})`
                                : 'Vắng mặt'}
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-medium">
                              Chưa phản hồi
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right space-x-1">
                          <button
                            onClick={() => handleCopyLink(gst.slug)}
                            title="Copy link cá nhân hóa"
                            className="p-1.5 text-gray-600 hover:text-[#B76E79] hover:bg-[#F4EFEB] rounded-lg transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleShowQR(gst)}
                            title="Tạo mã QR"
                            className="p-1.5 text-gray-600 hover:text-[#B76E79] hover:bg-[#F4EFEB] rounded-lg transition-colors"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteGuest(gst.id)}
                            title="Xóa khách mời"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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

      {/* Add Guest Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-[#E8DFD8]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-[#292624]">Thêm Khách Mời Mới</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddGuest} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-[#292624] mb-1">Tên khách mời *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nguyễn Văn A"
                  className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#292624] mb-1">Nhóm khách mời</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Bạn Cấp 3 / Đồng Nghiệp / Họ Hàng..."
                  className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#292624] mb-1">Số điện thoại</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#292624] mb-1">Số khách tối đa đi cùng</label>
                  <input
                    type="number"
                    min={1}
                    value={maxGuests}
                    onChange={(e) => setMaxGuests(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#292624] mb-1">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="khachmoi@gmail.com"
                  className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-[#E8DFD8] rounded-xl text-gray-700 font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B76E79] text-white rounded-xl font-semibold hover:bg-[#a25b66]"
                >
                  Thêm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      {showCSVModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-xl border border-[#E8DFD8]">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-[#292624]">Import Danh Sách Khách Từ CSV</h3>
              <button onClick={() => { setShowCSVModal(false); setCsvResult(null); }} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {csvResult ? (
              <div className="space-y-3 text-xs">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 space-y-1">
                  <p className="font-bold text-sm">Kết Quả Import:</p>
                  <p>Tổng số bản ghi: {csvResult.total}</p>
                  <p>Thành công: {csvResult.success}</p>
                  <p>Thất bại: {csvResult.failed}</p>
                </div>
                {csvResult.errors.length > 0 && (
                  <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-rose-700 max-h-32 overflow-y-auto">
                    <p className="font-bold">Lỗi:</p>
                    {csvResult.errors.map((err, i) => (
                      <div key={i}>• {err}</div>
                    ))}
                  </div>
                )}
                <button
                  onClick={() => { setShowCSVModal(false); setCsvResult(null); }}
                  className="w-full py-2 bg-[#B76E79] text-white rounded-xl font-semibold"
                >
                  Hoàn Tất
                </button>
              </div>
            ) : (
              <form onSubmit={handleImportCSV} className="space-y-3 text-xs">
                <p className="text-gray-500">
                  Dán nội dung file CSV của bạn với tiêu đề cột: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded">name,email,phone,max_guests,group_name</code>
                </p>
                <textarea
                  rows={6}
                  required
                  value={csvRaw}
                  onChange={(e) => setCsvRaw(e.target.value)}
                  placeholder={`name,email,phone,max_guests,group_name\nNguyễn Văn A,a@gmail.com,0901234567,2,Bạn Cấp 3\nTrần Thị B,b@gmail.com,0909876543,1,Đồng Nghiệp`}
                  className="w-full p-3 font-mono border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                ></textarea>
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCSVModal(false)}
                    className="px-4 py-2 border border-[#E8DFD8] rounded-xl text-gray-700 font-semibold"
                  >
                    Hủy
                  </button>
                  <button type="submit" className="px-5 py-2 bg-[#B76E79] text-white rounded-xl font-semibold hover:bg-[#a25b66]">
                    Tải Lên CSV
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {activeQRGuest && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl border border-[#E8DFD8]">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-[#292624] text-lg">Mã QR Khách Mời</h3>
              <button onClick={() => setActiveQRGuest(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#FFFDF9] border border-[#E8DFD8] rounded-2xl inline-block mx-auto">
              <img src={activeQRGuest.qrUrl} alt="QR Code" className="w-48 h-48 mx-auto" />
            </div>

            <div>
              <p className="font-bold text-[#292624] text-sm">{activeQRGuest.guest.name}</p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">slug: {activeQRGuest.guest.slug}</p>
            </div>

            <div className="pt-2">
              <a
                href={activeQRGuest.qrUrl}
                download={`QR_${activeQRGuest.guest.slug}.png`}
                className="w-full block py-2.5 bg-[#B76E79] text-white text-xs font-semibold rounded-xl shadow-sm hover:bg-[#a25b66]"
              >
                Tải Ảnh Mã QR (PNG)
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
