'use client';

import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Heart } from 'lucide-react';
import { Invitation, Guest, Wish } from '@/types/database.types';
import { WishService } from '@/services/wish.service';

interface Props {
  invitation: Invitation;
  guest?: Guest | null;
}

export default function GuestbookSection({ invitation, guest }: Props) {
  const [wishes, setWishes] = useState<Wish[]>([]);
  const [guestName, setGuestName] = useState<string>(guest ? guest.name : '');
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const list = await WishService.getVisibleWishes(invitation.id);
      setWishes(list);
    }
    load();
  }, [invitation.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !message.trim()) return;

    setLoading(true);
    try {
      const newWish = await WishService.submitWish(invitation.id, guestName.trim(), message.trim(), guest?.id);
      setWishes([newWish, ...wishes]);
      setMessage('');
      setSuccessMsg('Cảm ơn bạn đã gửi lời chúc ý nghĩa!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch {
      // error handling
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-6 bg-[#FFFDF9] border-b border-[#E8DFD8]">
      <div className="max-w-3xl mx-auto text-center space-y-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B76E79]">
            <MessageSquare className="w-4 h-4" />
            <span>Sổ Lời Chúc</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#292624] mt-2"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            Gửi Lời Chúc Mừng
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Hãy để lại những lời chúc thương yêu dành tặng cho bữa tiệc của chúng tôi!
          </p>
        </div>

        {/* Submit Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DFD8] text-left space-y-4 shadow-sm max-w-xl mx-auto">
          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-medium text-center">
              {successMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#292624] mb-1">
              Tên của bạn
            </label>
            <input
              type="text"
              required
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full px-4 py-2.5 bg-[#FFFDF9] border border-[#E8DFD8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#292624] mb-1">
              Lời chúc của bạn
            </label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Chúc cho buổi tiệc diễn ra thành công rực rỡ và ngập tràn hạnh phúc..."
              className="w-full px-4 py-2.5 bg-[#FFFDF9] border border-[#E8DFD8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#B76E79] text-white text-sm font-semibold hover:bg-[#a25b66] transition-colors shadow-sm disabled:opacity-50"
          >
            {loading ? 'Đang gửi...' : 'Gửi Lời Chúc'}
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Wishes List */}
        <div className="space-y-4 max-w-2xl mx-auto text-left">
          {wishes.map((w) => (
            <div key={w.id} className="bg-white p-5 rounded-2xl border border-[#E8DFD8] shadow-sm space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 fill-[#B76E79] text-[#B76E79]" />
                  <span className="font-bold text-[#292624] text-sm">{w.guest_name}</span>
                </div>
                <span className="text-[10px] text-gray-400">
                  {new Date(w.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>
              <p className="text-sm text-gray-600 italic leading-relaxed pl-6 border-l-2 border-[#F4EFEB]">
                &ldquo;{w.message}&rdquo;
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
