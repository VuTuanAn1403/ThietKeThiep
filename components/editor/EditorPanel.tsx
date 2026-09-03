'use client';

import React, { useState } from 'react';
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
} from 'lucide-react';
import { Invitation, InvitationSection, GalleryImage } from '@/types/database.types';

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
}: Props) {
  const [activeTab, setActiveTab] = useState<'info' | 'theme' | 'sections' | 'gallery' | 'music'>('info');
  const [newImgUrl, setNewImgUrl] = useState('');
  const [newImgCaption, setNewImgCaption] = useState('');

  const toggleSection = (id: string) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, is_visible: !s.is_visible } : s));
    onChangeSections(updated);
  };

  const handleAddImg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newImgUrl.trim()) return;
    onAddGalleryImage(newImgUrl.trim(), newImgCaption.trim());
    setNewImgUrl('');
    setNewImgCaption('');
  };

  return (
    <div className="bg-white border-r border-[#EAE4DF] h-full flex flex-col overflow-hidden">
      {/* Top Header */}
      <div className="p-4 border-b border-[#EAE4DF] flex items-center justify-between bg-[#FFFDFB]">
        <div>
          <h2 className="font-serif font-bold text-lg text-[#1F1B1C]">Trình Thiết Kế Thiệp</h2>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[11px] text-[#756B70] font-mono">/i/{invitation.slug}</span>
            <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
              ● Tự động đồng bộ
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onSave}
            disabled={saving}
            className="px-4 py-1.5 rounded-full btn-luxury-secondary text-xs font-semibold flex items-center gap-1.5 disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5 text-[#E85B6A]" />
            {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
          <button
            onClick={onPublish}
            disabled={saving}
            className="px-4 py-1.5 rounded-full btn-luxury-primary text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
          >
            <Globe className="w-3.5 h-3.5" />
            {invitation.status === 'PUBLISHED' ? 'Cập Nhật' : 'Xuất Bản'}
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-[#EAE4DF] bg-[#FAF7F5] p-1.5 text-xs font-semibold overflow-x-auto gap-1">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'info' ? 'bg-white text-[#E85B6A] shadow-soft font-bold border border-[#EAE4DF]' : 'text-[#756B70] hover:text-[#1F1B1C]'
          }`}
        >
          <FileText className="w-3.5 h-3.5" /> Thông Tin
        </button>
        <button
          onClick={() => setActiveTab('theme')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'theme' ? 'bg-white text-[#E85B6A] shadow-soft font-bold border border-[#EAE4DF]' : 'text-[#756B70] hover:text-[#1F1B1C]'
          }`}
        >
          <Palette className="w-3.5 h-3.5" /> Theme
        </button>
        <button
          onClick={() => setActiveTab('sections')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'sections' ? 'bg-white text-[#E85B6A] shadow-soft font-bold border border-[#EAE4DF]' : 'text-[#756B70] hover:text-[#1F1B1C]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> Sections
        </button>
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'gallery' ? 'bg-white text-[#E85B6A] shadow-soft font-bold border border-[#EAE4DF]' : 'text-[#756B70] hover:text-[#1F1B1C]'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Album
        </button>
        <button
          onClick={() => setActiveTab('music')}
          className={`flex-1 py-2 px-3 rounded-full flex items-center justify-center gap-1.5 transition-all whitespace-nowrap ${
            activeTab === 'music' ? 'bg-white text-[#E85B6A] shadow-soft font-bold border border-[#EAE4DF]' : 'text-[#756B70] hover:text-[#1F1B1C]'
          }`}
        >
          <Music className="w-3.5 h-3.5" /> Nhạc
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6">
        {activeTab === 'info' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Tên Thiệp (Nội bộ)</label>
              <input
                type="text"
                value={invitation.title}
                onChange={(e) => onChangeInvitation({ title: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Đường dẫn Slug (URL)</label>
              <input
                type="text"
                value={invitation.slug}
                onChange={(e) => onChangeInvitation({ slug: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Tiêu đề bìa (Cover Title)</label>
              <input
                type="text"
                value={invitation.cover_title || ''}
                onChange={(e) => onChangeInvitation({ cover_title: e.target.value })}
                placeholder="Lễ Thành Hôn / Tiệc Mừng..."
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Tên chủ tiệc (Host Name)</label>
              <input
                type="text"
                value={invitation.host_name || ''}
                onChange={(e) => onChangeInvitation({ host_name: e.target.value })}
                placeholder="Minh & Anh..."
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Mô tả ngắn / Lời ngỏ</label>
              <textarea
                rows={3}
                value={invitation.description || ''}
                onChange={(e) => onChangeInvitation({ description: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
              ></textarea>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#292624] mb-1">Ngày tổ chức</label>
                <input
                  type="date"
                  value={invitation.event_date}
                  onChange={(e) => onChangeInvitation({ event_date: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#292624] mb-1">Giờ bắt đầu</label>
                <input
                  type="time"
                  value={invitation.event_start_time || ''}
                  onChange={(e) => onChangeInvitation({ event_start_time: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Tên địa điểm</label>
              <input
                type="text"
                value={invitation.venue_name}
                onChange={(e) => onChangeInvitation({ venue_name: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Địa chỉ chi tiết</label>
              <input
                type="text"
                value={invitation.venue_address}
                onChange={(e) => onChangeInvitation({ venue_address: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Link Google Maps (Tùy chọn)</label>
              <input
                type="url"
                value={invitation.map_url || ''}
                onChange={(e) => onChangeInvitation({ map_url: e.target.value })}
                placeholder="https://maps.google.com/..."
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none font-mono"
              />
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Màu chủ đạo (Primary Color)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invitation.primary_color}
                  onChange={(e) => onChangeInvitation({ primary_color: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-[#E8DFD8]"
                />
                <input
                  type="text"
                  value={invitation.primary_color}
                  onChange={(e) => onChangeInvitation({ primary_color: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#292624] mb-1">Màu phụ (Secondary Color)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={invitation.secondary_color}
                  onChange={(e) => onChangeInvitation({ secondary_color: e.target.value })}
                  className="w-10 h-10 rounded-xl cursor-pointer border border-[#E8DFD8]"
                />
                <input
                  type="text"
                  value={invitation.secondary_color}
                  onChange={(e) => onChangeInvitation({ secondary_color: e.target.value })}
                  className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#292624] mb-1">Font chữ tiêu đề</label>
              <select
                value={invitation.heading_font}
                onChange={(e) => onChangeInvitation({ heading_font: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79]"
              >
                <option value="Cormorant Garamond">Cormorant Garamond (Cổ điển & Sang trọng)</option>
                <option value="Playfair Display">Playfair Display (Thanh lịch & Hiện đại)</option>
                <option value="Montserrat">Montserrat (Tối giản & Trẻ trung)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-[#292624] mb-1">Font chữ nội dung</label>
              <select
                value={invitation.body_font}
                onChange={(e) => onChangeInvitation({ body_font: e.target.value })}
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79]"
              >
                <option value="Montserrat">Montserrat (Hiện đại & Dễ đọc)</option>
                <option value="Cormorant Garamond">Cormorant Garamond (Thơ mộng)</option>
              </select>
            </div>
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="space-y-3 text-xs">
            <p className="text-gray-500 mb-2">Bật/tắt hiển thị các phần trên thiệp:</p>
            {sections.map((sec) => (
              <div
                key={sec.id}
                className="p-3 bg-[#FFFDF9] rounded-xl border border-[#E8DFD8] flex items-center justify-between"
              >
                <span className="font-semibold text-[#292624]">{sec.section_type}</span>
                <button
                  type="button"
                  onClick={() => toggleSection(sec.id)}
                  className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                    sec.is_visible
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-gray-100 text-gray-500 border-gray-200'
                  }`}
                >
                  {sec.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  {sec.is_visible ? 'Hiển thị' : 'Ẩn'}
                </button>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'gallery' && (
          <div className="space-y-4 text-xs">
            <form onSubmit={handleAddImg} className="p-3 bg-[#FFFDF9] rounded-xl border border-[#E8DFD8] space-y-2">
              <label className="block font-semibold text-[#292624]">Thêm hình ảnh album</label>
              <input
                type="url"
                required
                value={newImgUrl}
                onChange={(e) => setNewImgUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3 py-1.5 border border-[#E8DFD8] rounded-lg font-mono"
              />
              <input
                type="text"
                value={newImgCaption}
                onChange={(e) => setNewImgCaption(e.target.value)}
                placeholder="Chú thích ảnh (Tùy chọn)"
                className="w-full px-3 py-1.5 border border-[#E8DFD8] rounded-lg"
              />
              <button
                type="submit"
                className="w-full py-1.5 bg-[#B76E79] text-white font-semibold rounded-lg hover:bg-[#a25b66] transition-colors flex items-center justify-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Thêm Ảnh
              </button>
            </form>

            <div className="space-y-2">
              {galleryImages.map((img) => (
                <div key={img.id} className="p-2 bg-white rounded-xl border border-[#E8DFD8] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 truncate">
                    <img src={img.image_url} alt="Gallery" className="w-10 h-10 object-cover rounded-lg flex-shrink-0" />
                    <span className="truncate text-gray-700">{img.caption || img.image_url}</span>
                  </div>
                  <button
                    onClick={() => onDeleteGalleryImage(img.id)}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'music' && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#292624] mb-1">URL Nhạc Nền MP3</label>
              <input
                type="url"
                value={invitation.music_url || ''}
                onChange={(e) => onChangeInvitation({ music_url: e.target.value })}
                placeholder="https://domain.com/music.mp3"
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none font-mono"
              />
              <p className="text-[10px] text-gray-500 mt-1">Dán link nhạc nền MP3 trực tiếp để tự động phát khi khách mở thiệp.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
