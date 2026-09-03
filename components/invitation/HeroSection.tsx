'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Calendar, MapPin } from 'lucide-react';
import { Invitation, Guest } from '@/types/database.types';

interface Props {
  invitation: Invitation;
  guest?: Guest | null;
}

export default function HeroSection({ invitation, guest }: Props) {
  return (
    <div
      className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-6 py-24 overflow-hidden"
      style={{
        backgroundColor: invitation.primary_color ? `${invitation.primary_color}08` : '#FFFDFB',
      }}
    >
      {/* Decorative background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#E85B6A_1px,transparent_1px)] [background-size:28px_28px]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#E85B6A]/5 via-transparent to-[#C5A880]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-gradient-to-tl from-[#D98B93]/5 to-transparent rounded-full blur-3xl" />
      </div>

      {/* Decorative floral accent — subtle SVG hearts */}
      <div className="absolute top-16 left-8 opacity-[0.05] text-[#E85B6A]" aria-hidden="true">
        <Heart className="w-24 h-24 fill-current" />
      </div>
      <div className="absolute bottom-16 right-8 opacity-[0.05] text-[#C5A880]" aria-hidden="true">
        <Heart className="w-20 h-20 fill-current rotate-12" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto space-y-7">
        {/* Guest badge */}
        {guest && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="inline-block px-6 py-2.5 rounded-full bg-white/90 border border-[#EAE4DF] text-xs font-semibold text-[#E85B6A] shadow-soft mb-2 backdrop-blur-sm"
          >
            Trân trọng kính mời: <span className="font-bold text-[#1F1B1C]">{guest.name}</span>
          </motion.div>
        )}

        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2.5 text-xs font-semibold tracking-[0.2em] uppercase text-[#756B70]"
        >
          <Heart className="w-3.5 h-3.5 fill-[#E85B6A] text-[#E85B6A]" />
          <span>{invitation.cover_title || 'THƯ MỜI DỰ TIỆC'}</span>
          <Heart className="w-3.5 h-3.5 fill-[#E85B6A] text-[#E85B6A]" />
        </motion.div>

        {/* Main heading — bride & groom names */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-7xl lg:text-8xl font-serif font-bold tracking-tight text-[#1F1B1C] leading-[1.05]"
          style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
        >
          {invitation.host_name || invitation.title}
        </motion.h1>

        {/* Description */}
        {invitation.description && (
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-base sm:text-lg text-[#756B70] font-light max-w-lg mx-auto leading-relaxed italic"
          >
            {invitation.description}
          </motion.p>
        )}

        {/* Event info pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3.5 text-xs font-medium text-[#1F1B1C]"
        >
          <div className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/80 border border-[#EAE4DF] shadow-soft backdrop-blur-sm">
            <Calendar className="w-4 h-4 text-[#E85B6A]" />
            <span>{invitation.event_date} {invitation.event_start_time ? `• ${invitation.event_start_time}` : ''}</span>
          </div>
          <div className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white/80 border border-[#EAE4DF] shadow-soft backdrop-blur-sm">
            <MapPin className="w-4 h-4 text-[#8FA79B]" />
            <span className="truncate max-w-xs">{invitation.venue_name}</span>
          </div>
        </motion.div>
      </div>

      {/* Bottom scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.4 }}
        transition={{ delay: 1.5, duration: 0.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
      >
        <div className="w-6 h-10 rounded-full border-2 border-[#756B70]/30 flex justify-center pt-2">
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            className="w-1.5 h-1.5 rounded-full bg-[#756B70]/50"
          />
        </div>
      </motion.div>
    </div>
  );
}
