'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Heart, Sparkles, Send, MapPin } from 'lucide-react';

interface StickyMobileCTAProps {
  type?: 'landing' | 'invitation';
  invitationTitle?: string;
  onRsvpClick?: () => void;
  onWishClick?: () => void;
}

export function StickyMobileCTA({
  type = 'landing',
  invitationTitle,
  onRsvpClick,
  onWishClick,
}: StickyMobileCTAProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after user scrolls down 120px
      if (window.scrollY > 120) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isVisible) return null;

  if (type === 'invitation') {
    return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8dfd8] p-3 px-4 shadow-xl transition-all duration-300">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          <button
            onClick={onRsvpClick || (() => {
              const el = document.getElementById('rsvp-section') || document.querySelector('[data-section="rsvp"]');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            })}
            className="flex-1 py-3 px-3 rounded-full bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64] active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Xác nhận tham dự (RSVP)</span>
          </button>

          <button
            onClick={onWishClick || (() => {
              const el = document.getElementById('wishes-section') || document.querySelector('[data-section="wishes"]');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            })}
            className="py-3 px-3.5 rounded-full bg-white border border-[#e8dfd8] text-gray-700 font-semibold text-xs hover:bg-gray-50 active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#e85d75]" />
            <span>Gửi lời chúc</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e8dfd8] p-3 px-4 shadow-xl transition-all duration-300">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-serif font-bold text-xs text-gray-900 leading-tight">NHÀ CÓ TIỆC</span>
          <span className="text-[10px] text-gray-500">Tạo thiệp online miễn phí</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="py-2.5 px-3.5 rounded-full bg-white border border-[#e8dfd8] text-gray-700 font-semibold text-xs hover:bg-gray-50 active:scale-95 transition-all"
          >
            Xem mẫu
          </Link>
          <Link
            href="/dashboard/invitations/new"
            className="py-2.5 px-4 rounded-full bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64] active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tạo thiệp
          </Link>
        </div>
      </div>
    </div>
  );
}
