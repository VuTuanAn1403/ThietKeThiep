'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import { Invitation } from '@/types/database.types';

interface Props {
  invitation: Invitation;
}

export default function FooterSection({ invitation }: Props) {
  return (
    <footer className="py-12 px-6 bg-white text-center text-gray-500 text-xs border-t border-[#E8DFD8]">
      <div className="max-w-md mx-auto space-y-3">
        <Heart className="w-5 h-5 mx-auto fill-[#B76E79] text-[#B76E79]" />
        <p
          className="text-[#292624] font-serif font-bold text-lg"
          style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
        >
          {invitation.host_name || invitation.title}
        </p>
        <p className="text-gray-500">Trân trọng cảm ơn sự hiện diện và những lời chúc trân quý của bạn!</p>
        <div className="pt-4 text-[10px] text-gray-400">
          Thiết kế & xuất bản bởi <span className="font-semibold text-[#B76E79]">Nhà Có Tiệc</span>
        </div>
      </div>
    </footer>
  );
}
