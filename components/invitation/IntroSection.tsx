'use client';

import React from 'react';
import { Quote } from 'lucide-react';
import { Invitation } from '@/types/database.types';

interface Props {
  invitation: Invitation;
}

export default function IntroSection({ invitation }: Props) {
  return (
    <div className="py-16 px-6 bg-white border-y border-[#E8DFD8] text-center">
      <div className="max-w-xl mx-auto space-y-4">
        <Quote className="w-8 h-8 mx-auto text-[#B76E79]/40" />
        <p
          className="text-xl sm:text-2xl italic font-serif text-[#292624] leading-relaxed"
          style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
        >
          &ldquo;Hạnh phúc không phải là điểm đến, mà là một hành trình chúng ta cùng nhau đi qua từng ngày.&rdquo;
        </p>
        <div className="w-12 h-0.5 bg-[#B76E79] mx-auto mt-4 opacity-50"></div>
      </div>
    </div>
  );
}
