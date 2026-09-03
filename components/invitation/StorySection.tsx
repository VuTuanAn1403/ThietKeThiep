'use client';

import React from 'react';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import { StoryItem, Invitation } from '@/types/database.types';

interface Props {
  invitation: Invitation;
  storyItems?: StoryItem[];
}

export default function StorySection({ invitation, storyItems = [] }: Props) {
  if (storyItems.length === 0) return null;

  return (
    <div className="py-16 px-6 bg-white border-b border-[#E8DFD8]">
      <div className="max-w-3xl mx-auto text-center space-y-10">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#B76E79]">
            Hành Trình Tình Yêu
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#292624] mt-2"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            Chặng Đường Chúng Mình Đã Qua
          </h2>
        </div>

        <div className="relative border-l-2 border-[#E8DFD8] ml-4 sm:ml-32 space-y-12 text-left">
          {storyItems.map((item, idx) => (
            <div key={item.id || idx} className="relative pl-8 sm:pl-10">
              <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-[#B76E79] border-4 border-white shadow-sm flex items-center justify-center"></div>

              <div className="bg-[#FFFDF9] p-6 rounded-2xl border border-[#E8DFD8] shadow-sm space-y-3">
                {item.date && (
                  <span className="inline-block px-3 py-1 rounded-full bg-[#F4EFEB] text-[#B76E79] text-xs font-semibold">
                    {item.date}
                  </span>
                )}
                <h3 className="text-xl font-bold font-serif text-[#292624]">{item.title}</h3>
                {item.description && <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>}
                {item.image_url && (
                  <div className="relative w-full h-48 rounded-xl overflow-hidden mt-3 bg-gray-100">
                    <Image src={item.image_url} alt={item.title} fill className="object-cover" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
