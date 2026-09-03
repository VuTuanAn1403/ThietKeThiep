'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Gift as GiftIcon,
  CreditCard,
  QrCode,
  CheckCircle,
  Eye,
  EyeOff,
  Save,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { GiftService, GiftInput } from '@/services/gift.service';
import { InvitationService } from '@/services/invitation.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Invitation, Gift } from '@/types/database.types';

export default function UserGiftsPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [selectedInvId, setSelectedInvId] = useState<string>('');
  const [currentGift, setCurrentGift] = useState<Gift | null>(null);

  const [title, setTitle] = useState('Quà Mừng Chúc Phúc');
  const [description, setDescription] = useState('Sự hiện diện của quý khách là niềm vinh hạnh lớn nhất của chúng tôi.');
  const [bankName, setBankName] = useState('Vietcombank (VCB)');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const userId = currentUser?.id || 'usr-demo-01';
      const invs = await InvitationService.getUserInvitations(userId);
      setInvitations(invs);
      if (invs.length > 0) {
        setSelectedInvId(invs[0].id);
        await loadGiftData(invs[0].id);
      }
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const loadGiftData = async (invId: string) => {
    const gift = await GiftService.getGiftByInvitationId(invId);
    setCurrentGift(gift);
    if (gift) {
      setTitle(gift.title);
      setDescription(gift.description || '');
      setBankName(gift.bank_name);
      setAccountName(gift.account_name);
      setAccountNumber(gift.account_number);
      setQrImageUrl(gift.qr_image_url || '');
      setIsVisible(gift.is_visible);
    } else {
      setTitle('Quà Mừng Chúc Phúc');
      setDescription('Sự hiện diện của quý khách là niềm vinh hạnh lớn nhất của chúng tôi.');
      setBankName('Vietcombank (VCB)');
      setAccountName('');
      setAccountNumber('');
      setQrImageUrl('');
      setIsVisible(true);
    }
  };

  const handleInvitationChange = async (id: string) => {
    setSelectedInvId(id);
    await loadGiftData(id);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvId) return;

    setError(null);
    setSaving(true);
    setSavedSuccess(false);

    try {
      const res = await GiftService.saveGift(selectedInvId, {
        title,
        description,
        bankName,
        accountName,
        accountNumber,
        qrImageUrl: qrImageUrl || (accountNumber && bankName ? `https://api.vietqr.io/image/970436-${accountNumber}-compact.jpg?amount=0&accountName=${encodeURIComponent(accountName)}` : null),
        isVisible,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setCurrentGift(res.gift);
        setSavedSuccess(true);
        setTimeout(() => setSavedSuccess(false), 3000);
      }
    } catch {
      setError('Đã xảy ra lỗi khi lưu thông tin quà mừng.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Cấu Hình Quà Tặng & Mừng Cưới</h1>
        <p className="text-xs text-gray-500 mt-1">
          Thiết lập thông tin tài khoản ngân hàng và mã QR nhận quà mừng từ xa trên thiệp mời online
        </p>
      </div>

      {/* Select Invitation */}
      {invitations.length > 1 && (
        <div className="bg-white p-4 rounded-2xl border border-[#e8dfd8] flex items-center gap-3">
          <span className="text-xs font-semibold text-gray-700">Chọn thiệp cấu hình:</span>
          <select
            value={selectedInvId}
            onChange={(e) => handleInvitationChange(e.target.value)}
            className="px-4 py-2 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs font-semibold focus:outline-none"
          >
            {invitations.map((i) => (
              <option key={i.id} value={i.id}>
                {i.title}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Configuration Form */}
      <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfd8] shadow-xs space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {savedSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>Đã lưu thành công thông tin quà tặng cho thiệp!</span>
          </div>
        )}

        <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fdfbf7] border border-gray-200">
          <div>
            <span className="font-bold text-gray-800 text-xs">Hiển thị mục Quà Mừng trên thiệp</span>
            <p className="text-[11px] text-gray-500">Khách mời sẽ thấy thông tin số tài khoản và mã QR chuyển khoản</p>
          </div>
          <button
            type="button"
            onClick={() => setIsVisible(!isVisible)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 ${
              isVisible
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-gray-100 text-gray-600 border border-gray-300'
            }`}
          >
            {isVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            {isVisible ? 'Đang Bật' : 'Đang Tắt'}
          </button>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Tiêu Đề Mục *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Quà Mừng Chúc Phúc"
              className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Lời Nhắn Gửi Khách Mời</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lời cảm ơn gửi đến khách mừng từ xa..."
              className="w-full px-4 py-2 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-gray-800 mb-1">Ngân Hàng *</label>
              <input
                type="text"
                required
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="Vietcombank (VCB), MBBank, Techcombank..."
                className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-gray-800 mb-1">Tên Chủ Tài Khoản *</label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="NGUYEN VAN A"
                className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl uppercase focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Số Tài Khoản Ngân Hàng *</label>
            <input
              type="text"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="012345678910"
              className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl font-mono focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Link Ảnh QR Code Chuyển Khoản (Tùy chọn)</label>
            <input
              type="url"
              value={qrImageUrl}
              onChange={(e) => setQrImageUrl(e.target.value)}
              placeholder="Để trống hệ thống sẽ tự sinh mã VietQR chuẩn theo STK"
              className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Đang Lưu...' : 'Lưu Thông Tin Quà Tặng'}
          </button>
        </div>
      </form>
    </div>
  );
}
