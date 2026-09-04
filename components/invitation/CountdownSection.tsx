'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import { Invitation } from '@/types/database.types';

interface Props {
  invitation: Invitation;
}

export default function CountdownSection({ invitation }: Props) {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

  useEffect(() => {
    if (!invitation.event_date) return;

    const timeStr = invitation.event_start_time ? invitation.event_start_time.slice(0, 5) : '00:00';
    const parsedDate = new Date(`${invitation.event_date}T${timeStr}:00`);
    const targetDate = parsedDate.getTime();

    if (isNaN(targetDate)) {
      setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      return;
    }

    const updateTimer = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      } else {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [invitation.event_date, invitation.event_start_time]);

  const isExpired = timeLeft && timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  const units = [
    { value: timeLeft?.days, label: 'Ngày' },
    { value: timeLeft?.hours, label: 'Giờ' },
    { value: timeLeft?.minutes, label: 'Phút' },
    { value: timeLeft?.seconds, label: 'Giây' },
  ];

  return (
    <div className="py-24 px-6 text-center">
      <div className="max-w-2xl mx-auto space-y-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E85B6A]">
            <Clock className="w-3.5 h-3.5" />
            <span>ĐẾM NGƯỢC THỜI GIAN</span>
          </div>
          <h2
            className="text-3xl sm:text-5xl font-serif font-bold text-[#1F1B1C] leading-tight"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            {isExpired ? 'Ngày Trọng Đại Đã Diễn Ra ❤️' : 'Cùng Đếm Ngược Đến Ngày Vui'}
          </h2>
        </div>

        {isExpired ? (
          <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-white border border-[#EAE4DF] shadow-card space-y-3">
            <span className="text-3xl">🥂</span>
            <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#1F1B1C]">
              Cảm Ơn Quý Khách Đã Đến Chung Vui!
            </h3>
            <p className="text-xs sm:text-sm text-[#756B70] leading-relaxed">
              Sự hiện diện và lời chúc phúc tốt đẹp của quý khách là món quà quý giá và ý nghĩa nhất dành cho chúng tôi.
            </p>
          </div>
        ) : timeLeft && (
          <div className="grid grid-cols-4 gap-4 sm:gap-8 max-w-md mx-auto">
            {units.map((unit, idx) => (
              <div key={idx} className="text-center space-y-2">
                <div className="relative">
                  <div className="w-full aspect-square rounded-2xl bg-white border border-[#EAE4DF] shadow-soft flex items-center justify-center">
                    <span
                      className="text-3xl sm:text-5xl font-bold text-[#1F1B1C] font-serif tabular-nums"
                      style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
                    >
                      {String(unit.value ?? 0).padStart(2, '0')}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] sm:text-xs text-[#756B70] font-semibold uppercase tracking-wider">
                  {unit.label}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Decorative line */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <div className="h-px w-12 bg-[#EAE4DF]" />
          <div className="w-1.5 h-1.5 rounded-full bg-[#E85B6A]/40" />
          <div className="h-px w-12 bg-[#EAE4DF]" />
        </div>
      </div>
    </div>
  );
}
