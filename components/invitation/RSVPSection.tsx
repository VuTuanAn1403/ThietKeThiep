'use client';

import React, { useState } from 'react';
import { CheckCircle2, UserCheck, Send, AlertCircle } from 'lucide-react';
import { Invitation, Guest, RSVPAttendance } from '@/types/database.types';
import { RSVPService } from '@/services/rsvp.service';

interface Props {
  invitation: Invitation;
  guest?: Guest | null;
}

export default function RSVPSection({ invitation, guest }: Props) {
  const [attendance, setAttendance] = useState<RSVPAttendance>('ATTENDING');
  const [guestCount, setGuestCount] = useState<number>(1);
  const [note, setNote] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const maxAllowed = guest ? guest.max_guests : 5;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!guest) {
        // Public RSVP fallback without personalized link
        setSubmitted(true);
        return;
      }

      const res = await RSVPService.submitRSVP(guest.id, {
        attendance,
        guest_count: attendance === 'NOT_ATTENDING' ? 0 : guestCount,
        note,
      });

      if (res.error) {
        setError(res.error);
      } else {
        setSubmitted(true);
      }
    } catch {
      setError('Đã xảy ra lỗi khi gửi phản hồi. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-16 px-6 bg-white border-b border-[#E8DFD8]">
      <div className="max-w-xl mx-auto text-center space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">
            Xác Nhận Tham Dự
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#292624] mt-2"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            Phản Hồi Sự Có Mặt Của Bạn
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi!
          </p>
        </div>

        {submitted ? (
          <div className="bg-[#FFFDF9] p-8 rounded-3xl border border-[#8FA79B]/40 text-center space-y-4 shadow-sm">
            <CheckCircle2 className="w-12 h-12 text-[#8FA79B] mx-auto" />
            <h3 className="text-2xl font-serif font-bold text-[#292624]">Cảm Ơn Bạn Đã Phản Hồi!</h3>
            <p className="text-sm text-gray-600">
              Thông tin xác nhận tham dự của bạn đã được ghi nhận. Chúng tôi rất mong được đón tiếp bạn!
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-[#B76E79] hover:underline"
            >
              Chỉnh sửa lại phản hồi
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-[#FFFDF9] p-6 sm:p-8 rounded-3xl border border-[#E8DFD8] text-left space-y-6 shadow-sm">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {guest && (
              <div className="p-4 rounded-2xl bg-white border border-[#E8DFD8] flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-[#B76E79]" />
                <div>
                  <div className="text-xs text-gray-500 font-medium">Khách mời:</div>
                  <div className="text-sm font-bold text-[#292624]">{guest.name}</div>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#292624] mb-3">
                Bạn có thể đến dự cùng chúng tôi không?
              </label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => { setAttendance('ATTENDING'); if (guestCount === 0) setGuestCount(1); }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-semibold text-center transition-all ${
                    attendance === 'ATTENDING'
                      ? 'bg-[#B76E79] text-white border-[#B76E79] shadow-sm'
                      : 'bg-white text-gray-700 border-[#E8DFD8] hover:bg-[#F4EFEB]'
                  }`}
                >
                  Sẽ Tham Dự ❤️
                </button>
                <button
                  type="button"
                  onClick={() => { setAttendance('MAYBE'); if (guestCount === 0) setGuestCount(1); }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-semibold text-center transition-all ${
                    attendance === 'MAYBE'
                      ? 'bg-[#8FA79B] text-white border-[#8FA79B] shadow-sm'
                      : 'bg-white text-gray-700 border-[#E8DFD8] hover:bg-[#F4EFEB]'
                  }`}
                >
                  Có Thể
                </button>
                <button
                  type="button"
                  onClick={() => { setAttendance('NOT_ATTENDING'); setGuestCount(0); }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-semibold text-center transition-all ${
                    attendance === 'NOT_ATTENDING'
                      ? 'bg-gray-700 text-white border-gray-700 shadow-sm'
                      : 'bg-white text-gray-700 border-[#E8DFD8] hover:bg-[#F4EFEB]'
                  }`}
                >
                  Rất Tiếc Rắn Rỏi
                </button>
              </div>
            </div>

            {attendance !== 'NOT_ATTENDING' && (
              <div>
                <label className="block text-sm font-semibold text-[#292624] mb-2">
                  Số người tham dự (Tối đa {maxAllowed} người)
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxAllowed}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.min(maxAllowed, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2.5 bg-white border border-[#E8DFD8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-[#292624] mb-2">
                Lời nhắn gửi (Nếu có)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Chúc mừng hai bạn! Rất mong chờ đến ngày tiệc..."
                className="w-full px-4 py-2.5 bg-white border border-[#E8DFD8] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#B76E79] text-white text-sm font-semibold hover:bg-[#a25b66] transition-colors shadow-md disabled:opacity-50"
            >
              {loading ? 'Đang gửi...' : 'Gửi Phản Hồi RSVP'}
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
