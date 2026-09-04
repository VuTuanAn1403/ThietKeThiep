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

      {/* Authentication Provider Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfd8] shadow-xs space-y-4">
        <div>
          <h2 className="text-base font-serif font-bold text-gray-900">Phương Thức Đăng Nhập</h2>
          <p className="text-xs text-gray-500 mt-0.5">Các phương thức xác thực liên kết với tài khoản của bạn</p>
        </div>

        <div className="divide-y divide-gray-100 text-xs">
          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#FAF7F5] border border-[#EAE4DF] flex items-center justify-center text-gray-600 font-bold">
                @
              </div>
              <div>
                <div className="font-semibold text-gray-900">Email &amp; Mật khẩu</div>
                <div className="text-gray-500 text-[11px] font-mono">{currentUser?.email}</div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold border border-emerald-200">
              Đang hoạt động
            </span>
          </div>

          <div className="py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-white border border-[#EAE4DF] flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Google OAuth</div>
                <div className="text-gray-500 text-[11px]">
                  {currentUser?.avatar_url?.includes('google') || currentUser?.email?.includes('gmail')
                    ? 'Đã liên kết (Signed in with Google)'
                    : 'Hỗ trợ đăng nhập qua Google'}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-[10px] font-semibold border border-blue-200">
              {currentUser?.avatar_url?.includes('google') || currentUser?.email?.includes('gmail')
                ? 'Đã liên kết'
                : 'Sẵn sàng'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
