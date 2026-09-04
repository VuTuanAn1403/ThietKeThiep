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
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  React.useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveIndex(null);
      if (e.key === 'ArrowLeft') {
        setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
      }
      if (e.key === 'ArrowRight') {
        setActiveIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, galleryImages.length]);

  if (galleryImages.length === 0) return null;

  const currentImage = activeIndex !== null ? galleryImages[activeIndex] : null;

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
              onClick={() => setActiveIndex(idx)}
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
      {currentImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-md">
          <button
            onClick={() => setActiveIndex(null)}
            className="absolute top-4 right-4 text-white p-2.5 hover:bg-white/20 rounded-full transition-colors z-10"
            aria-label="Đóng ảnh"
          >
            <X className="w-6 h-6" />
          </button>

          {galleryImages.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : galleryImages.length - 1));
                }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all z-10"
                aria-label="Ảnh trước"
              >
                &#10094;
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveIndex((prev) => (prev !== null && prev < galleryImages.length - 1 ? prev + 1 : 0));
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-3 rounded-full bg-black/40 hover:bg-black/60 transition-all z-10"
                aria-label="Ảnh sau"
              >
                &#10095;
              </button>
            </>
          )}

          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex flex-col items-center justify-center">
            <div className="relative w-full h-[75vh] rounded-2xl overflow-hidden">
              <Image src={currentImage.image_url} alt="Gallery image" fill className="object-contain" priority />
            </div>
            {currentImage.caption && (
              <p className="mt-3 text-white/90 text-sm font-medium font-serif italic text-center px-4">
                {currentImage.caption}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
