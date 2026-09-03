'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Eye, EyeOff, Trash2, Heart } from 'lucide-react';
import { WishService } from '@/services/wish.service';
import { InvitationService } from '@/services/invitation.service';
import { Wish, Invitation } from '@/types/database.types';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function WishModerationPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const invitationId = resolvedParams.id;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const inv = await InvitationService.getInvitationById(invitationId);
    setInvitation(inv);

    const list = await WishService.getAllWishes(invitationId);
    setWishes(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [invitationId]);

  const handleToggle = async (wishId: string) => {
    await WishService.toggleVisibility(wishId);
    loadData();
  };

  const handleDelete = async (wishId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa lời chúc này?')) {
      await WishService.deleteWish(wishId);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-600 hover:text-[#B76E79]">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#292624]">Quản Lý Sổ Lời Chúc</h1>
            <p className="text-xs text-gray-500">{invitation?.title}</p>
          </div>
        </div>

        {/* Wishes List */}
        <div className="space-y-4">
          {loading ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E8DFD8] text-center text-gray-400 text-xs">
              Đang tải danh sách lời chúc...
            </div>
          ) : wishes.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl border border-[#E8DFD8] text-center text-gray-500 text-xs">
              Chưa có lời chúc nào được gửi cho thiệp này.
            </div>
          ) : (
            wishes.map((w) => (
              <div
                key={w.id}
                className={`p-5 rounded-2xl border transition-all ${
                  w.is_visible
                    ? 'bg-white border-[#E8DFD8] shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-[#B76E79] fill-[#B76E79]" />
                    <span className="font-bold text-[#292624] text-sm">{w.guest_name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(w.created_at).toLocaleString('vi-VN')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggle(w.id)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border transition-colors ${
                        w.is_visible
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {w.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                      {w.is_visible ? 'Đang Hiển Thị' : 'Đã Ẩn'}
                    </button>
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                      title="Xóa lời chúc"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-sm text-gray-700 leading-relaxed font-serif italic pl-4 border-l-2 border-[#B76E79]">
                  &ldquo;{w.message}&rdquo;
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
