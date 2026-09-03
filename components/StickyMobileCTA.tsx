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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#EAE4DF] p-3 px-4 shadow-floating transition-all duration-300">
        <div className="max-w-md mx-auto flex items-center justify-between gap-2.5">
          <button
            onClick={onRsvpClick || (() => {
              const el = document.getElementById('rsvp-section') || document.querySelector('[data-section="rsvp"]');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            })}
            className="flex-1 py-3 px-3 rounded-full btn-luxury-primary text-white font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Heart className="w-3.5 h-3.5 fill-white" />
            <span>Xác nhận tham dự (RSVP)</span>
          </button>

          <button
            onClick={onWishClick || (() => {
              const el = document.getElementById('wishes-section') || document.querySelector('[data-section="wishes"]');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            })}
            className="py-3 px-3.5 rounded-full btn-luxury-secondary text-[#1F1B1C] font-semibold text-xs active:scale-95 transition-all flex items-center justify-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5 text-[#E85B6A]" />
            <span>Gửi lời chúc</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-[#EAE4DF] p-3 px-4 shadow-floating transition-all duration-300">
      <div className="max-w-md mx-auto flex items-center justify-between gap-3">
        <div className="flex flex-col">
          <span className="font-serif font-bold text-xs text-[#1F1B1C] leading-tight">NHÀ CÓ TIỆC</span>
          <span className="text-[10px] text-[#756B70]">Thiệp cưới online cao cấp</span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/templates"
            className="py-2.5 px-3.5 rounded-full btn-luxury-secondary text-[#1F1B1C] font-semibold text-xs active:scale-95 transition-all"
          >
            Xem mẫu
          </Link>
          <Link
            href="/dashboard/invitations/new"
            className="py-2.5 px-4 rounded-full btn-luxury-primary text-white font-semibold text-xs active:scale-95 transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tạo thiệp
          </Link>
        </div>
      </div>
    </div>
  );
}
