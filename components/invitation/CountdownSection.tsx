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
    const targetDate = new Date(`${invitation.event_date}T${invitation.event_start_time || '00:00'}:00`).getTime();

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

  return (
    <div className="py-16 px-6 bg-[#FFFDF9] text-center border-b border-[#E8DFD8]">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B76E79]">
            <Clock className="w-4 h-4" />
            <span>Đếm Ngược Thời Gian</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#292624]"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            {isExpired ? 'Sự kiện đã bắt đầu ❤️' : 'Cùng Đếm Ngược Đến Ngày Vui'}
          </h2>
        </div>

        {timeLeft && !isExpired && (
          <div className="grid grid-cols-4 gap-3 sm:gap-6 max-w-lg mx-auto">
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD8] shadow-sm">
              <span className="block text-3xl sm:text-4xl font-bold text-[#B76E79] font-mono">{timeLeft.days}</span>
              <span className="text-xs text-gray-500 font-medium">Ngày</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD8] shadow-sm">
              <span className="block text-3xl sm:text-4xl font-bold text-[#B76E79] font-mono">{timeLeft.hours}</span>
              <span className="text-xs text-gray-500 font-medium">Giờ</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD8] shadow-sm">
              <span className="block text-3xl sm:text-4xl font-bold text-[#B76E79] font-mono">{timeLeft.minutes}</span>
              <span className="text-xs text-gray-500 font-medium">Phút</span>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-[#E8DFD8] shadow-sm">
              <span className="block text-3xl sm:text-4xl font-bold text-[#B76E79] font-mono">{timeLeft.seconds}</span>
              <span className="text-xs text-gray-500 font-medium">Giây</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
