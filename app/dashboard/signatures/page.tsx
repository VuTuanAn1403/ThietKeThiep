'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  PenTool,
  Eye,
  EyeOff,
  Trash2,
  Search,
  CheckCircle,
  AlertCircle,
  MessageSquare,
} from 'lucide-react';
import { SignatureService } from '@/services/signature.service';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Signature, Invitation } from '@/types/database.types';

export default function UserSignaturesPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [signatures, setSignatures] = useState<Signature[]>([]);
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

      let allUserSigs: Signature[] = [];
      for (const inv of invs) {
        const sigs = await SignatureService.getAllSignatures(inv.id);
        allUserSigs = allUserSigs.concat(sigs);
      }
      setSignatures(allUserSigs);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const handleToggle = async (id: string) => {
    const updated = await SignatureService.toggleVisibility(id);
    if (updated) {
      setSignatures((prev) => prev.map((s) => (s.id === id ? updated : s)));
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bản lưu bút / chữ ký này?')) {
      await SignatureService.deleteSignature(id);
      setSignatures((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const filteredSignatures = signatures.filter((s) => {
    const matchVis =
      filterVisibility === 'ALL' ||
      (filterVisibility === 'VISIBLE' && s.is_visible) ||
      (filterVisibility === 'HIDDEN' && !s.is_visible);
    const matchInv = selectedInvId === 'ALL' || s.invitation_id === selectedInvId;
    const matchSearch =
      s.guest_name.toLowerCase().includes(search.toLowerCase()) ||
      s.message.toLowerCase().includes(search.toLowerCase());
    return matchVis && matchInv && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Sổ Lưu Bút & Chữ Ký Khách Mời</h1>
        <p className="text-xs text-gray-500 mt-1">
          Lưu giữ những nét bút, chữ ký và lời nhắn kỷ niệm từ khách mời trong ngày trọng đại
        </p>
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
            placeholder="Tìm theo tên khách, lời nhắn..."
            className="w-full pl-9 pr-4 py-2 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
          />
        </div>
      </div>

      {/* Table */}
      {filteredSignatures.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-[#e8dfd8] text-center space-y-3">
          <PenTool className="w-12 h-12 text-gray-300 mx-auto" />
          <h3 className="text-base font-bold text-gray-800">Chưa có chữ ký hoặc lưu bút nào</h3>
          <p className="text-xs text-gray-500">Khách mời có thể ký tên và gửi lời nhắn lưu bút trực tiếp trên thiệp mời online.</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-[#e8dfd8] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#fdfbf7] border-b border-[#e8dfd8] text-gray-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3.5 px-6">Khách Mời</th>
                  <th className="py-3.5 px-6">Lời Nhắn Lưu Bút</th>
                  <th className="py-3.5 px-6">Chữ Ký / Nét Vẽ</th>
                  <th className="py-3.5 px-6">Thiệp Mời</th>
                  <th className="py-3.5 px-6">Thời Gian</th>
                  <th className="py-3.5 px-6">Trạng Thái</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {filteredSignatures.map((s) => {
                  const inv = invitations.find((i) => i.id === s.invitation_id);
                  return (
                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-4 px-6 font-bold text-gray-900">{s.guest_name}</td>
                      <td className="py-4 px-6 text-gray-700 max-w-sm">{s.message}</td>
                      <td className="py-4 px-6">
                        {s.signature_image_url ? (
                          <img src={s.signature_image_url} alt="Signature" className="h-8 max-w-[100px] object-contain border rounded p-1 bg-white" />
                        ) : (
                          <span className="text-[11px] text-gray-400 italic font-serif">Ký tên điện tử</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-gray-500 font-semibold">{inv?.title || s.invitation_id}</td>
                      <td className="py-4 px-6 text-gray-400 text-[11px] font-mono">
                        {new Date(s.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            s.is_visible
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {s.is_visible ? 'Đang Hiện' : 'Đã Ẩn'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleToggle(s.id)}
                            className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                              s.is_visible
                                ? 'border-gray-200 text-gray-600 hover:bg-gray-100'
                                : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                            }`}
                          >
                            {s.is_visible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            {s.is_visible ? 'Ẩn' : 'Hiện'}
                          </button>
                          <button
                            onClick={() => handleDelete(s.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 transition-colors"
                            title="Xóa lưu bút"
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
