'use client';

import React from 'react';
import { MapPin, Navigation } from 'lucide-react';
import { Invitation } from '@/types/database.types';

interface Props {
  invitation: Invitation;
}

export default function MapSection({ invitation }: Props) {
  const mapSearchQuery = encodeURIComponent(`${invitation.venue_name}, ${invitation.venue_address}`);
  const mapsUrl = invitation.map_url || `https://www.google.com/maps/search/?api=1&query=${mapSearchQuery}`;

  return (
    <div className="py-16 px-6 bg-[#FFFDF9] border-b border-[#E8DFD8] text-center">
      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">
            Bản Đồ Vị Trí
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#292624] mt-2"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            Hướng Dẫn Di Chuyển
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {invitation.venue_name} &bull; {invitation.venue_address}
          </p>
        </div>

        <div className="relative rounded-3xl border border-[#E8DFD8] overflow-hidden bg-gray-100 p-8 flex flex-col items-center justify-center min-h-[220px] shadow-sm">
          <MapPin className="w-12 h-12 text-[#B76E79] mb-3 animate-bounce" />
          <p className="text-sm font-medium text-gray-700 max-w-md">
            Bấm nút bên dưới để mở ứng dụng Google Maps / Apple Maps trực tiếp trên điện thoại của bạn.
          </p>
          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-5 inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#B76E79] text-white text-sm font-semibold hover:bg-[#a25b66] transition-colors shadow-md"
          >
            <Navigation className="w-4 h-4" />
            Mở Bản Đồ Chỉ Đường
          </a>
        </div>
      </div>
    </div>
  );
}
