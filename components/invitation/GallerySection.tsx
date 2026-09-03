'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Camera, X } from 'lucide-react';
import { GalleryImage, Invitation } from '@/types/database.types';

interface Props {
  invitation: Invitation;
  galleryImages?: GalleryImage[];
}

export default function GallerySection({ invitation, galleryImages = [] }: Props) {
  const [activeImage, setActiveImage] = useState<GalleryImage | null>(null);

  if (galleryImages.length === 0) return null;

  return (
    <div className="py-16 px-6 bg-[#FFFDF9] border-b border-[#E8DFD8]">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-[#B76E79]">
            <Camera className="w-4 h-4" />
            <span>Album Hình Ảnh</span>
          </div>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#292624] mt-2"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            Khoảnh Khắc Kỷ Niệm
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {galleryImages.map((img) => (
            <div
              key={img.id}
              onClick={() => setActiveImage(img)}
              className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group bg-gray-100 border border-[#E8DFD8]"
            >
              <Image
                src={img.image_url}
                alt={img.caption || 'Kỷ niệm'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {img.caption && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3 text-white text-xs font-medium text-left">
                  {img.caption}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 text-white p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-3xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[70vh] rounded-xl overflow-hidden">
              <Image src={activeImage.image_url} alt="Gallery image" fill className="object-contain" />
            </div>
            {activeImage.caption && (
              <p className="mt-3 text-white text-sm font-medium">{activeImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
