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
    <div className="py-20 px-6">
      <div className="max-w-4xl mx-auto text-center space-y-10">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#E85B6A]">
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

        {/* Masonry-style grid */}
        <div className="columns-2 sm:columns-3 gap-4 space-y-4">
          {galleryImages.map((img, idx) => (
            <div
              key={img.id}
              onClick={() => setActiveImage(img)}
              className="relative rounded-2xl overflow-hidden cursor-pointer group border border-[#EAE4DF] break-inside-avoid transition-all duration-300 hover:-translate-y-1 hover:shadow-depth-md"
              style={{ aspectRatio: idx % 3 === 0 ? '3/4' : idx % 3 === 1 ? '1/1' : '4/3' }}
            >
              <Image
                src={img.image_url}
                alt={img.caption || 'Kỷ niệm'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              {img.caption && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                  <span className="text-white text-xs font-medium">{img.caption}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeImage && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <button
            onClick={() => setActiveImage(null)}
            className="absolute top-4 right-4 text-white p-2.5 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Đóng ảnh"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-3xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[70vh] rounded-xl overflow-hidden">
              <Image src={activeImage.image_url} alt="Gallery image" fill className="object-contain" />
            </div>
            {activeImage.caption && (
              <p className="mt-4 text-white text-sm font-medium font-serif italic">{activeImage.caption}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
