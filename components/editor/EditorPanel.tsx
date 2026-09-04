'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  FileText,
  Palette,
  Layers,
  Image as ImageIcon,
  Music,
  Save,
  Globe,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowLeft,
  Share2,
} from 'lucide-react';
import { Invitation, InvitationSection, GalleryImage } from '@/types/database.types';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Input from '@/components/ui/Input';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Props {
  invitation: Invitation;
  sections: InvitationSection[];
  galleryImages: GalleryImage[];
  onChangeInvitation: (updates: Partial<Invitation>) => void;
  onChangeSections: (sections: InvitationSection[]) => void;
  onAddGalleryImage: (url: string, caption?: string) => void;
  onDeleteGalleryImage: (id: string) => void;
  onSave: () => void;
  onPublish: () => void;
  saving?: boolean;
  saveStatus?: 'saved' | 'unsaved' | 'saving' | 'error';
}

export default function EditorPanel({
  invitation,
  sections,
  galleryImages,
  onChangeInvitation,
  onChangeSections,
  onAddGalleryImage,
  onDeleteGalleryImage,
  onSave,
  onPublish,
  saving = false,
  saveStatus = 'saved',
}: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'theme' | 'sections' | 'gallery' | 'music'>('info');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgCaption, setNewImgCaption] = useState('');
  const [imgError, setImgError] = useState<string | null>(null);
  const [deleteImgId, setDeleteImgId] = useState<string | null>(null);

  // Keyboard shortcut: Ctrl + S or Cmd + S to save
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        onSave();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSave]);

  const toggleSection = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, is_visible: !s.is_visible } : s));
    onChangeSections(updated);
  };

  const handleAddImg = (e: React.FormEvent) => {
    e.preventDefault();
    setImgError(null);
    const url = newImgUrl.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      setImgError('Đường dẫn hình ảnh không hợp lệ (cần bắt đầu bằng https://)');
      return;
    }

    onAddGalleryImage(url, newImgCaption.trim());
    setNewImgUrl('');
    setNewImgCaption('');
  };

  const getSaveBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 animate-spin" /> Đang lưu...
          </span>
        );
      case 'unsaved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 text-rose-700 border border-rose-200">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" /> Chưa lưu thay đổi
          </span>
        );
      case 'error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
            <AlertCircle className="w-3 h-3" /> Lỗi lưu
          </span>
        );
      case 'saved':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" /> Đã lưu
          </span>
        );
    }
  };

  return (
    <div className="bg-white border-r border-[#EAE4DF] h-full flex flex-col overflow-hidden">
      {/* Top Header / Save Status Bar */}
      <div className="p-4 border-b border-[#EAE4DF] flex items-center justify-between bg-[#FFFDF9]">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="p-1 rounded-lg hover:bg-gray-100 text-gray-500 hover:text-gray-900 transition-colors">
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <h2 className="font-serif font-bold text-base text-[#1F1B1C]">Trình Thiết Kế Thiệp</h2>
          </div>
          <div className="flex items-center gap-2 mt-1 pl-6">
            <span className="text-[11px] text-muted-foreground font-mono">/i/{invitation.slug}</span>
            {getSaveBadge()}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onSave}
            isLoading={saving}
            leftIcon={<Save className="w-3.5 h-3.5" />}
          >
            Lưu
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onPublish}
            disabled={saving}
            leftIcon={<Globe className="w-3.5 h-3.5" />}
          >
            {invitation.status === 'PUBLISHED' ? 'Cập Nhật' : 'Xuất Bản'}
          </Button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-[#EAE4DF] bg-[#FAF7F5] p-1.5 text-xs font-semibold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'info'
              ? 'bg-white text-primary shadow-sm font-bold border border-[#EAE4DF]'
              : 'text-muted-foreground hover:text-[#1F1B1C]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Thông Tin
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'theme'
              ? 'bg-white text-primary shadow-sm font-bold border border-[#EAE4DF]'
              : 'text-muted-foreground hover:text-[#1F1B1C]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" /> Màu &amp; Font
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'sections'
              ? 'bg-white text-primary shadow-sm font-bold border border-[#EAE4DF]'
              : 'text-muted-foreground hover:text-[#1F1B1C]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Các Mục
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'gallery'
              ? 'bg-white text-primary shadow-sm font-bold border border-[#EAE4DF]'
              : 'text-muted-foreground hover:text-[#1F1B1C]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Album Ảnh
        </button>
        <button
          onClick={() => setActiveTab('music')}
          className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all whitespace-nowrap cursor-pointer ${
            activeTab === 'music'
              ? 'bg-white text-primary shadow-sm font-bold border border-[#EAE4DF]'
              : 'text-muted-foreground hover:text-[#1F1B1C]'
          }`}
        >
          <Music className="w-3.5 h-3.5" /> Nhạc Nền
        </button>
      </div>

      {/* Main Tab Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Tab 1: Info */}
        {activeTab === 'info' && (
          <div className="space-y-4">
            <Input
              label="Tên thiệp / Lời tựa (Tiêu đề quản lý)"
              value={invitation.title}
              onChange={(e) => onChangeInvitation({ title: e.target.value })}
            />

            <Input
              label="Tiêu đề bìa (Ví dụ: Save The Date)"
              value={invitation.cover_title || ''}
              onChange={(e) => onChangeInvitation({ cover_title: e.target.value })}
            />

            <Input
              label="Tên chủ tiệc / Cô Dâu & Chú Rể"
              value={invitation.host_name || ''}
              onChange={(e) => onChangeInvitation({ host_name: e.target.value })}
            />

            <div className="space-y-1.5 text-left">
              <label className="block text-xs font-semibold text-[#1F1B1C]">Lời mời / Thông điệp</label>
              <textarea
                value={invitation.description || ''}
                onChange={(e) => onChangeInvitation({ description: e.target.value })}
                rows={4}
                className="w-full bg-white text-sm text-[#1F1B1C] border border-[#EAE4DF] rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-primary/20"
                placeholder="Nhập thông điệp yêu thương gửi tới khách mời..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Ngày tổ chức"
                type="date"
                value={invitation.event_date}
                onChange={(e) => onChangeInvitation({ event_date: e.target.value })}
              />
              <Input
                label="Giờ bắt đầu"
                type="time"
                value={invitation.event_start_time || ''}
                onChange={(e) => onChangeInvitation({ event_start_time: e.target.value })}
              />
            </div>

            <Input
              label="Tên địa điểm / Trung tâm tiệc cưới"
              value={invitation.venue_name}
              onChange={(e) => onChangeInvitation({ venue_name: e.target.value })}
            />

            <Input
              label="Địa chỉ chi tiết"
              value={invitation.venue_address}
              onChange={(e) => onChangeInvitation({ venue_address: e.target.value })}
            />

            <Input
              label="Link Google Maps"
              value={invitation.map_url || ''}
              onChange={(e) => onChangeInvitation({ map_url: e.target.value })}
              placeholder="https://maps.google.com/..."
            />
          </div>
        )}

        {/* Tab 2: Theme */}
        {activeTab === 'theme' && (
          <div className="space-y-5">
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1F1B1C]">Màu chủ đạo (Primary)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invitation.primary_color}
                  onChange={(e) => onChangeInvitation({ primary_color: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-[#EAE4DF] cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={invitation.primary_color}
                  onChange={(e) => onChangeInvitation({ primary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-[#EAE4DF] rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1F1B1C]">Màu phụ trợ (Secondary)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invitation.secondary_color}
                  onChange={(e) => onChangeInvitation({ secondary_color: e.target.value })}
                  className="w-10 h-10 rounded-xl border border-[#EAE4DF] cursor-pointer p-0.5 bg-white"
                />
                <input
                  type="text"
                  value={invitation.secondary_color}
                  onChange={(e) => onChangeInvitation({ secondary_color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-[#EAE4DF] rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-semibold text-[#1F1B1C]">Font chữ tiêu đề</label>
              <select
                value={invitation.heading_font}
                onChange={(e) => onChangeInvitation({ heading_font: e.target.value })}
                className="w-full px-3 py-2.5 border border-[#EAE4DF] rounded-xl text-xs bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="Cormorant Garamond">Cormorant Garamond (Editorial Serif)</option>
                <option value="Playfair Display">Playfair Display (Luxury Classic)</option>
                <option value="Plus Jakarta Sans">Plus Jakarta Sans (Modern Clean)</option>
                <option value="Montserrat">Montserrat (Geometric Elegance)</option>
              </select>
            </div>
          </div>
        )}

        {/* Tab 3: Sections */}
        {activeTab === 'sections' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Bật hoặc tắt các mục nội dung hiển thị trên thiệp mời công khai:
            </p>
            <div className="space-y-2">
              {sections.map((sec) => (
                <div
                  key={sec.id}
                  className="flex items-center justify-between p-3.5 bg-[#FAF7F5] rounded-xl border border-[#EAE4DF]"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="font-semibold text-xs text-[#1F1B1C]">
                      {sec.section_type.toUpperCase()}
                    </span>
                    <Badge variant={sec.is_visible ? 'success' : 'neutral'}>
                      {sec.is_visible ? 'Hiển thị' : 'Tạm ẩn'}
                    </Badge>
                  </div>
                  <button
                    onClick={() => toggleSection(sec.id)}
                    className="p-1.5 text-gray-500 hover:text-primary transition-colors cursor-pointer"
                    title={sec.is_visible ? 'Ẩn mục này' : 'Hiện mục này'}
                  >
                    {sec.is_visible ? <Eye className="w-4 h-4 text-emerald-600" /> : <EyeOff className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Gallery */}
        {activeTab === 'gallery' && (
          <div className="space-y-4">
            <form onSubmit={handleAddImg} className="space-y-3 p-4 bg-[#FAF7F5] rounded-2xl border border-[#EAE4DF]">
              <h4 className="text-xs font-bold text-[#1F1B1C]">Thêm ảnh mới vào album</h4>
              {imgError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{imgError}</span>
                </div>
              )}
              <Input
                placeholder="Dán link ảnh trực tiếp (URL)..."
                value={newImgUrl}
                onChange={(e) => setNewImgUrl(e.target.value)}
              />
              <Input
                placeholder="Chú thích ảnh (tùy chọn)..."
                value={newImgCaption}
                onChange={(e) => setNewImgCaption(e.target.value)}
              />
              <Button type="submit" variant="primary" size="sm" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Thêm Ảnh
              </Button>
            </form>

            <div className="grid grid-cols-2 gap-3">
              {galleryImages.map((img) => (
                <div key={img.id} className="relative group aspect-[3/4] rounded-xl overflow-hidden border border-[#EAE4DF] bg-gray-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.image_url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button
                      onClick={() => setDeleteImgId(img.id)}
                      className="p-2 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow cursor-pointer"
                      title="Xóa ảnh"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Music */}
        {activeTab === 'music' && (
          <div className="space-y-4">
            <Input
              label="Đường dẫn file nhạc nền (MP3 URL)"
              placeholder="https://example.com/audio.mp3"
              value={invitation.music_url || ''}
              onChange={(e) => onChangeInvitation({ music_url: e.target.value })}
              helperText="Nhạc sẽ tự động phát hoặc hiện thanh điều khiển âm thanh trên thiệp."
            />
          </div>
        )}
      </div>

      {/* Delete Image Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteImgId}
        onClose={() => setDeleteImgId(null)}
        onConfirm={() => {
          if (deleteImgId) {
            onDeleteGalleryImage(deleteImgId);
            setDeleteImgId(null);
          }
        }}
        title="Xóa ảnh khỏi album"
        message="Bạn có chắc chắn muốn xóa ảnh này khỏi album kỷ niệm? Thao tác không thể hoàn tác."
        confirmText="Xóa ảnh"
      />
    </div>
  );
}
