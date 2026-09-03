'use client';

import React from 'react';
import { Heart, Calendar, MapPin } from 'lucide-react';
import { Invitation, Guest } from '@/types/database.types';

interface Props {
  invitation: Invitation;
  guest?: Guest | null;
}

export default function HeroSection({ invitation, guest }: Props) {
  return (
    <div
      className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-6 py-20 overflow-hidden"
      style={{
        backgroundColor: invitation.primary_color ? `${invitation.primary_color}10` : '#FFFDF9',
      }}
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#B76E79_1px,transparent_1px)] [background-size:16px_16px]"></div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-6">
        {guest && (
          <div className="inline-block px-4 py-1.5 rounded-full bg-white/80 border border-[#E8DFD8] text-xs font-semibold text-[#B76E79] shadow-sm mb-2">
            Trân trọng kính mời: <span className="font-bold text-[#292624]">{guest.name}</span>
          </div>
        )}

        <div className="inline-flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-gray-500">
          <Heart className="w-4 h-4 fill-[#B76E79] text-[#B76E79]" />
          <span>{invitation.cover_title || 'THƯ MỜI DỰ TIỆC'}</span>
          <Heart className="w-4 h-4 fill-[#B76E79] text-[#B76E79]" />
        </div>

        <h1
          className="text-5xl sm:text-7xl font-bold tracking-tight text-[#292624] leading-tight"
          style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
        >
          {invitation.host_name || invitation.title}
        </h1>

        {invitation.description && (
          <p className="text-base sm:text-lg text-gray-600 font-light max-w-lg mx-auto leading-relaxed">
            {invitation.description}
          </p>
        )}

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4 text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E8DFD8] shadow-sm">
            <Calendar className="w-4 h-4 text-[#B76E79]" />
            <span>{invitation.event_date} {invitation.event_start_time ? `• ${invitation.event_start_time}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#E8DFD8] shadow-sm">
            <MapPin className="w-4 h-4 text-[#8FA79B]" />
            <span className="truncate max-w-xs">{invitation.venue_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
