'use client';

import React, { useState } from 'react';
import { User, Mail, Phone, Calendar, Shield, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthService } from '@/lib/auth/auth-service';
import { createClient } from '@/lib/supabase/client';

export default function AccountProfilePage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [fullName, setFullName] = useState(currentUser?.full_name || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatar_url || '');

  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Vui lòng nhập họ và tên');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (currentUser) {
        currentUser.full_name = fullName.trim();
        currentUser.phone = phone.trim() || null;
        currentUser.avatar_url = avatarUrl.trim() || null;
        currentUser.updated_at = new Date().toISOString();

        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        if (url && !url.includes('placeholder')) {
          const supabase = createClient();
          await supabase
            .from('users')
            .update({
              full_name: fullName.trim(),
              phone: phone.trim() || null,
              avatar_url: avatarUrl.trim() || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', currentUser.id);
        }

        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError('Đã xảy ra lỗi khi cập nhật thông tin.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Thông Tin Tài Khoản</h1>
        <p className="text-xs text-gray-500 mt-1">Quản lý thông tin cá nhân và thiết lập tài khoản của bạn</p>
      </div>

      <form onSubmit={handleUpdate} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfd8] shadow-xs space-y-6">
        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Đã cập nhật thông tin tài khoản thành công!</span>
          </div>
        )}

        {/* Avatar preview */}
        <div className="flex items-center gap-4 pb-4 border-b border-gray-100">
          <div className="w-16 h-16 rounded-full bg-[#e85d75]/10 border-2 border-[#e85d75]/30 text-[#e85d75] font-bold text-xl flex items-center justify-center overflow-hidden">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              fullName.charAt(0) || 'U'
            )}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm">{currentUser?.full_name || 'Khách hàng'}</div>
            <div className="text-xs text-gray-500 font-mono">{currentUser?.email}</div>
            <div className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-[10px] font-bold">
              <Shield className="w-3 h-3 text-purple-600" /> Vai trò: {currentUser?.role || 'USER'}
            </div>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Họ Và Tên *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập họ và tên của bạn"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Địa Chỉ Email (Không thể sửa)</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="email"
                disabled
                value={currentUser?.email || ''}
                className="w-full pl-10 pr-4 py-2.5 bg-gray-100 border border-[#e8dfd8] rounded-xl text-gray-500 cursor-not-allowed font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Số Điện Thoại</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0901234567"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Link Ảnh Đại Diện (Avatar URL)</label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl focus:ring-2 focus:ring-[#e85d75] focus:outline-none text-xs"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-gray-100 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-4 h-4" /> {saving ? 'Đang Lưu...' : 'Cập Nhật Thông Tin'}
          </button>
        </div>
      </form>
    </div>
  );
}
