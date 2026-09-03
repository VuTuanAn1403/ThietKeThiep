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
    <div className="bg-[#FAF7F5] h-full flex flex-col items-center justify-between p-4 overflow-hidden border-l border-[#EAE4DF]">
      {/* Device Toggle Header */}
      <div className="bg-white/90 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#EAE4DF] shadow-soft flex items-center gap-2 mb-4 z-10">
        <button
          onClick={() => setDevice('mobile')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            device === 'mobile' ? 'btn-luxury-primary text-white shadow-sm' : 'text-[#756B70] hover:text-[#1F1B1C]'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Mobile Preview
        </button>
        <button
          onClick={() => setDevice('desktop')}
          className={`px-4 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all ${
            device === 'desktop' ? 'btn-luxury-primary text-white shadow-sm' : 'text-[#756B70] hover:text-[#1F1B1C]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" /> Desktop Preview
        </button>
      </div>

      {/* Screen Frame Container */}
      <div className="flex-1 w-full flex items-center justify-center overflow-y-auto pb-4">
        <div
          className={`transition-all duration-300 bg-white overflow-hidden shadow-floating border border-[#EAE4DF] ${
            device === 'mobile'
              ? 'w-[375px] h-[720px] rounded-[40px] ring-8 ring-[#1F1B1C] border-4 border-gray-800'
              : 'w-full max-w-5xl h-[750px] rounded-3xl'
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
