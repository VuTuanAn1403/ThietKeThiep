'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Eye, CheckCircle2, AlertCircle } from 'lucide-react';
import { InvitationService } from '@/services/invitation.service';
import { Invitation, InvitationSection, GalleryImage, StoryItem } from '@/types/database.types';
import EditorPanel from '@/components/editor/EditorPanel';
import LivePreviewPanel from '@/components/editor/LivePreviewPanel';

export default function EditInvitationPage() {
  const params = useParams();
  const invitationId = params.id as string;

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [sections, setSections] = useState<InvitationSection[]>([]);
  const [storyItems, setStoryItems] = useState<StoryItem[]>([]);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function load() {
      if (invitationId) {
        setLoading(true);
        const inv = await InvitationService.getInvitationById(invitationId);
        if (inv) {
          setInvitation(inv);
          const secs = await InvitationService.getSections(inv.id);
          const stories = await InvitationService.getStoryItems(inv.id);
          const imgs = await InvitationService.getGalleryImages(inv.id);
          setSections(secs);
          setStoryItems(stories);
          setGalleryImages(imgs);
        }
        setLoading(false);
      }
    }
    load();
  }, [invitationId]);

  const showToast = (text: string, type: 'success' | 'error') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSave = async () => {
    if (!invitation) return;
    setSaving(true);
    try {
      const res = await InvitationService.updateInvitation(invitation.id, invitation);
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        await InvitationService.updateSections(invitation.id, sections);
        showToast('Đã lưu thành công các thay đổi!', 'success');
      }
    } catch {
      showToast('Đã xảy ra lỗi khi lưu.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!invitation) return;
    setSaving(true);
    try {
      const res = await InvitationService.publishInvitation(invitation.id);
      if (res.error) {
        showToast(res.error, 'error');
      } else {
        setInvitation({ ...invitation, status: 'PUBLISHED' });
        showToast('Đã xuất bản thiệp thành công! Bạn có thể chia sẻ link ngay.', 'success');
      }
    } catch {
      showToast('Đã xảy ra lỗi khi xuất bản.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddGalleryImage = async (url: string, caption?: string) => {
    if (!invitation) return;
    const newImg = await InvitationService.addGalleryImage(invitation.id, url, caption);
    setGalleryImages([...galleryImages, newImg]);
  };

  const handleDeleteGalleryImage = async (id: string) => {
    await InvitationService.deleteGalleryImage(id);
    setGalleryImages(galleryImages.filter((g) => g.id !== id));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <p className="text-gray-500 font-medium">Đang tải trình chỉnh sửa thiệp...</p>
      </div>
    );
  }

  if (!invitation) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-serif font-bold text-[#292624]">Không tìm thấy thiệp mời</h1>
        <Link href="/dashboard" className="mt-4 text-sm font-medium text-[#B76E79] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Quay lại Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[#FFFDF9]">
      {/* Top Navbar */}
      <header className="h-14 bg-white border-b border-[#E8DFD8] px-4 flex items-center justify-between flex-shrink-0 z-20">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-600 hover:text-[#B76E79] transition-colors p-1">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-serif font-bold text-lg text-[#292624] truncate max-w-xs sm:max-w-md">
            {invitation.title}
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase ${
              invitation.status === 'PUBLISHED'
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-amber-100 text-amber-700'
            }`}
          >
            {invitation.status}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {invitation.status === 'PUBLISHED' && (
            <a
              href={`/i/${invitation.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl border border-[#E8DFD8] text-xs font-semibold text-[#292624] hover:bg-[#F4EFEB] transition-colors flex items-center gap-1.5"
            >
              <Eye className="w-3.5 h-3.5 text-[#B76E79]" /> Xem Thiệp Công Khai
            </a>
          )}
        </div>
      </header>

      {/* Notification Toast */}
      {toastMsg && (
        <div
          className={`fixed top-16 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm flex items-center gap-3 transition-all ${
            toastMsg.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          {toastMsg.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          )}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main Split Content: Left Editor Control Panel (40%), Right Live Preview (60%) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        <div className="lg:col-span-5 h-full overflow-hidden">
          <EditorPanel
            invitation={invitation}
            sections={sections}
            galleryImages={galleryImages}
            onChangeInvitation={(updates) => setInvitation({ ...invitation, ...updates })}
            onChangeSections={(updatedSecs) => setSections(updatedSecs)}
            onAddGalleryImage={handleAddGalleryImage}
            onDeleteGalleryImage={handleDeleteGalleryImage}
            onSave={handleSave}
            onPublish={handlePublish}
            saving={saving}
          />
        </div>

        <div className="hidden lg:block lg:col-span-7 h-full overflow-hidden">
          <LivePreviewPanel
            invitation={invitation}
            sections={sections}
            storyItems={storyItems}
            galleryImages={galleryImages}
          />
        </div>
      </div>
    </div>
  );
}
