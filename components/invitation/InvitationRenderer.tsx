'use client';

import React, { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Invitation, InvitationSection, StoryItem, GalleryImage, Guest } from '@/types/database.types';
import HeroSection from './HeroSection';
import IntroSection from './IntroSection';
import CountdownSection from './CountdownSection';
import EventSection from './EventSection';
import MapSection from './MapSection';
import StorySection from './StorySection';
import GallerySection from './GallerySection';
import GiftSection from './GiftSection';
import SignatureSection from './SignatureSection';
import RSVPSection from './RSVPSection';
import GuestbookSection from './GuestbookSection';
import FooterSection from './FooterSection';
import { StickyMobileCTA } from '@/components/StickyMobileCTA';

interface Props {
  invitation: Invitation;
  sections?: InvitationSection[];
  storyItems?: StoryItem[];
  galleryImages?: GalleryImage[];
  guest?: Guest | null;
  mode?: 'public' | 'preview';
}

/* Each section fades-in as user scrolls to it */
function SectionReveal({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function InvitationRenderer({
  invitation,
  sections = [],
  storyItems = [],
  galleryImages = [],
  guest,
}: Props) {
  // Filter visible sections and sort by display_order
  const visibleSections = [...sections]
    .filter((s) => s.is_visible)
    .sort((a, b) => a.display_order - b.display_order);

  // Fallback section list if no sections provided
  const activeSectionTypes = visibleSections.length > 0
    ? visibleSections.map((s) => s.section_type)
    : ['HERO', 'INTRO', 'COUNTDOWN', 'EVENT', 'MAP', 'GALLERY', 'GIFT', 'SIGNATURE', 'RSVP', 'GUESTBOOK', 'FOOTER'];

  /* Background tone per section for visual variety */
  const sectionBg: Record<string, string> = {
    HERO: '',
    INTRO: 'inv-bg-warm',
    COUNTDOWN: 'inv-bg-blush',
    EVENT: 'inv-bg-cream',
    MAP: 'inv-bg-warm',
    STORY: 'inv-bg-blush',
    GALLERY: 'inv-bg-warm',
    GIFT: 'inv-bg-champagne',
    SIGNATURE: 'inv-bg-sage',
    RSVP: 'inv-bg-blush',
    GUESTBOOK: 'inv-bg-champagne',
    FOOTER: '',
  };

  return (
    <div className="w-full bg-[#FFFDF9] min-h-screen text-[#292624] font-sans antialiased selection:bg-[#B76E79]/20 pb-16 md:pb-0">
      {/* Sticky Mobile CTA for Invitation */}
      <StickyMobileCTA type="invitation" invitationTitle={invitation.title} />

      {/* Dynamic Background Audio Player if music_url exists */}
      {invitation.music_url && (
        <div className="fixed bottom-4 right-4 z-40">
          <audio controls autoPlay loop className="h-10 w-44 rounded-full opacity-80 hover:opacity-100 transition-opacity shadow-lg">
            <source src={invitation.music_url} type="audio/mpeg" />
          </audio>
        </div>
      )}

      {activeSectionTypes.map((type) => {
        const bg = sectionBg[type] || '';
        const content = (() => {
          switch (type) {
            case 'HERO':
              return <HeroSection key={type} invitation={invitation} guest={guest} />;
            case 'INTRO':
              return <IntroSection key={type} invitation={invitation} />;
            case 'COUNTDOWN':
              return <CountdownSection key={type} invitation={invitation} />;
            case 'EVENT':
              return <EventSection key={type} invitation={invitation} />;
            case 'MAP':
              return <MapSection key={type} invitation={invitation} />;
            case 'STORY':
              return <StorySection key={type} invitation={invitation} storyItems={storyItems} />;
            case 'GALLERY':
              return <GallerySection key={type} invitation={invitation} galleryImages={galleryImages} />;
            case 'GIFT':
              return <GiftSection key={type} invitationId={invitation.id} />;
            case 'SIGNATURE':
              return <SignatureSection key={type} invitationId={invitation.id} guestNameDefault={guest?.name} guestId={guest?.id} />;
            case 'RSVP':
              return <RSVPSection key={type} invitation={invitation} guest={guest} />;
            case 'GUESTBOOK':
              return <GuestbookSection key={type} invitation={invitation} guest={guest} />;
            case 'FOOTER':
              return <FooterSection key={type} invitation={invitation} />;
            default:
              return null;
          }
        })();

        // Hero renders without wrapper; others get scroll reveal + background
        if (type === 'HERO' || type === 'FOOTER') {
          return <div key={type} className={bg}>{content}</div>;
        }

        return (
          <SectionReveal key={type} className={bg}>
            {content}
          </SectionReveal>
        );
      })}
    </div>
  );
}
