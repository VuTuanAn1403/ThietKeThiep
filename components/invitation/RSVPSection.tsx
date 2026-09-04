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
  const [guestName, setGuestName] = useState<string>('');
  const [guestPhone, setGuestPhone] = useState<string>('');
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
        if (!guestName.trim()) {
          setError('Vui lòng nhập họ và tên của bạn.');
          setLoading(false);
          return;
        }

        const res = await RSVPService.submitPublicRSVP(invitation.id, {
          guest_name: guestName.trim(),
          phone: guestPhone.trim() || undefined,
          attendance,
          guest_count: attendance === 'NOT_ATTENDING' ? 0 : guestCount,
          note: note.trim() || undefined,
        });

        if (res.error) {
          setError(res.error);
        } else {
          setSubmitted(true);
        }
        return;
      }

      const res = await RSVPService.submitRSVP(
        guest.id,
        {
          attendance,
          guest_count: attendance === 'NOT_ATTENDING' ? 0 : guestCount,
          note,
        },
        invitation.id
      );

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
    <div className="py-20 px-6">
      <div className="max-w-xl mx-auto text-center space-y-8">
        <div className="space-y-2.5">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E85B6A]">
            XÁC NHẬN THAM DỰ
          </span>
          <h2
            className="text-3xl sm:text-4xl font-serif font-bold text-[#1F1B1C]"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            Phản Hồi Sự Có Mặt Của Bạn
          </h2>
          <p className="text-xs sm:text-sm text-[#756B70]">
            Sự hiện diện của bạn là niềm vinh hạnh lớn đối với chúng tôi!
          </p>
        </div>

        {submitted ? (
          <div className="depth-card bg-white p-8 rounded-3xl border border-[#8FA79B]/40 text-center space-y-4 shadow-card">
            <CheckCircle2 className="w-12 h-12 text-[#8FA79B] mx-auto" />
            <h3 className="text-2xl font-serif font-bold text-[#1F1B1C]">Cảm Ơn Bạn Đã Phản Hồi!</h3>
            <p className="text-xs sm:text-sm text-[#756B70] leading-relaxed">
              Thông tin xác nhận tham dự của bạn đã được ghi nhận. Chúng tôi rất mong được đón tiếp bạn!
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="text-xs font-semibold text-[#E85B6A] hover:underline cursor-pointer"
            >
              Chỉnh sửa lại phản hồi
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="depth-card bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE4DF] text-left space-y-6 shadow-card">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2.5 text-rose-700 text-xs font-medium">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {guest ? (
              <div className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#EAE4DF] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-[#E85B6A] flex items-center justify-center">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[11px] text-[#756B70] font-medium">Khách mời:</div>
                  <div className="text-sm font-bold text-[#1F1B1C]">{guest.name}</div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#1F1B1C] mb-1.5">
                    Họ & Tên của bạn <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className="w-full px-4 py-2.5 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85B6A]"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#1F1B1C] mb-1.5">
                    Số điện thoại (tùy chọn)
                  </label>
                  <input
                    type="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full px-4 py-2.5 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85B6A]"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1F1B1C] mb-3">
                Bạn có thể đến dự cùng chúng tôi không?
              </label>
              <div className="grid grid-cols-3 gap-2.5">
                <button
                  type="button"
                  onClick={() => { setAttendance('ATTENDING'); if (guestCount === 0) setGuestCount(1); }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    attendance === 'ATTENDING'
                      ? 'btn-3d-primary text-white border-[#E85B6A]'
                      : 'bg-white text-[#756B70] border-[#EAE4DF] hover:bg-[#FAF7F5]'
                  }`}
                >
                  Sẽ Tham Dự ❤️
                </button>
                <button
                  type="button"
                  onClick={() => { setAttendance('MAYBE'); if (guestCount === 0) setGuestCount(1); }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    attendance === 'MAYBE'
                      ? 'bg-[#8FA79B] text-white border-[#8FA79B] shadow-sm'
                      : 'bg-white text-[#756B70] border-[#EAE4DF] hover:bg-[#FAF7F5]'
                  }`}
                >
                  Có Thể
                </button>
                <button
                  type="button"
                  onClick={() => { setAttendance('NOT_ATTENDING'); setGuestCount(0); }}
                  className={`py-3 px-2 rounded-2xl border text-xs font-semibold text-center transition-all cursor-pointer ${
                    attendance === 'NOT_ATTENDING'
                      ? 'bg-[#1F1B1C] text-white border-[#1F1B1C] shadow-sm'
                      : 'bg-white text-[#756B70] border-[#EAE4DF] hover:bg-[#FAF7F5]'
                  }`}
                >
                  Rất Tiếc
                </button>
              </div>
            </div>

            {attendance !== 'NOT_ATTENDING' && (
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-[#1F1B1C] mb-1.5">
                  Số người tham dự (Tối đa {maxAllowed} người)
                </label>
                <input
                  type="number"
                  min={1}
                  max={maxAllowed}
                  value={guestCount}
                  onChange={(e) => setGuestCount(Math.min(maxAllowed, Math.max(1, parseInt(e.target.value) || 1)))}
                  className="w-full px-4 py-2.5 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85B6A]"
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-semibold text-[#1F1B1C] mb-1.5">
                Lời nhắn gửi (Nếu có)
              </label>
              <textarea
                rows={3}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Chúc mừng hai bạn! Rất mong chờ đến ngày tiệc..."
                className="w-full px-4 py-2.5 bg-[#FAF7F5] border border-[#EAE4DF] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#E85B6A]"
              ></textarea>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl btn-3d-primary text-white text-sm font-semibold transition-all disabled:opacity-50 cursor-pointer"
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
