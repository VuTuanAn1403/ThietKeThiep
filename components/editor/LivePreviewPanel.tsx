'use client';

import React, { useState } from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { Invitation, InvitationSection, StoryItem, GalleryImage } from '@/types/database.types';
import InvitationRenderer from '@/components/invitation/InvitationRenderer';

interface Props {
  invitation: Invitation;
  sections: InvitationSection[];
  storyItems?: StoryItem[];
  galleryImages?: GalleryImage[];
}

export default function LivePreviewPanel({
  invitation,
  sections,
  storyItems = [],
  galleryImages = [],
}: Props) {
  const [device, setDevice] = useState<'mobile' | 'desktop'>('mobile');

  return (
    <div className="bg-gray-100 h-full flex flex-col items-center justify-between p-4 overflow-hidden">
      {/* Device Toggle Header */}
      <div className="bg-white px-3 py-1.5 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center gap-2 mb-4 z-10">
        <button
          onClick={() => setDevice('mobile')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            device === 'mobile' ? 'bg-[#B76E79] text-white shadow-sm' : 'text-gray-600 hover:text-[#292624]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Mobile View
        </button>
        <button
          onClick={() => setDevice('desktop')}
          className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
            device === 'desktop' ? 'bg-[#B76E79] text-white shadow-sm' : 'text-gray-600 hover:text-[#292624]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" /> Desktop View
        </button>
      </div>

      {/* Screen Frame Container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-y-auto pb-4">
        <div
          className={`transition-all duration-300 bg-white overflow-hidden shadow-2xl border border-[#E8DFD8] ${
            device === 'mobile'
              ? 'w-[375px] h-[720px] rounded-[36px] ring-8 ring-gray-900 border-4 border-gray-800'
              : 'w-full max-w-5xl h-[750px] rounded-2xl'
          }`}
        >
          <div className="w-full h-full overflow-y-auto">
            <InvitationRenderer
              invitation={invitation}
              sections={sections}
              storyItems={storyItems}
              galleryImages={galleryImages}
              mode="preview"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
