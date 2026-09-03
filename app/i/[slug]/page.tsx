'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Heart, AlertCircle } from 'lucide-react';
import { InvitationService } from '@/services/invitation.service';
import { GuestService } from '@/services/guest.service';
import { Invitation, InvitationSection, StoryItem, GalleryImage, Guest } from '@/types/database.types';
import InvitationRenderer from '@/components/invitation/InvitationRenderer';

interface PageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ to?: string }>;
}

export default function PublicInvitationPage({ params, searchParams }: PageProps) {
  const resolvedParams = use(params);
  const resolvedSearchParams = use(searchParams);

  const slug = resolvedParams.slug;
  const guestSlug = resolvedSearchParams.to;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [sections, setSections] = useState<InvitationSection[]>([]);
  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [guest, setGuest] = useState<Guest | null>(null);

  const [loading, setLoading] = useState<boolean>(true);
  const [notFound, setNotFound] = useState<boolean>(false);
  const [isDraft, setIsDraft] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      if (slug) {
        setLoading(true);
        const inv = await InvitationService.getInvitationBySlug(slug);

        if (!inv) {
          setNotFound(true);
          setLoading(false);
          return;
        }

        if (inv.status === 'DRAFT') {
          setIsDraft(true);
          setInvitation(inv);
          setLoading(false);
          return;
        }

        setInvitation(inv);
        const secs = await InvitationService.getSections(inv.id);
        const stories = await InvitationService.getStoryItems(inv.id);
        const imgs = await InvitationService.getGalleryImages(inv.id);
        setSections(secs);
        setStoryItems(stories);
        setGalleryImages(imgs);

        if (guestSlug) {
          const gst = await GuestService.getGuestBySlug(inv.id, guestSlug);
          setGuest(gst);
        }

        // Track view count
        await GuestService.recordView(inv.id, guestSlug ? (await GuestService.getGuestBySlug(inv.id, guestSlug))?.id : null);
        setLoading(false);
      }
    }
    load();
  }, [slug, guestSlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-4">
        <Heart className="w-8 h-8 text-[#B76E79] animate-pulse mb-3" />
        <p className="text-sm font-medium text-gray-600">Đang tải thiệp mời...</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h1 className="text-2xl font-serif font-bold text-[#292624]">Không Tìm Thấy Thiệp Mời</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-md">
          Đường dẫn thiệp không tồn tại hoặc đã được thay đổi. Vui lòng kiểm tra lại liên kết.
        </p>
        <Link href="/" className="mt-6 px-5 py-2.5 rounded-xl bg-[#B76E79] text-white text-xs font-semibold">
          Trở về Trang Chủ
        </Link>
      </div>
    );
  }

  if (isDraft) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
          <Heart className="w-6 h-6 fill-amber-700" />
        </div>
        <h1 className="text-2xl font-serif font-bold text-[#292624]">Thiệp Đang Được Thiết Kế</h1>
        <p className="text-sm text-gray-600 mt-2 max-w-md">
          Chủ tiệc hiện đang chỉnh sửa thiệp mời này và chưa chính thức xuất bản. Vui lòng quay lại sau!
        </p>
        {invitation && (
          <Link
            href={`/dashboard/invitations/${invitation.id}/edit`}
            className="mt-6 px-5 py-2.5 rounded-xl bg-[#B76E79] text-white text-xs font-semibold"
          >
            Chỉnh Sửa Thiệp (Chủ Sở Hữu)
          </Link>
        )}
      </div>
    );
  }

  if (!invitation) return null;

  return (
    <InvitationRenderer
      invitation={invitation}
      sections={sections}
      storyItems={storyItems}
      galleryImages={galleryImages}
      guest={guest}
      mode="public"
    />
  );
}
