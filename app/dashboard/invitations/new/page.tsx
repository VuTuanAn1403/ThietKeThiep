'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Heart, Sparkles, AlertCircle } from 'lucide-react';
import { TemplateService } from '@/services/template.service';
import { InvitationService } from '@/services/invitation.service';
import { Category, Template } from '@/types/database.types';

function NewInvitationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedTemplateId = searchParams.get('templateId');

  const [step, setStep] = useState<number>(1);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);

  const [selectedCatId, setSelectedCatId] = useState<string>('');
  const [selectedTplId, setSelectedTplId] = useState<string>('');

  const [title, setTitle] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [hostName, setHostName] = useState<string>('');
  const [eventDate, setEventDate] = useState<string>('2026-10-20');
  const [venueName, setVenueName] = useState<string>('');
  const [venueAddress, setVenueAddress] = useState<string>('');

  const [primaryColor, setPrimaryColor] = useState<string>('#B76E79');
  const [secondaryColor, setSecondaryColor] = useState<string>('#8FA79B');

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    async function load() {
      const cats = await TemplateService.getCategories();
      const tpls = await TemplateService.getTemplates();
      setCategories(cats);
      setTemplates(tpls);

      if (preselectedTemplateId) {
        const foundTpl = tpls.find((t) => t.id === preselectedTemplateId);
        if (foundTpl) {
          setSelectedTplId(foundTpl.id);
          setSelectedCatId(foundTpl.category_id);
          setPrimaryColor(foundTpl.theme_config.primaryColor || '#B76E79');
          setSecondaryColor(foundTpl.theme_config.secondaryColor || '#8FA79B');
          setStep(3);
        }
      }
    }
    load();
  }, [preselectedTemplateId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    const autoSlug = val
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setSlug(autoSlug);
  };

  const handleCreate = async () => {
    setError(null);
    if (!title || !slug || !eventDate || !venueName || !venueAddress) {
      setError('Vui lòng nhập đầy đủ thông tin sự kiện');
      return;
    }

    setSubmitting(true);
    try {
      const res = await InvitationService.createInvitation('usr-demo-01', selectedTplId || templates[0]?.id, selectedCatId || categories[0]?.id, {
        title,
        slug,
        hostName,
        eventDate,
        venueName,
        venueAddress,
        primaryColor,
        secondaryColor,
        headingFont: 'Cormorant Garamond',
        bodyFont: 'Montserrat',
      });

      if (res.error) {
        setError(res.error);
      } else if (res.invitation) {
        router.push(`/dashboard/invitations/${res.invitation.id}/edit`);
      }
    } catch {
      setError('Đã xảy ra lỗi khi tạo thiệp');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#B76E79]">
            <ArrowLeft className="w-4 h-4" /> Trở về Dashboard
          </Link>
          <div className="flex items-center gap-2 text-xl font-serif font-bold text-[#B76E79]">
            <Heart className="w-6 h-6 fill-[#B76E79]" />
            <span>Tạo Thiệp Mới</span>
          </div>
        </div>

        {/* Wizard Steps Bar */}
        <div className="flex items-center justify-between border-b border-[#E8DFD8] pb-4">
          {[
            { num: 1, label: 'Loại Tiệc' },
            { num: 2, label: 'Chọn Template' },
            { num: 3, label: 'Thông Tin' },
            { num: 4, label: 'Tùy Chỉnh' },
          ].map((s) => (
            <div key={s.num} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step === s.num
                    ? 'bg-[#B76E79] text-white shadow-sm'
                    : step > s.num
                    ? 'bg-[#8FA79B] text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {step > s.num ? <Check className="w-4 h-4" /> : s.num}
              </div>
              <span className={`text-xs font-semibold hidden sm:inline ${step === s.num ? 'text-[#292624]' : 'text-gray-400'}`}>
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* STEP 1: CATEGORY */}
        {step === 1 && (
          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD8] shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#292624]">Bước 1: Chọn Loại Tiệc / Sự Kiện</h2>
              <p className="text-sm text-gray-600 mt-1">Chọn chủ đề bữa tiệc của bạn để lọc các mẫu thiệp phù hợp nhất.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedCatId === cat.id
                      ? 'border-[#B76E79] bg-[#F4EFEB]/60 shadow-sm'
                      : 'border-[#E8DFD8] bg-white hover:border-[#B76E79]/50'
                  }`}
                >
                  <Sparkles className="w-6 h-6 text-[#B76E79] mb-2" />
                  <h3 className="font-bold font-serif text-[#292624] text-base">{cat.name}</h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4">
              <button
                disabled={!selectedCatId}
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl bg-[#B76E79] text-white text-sm font-semibold hover:bg-[#a25b66] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                Tiếp Theo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: TEMPLATE */}
        {step === 2 && (
          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD8] shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#292624]">Bước 2: Chọn Mẫu Thiết Kế Thiệp</h2>
              <p className="text-sm text-gray-600 mt-1">Chọn mẫu giao diện bạn cảm thấy ưng ý nhất.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {templates
                .filter((t) => !selectedCatId || t.category_id === selectedCatId)
                .map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() => {
                      setSelectedTplId(tpl.id);
                      setPrimaryColor(tpl.theme_config.primaryColor || '#B76E79');
                      setSecondaryColor(tpl.theme_config.secondaryColor || '#8FA79B');
                    }}
                    className={`rounded-2xl border overflow-hidden cursor-pointer transition-all ${
                      selectedTplId === tpl.id
                        ? 'border-[#B76E79] ring-2 ring-[#B76E79] shadow-md'
                        : 'border-[#E8DFD8] bg-white hover:border-[#B76E79]/50'
                    }`}
                  >
                    <div className="h-44 bg-gray-100 relative">
                      <img src={tpl.thumbnail_url} alt={tpl.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-serif font-bold text-[#292624] text-lg">{tpl.name}</h3>
                        <span className="text-xs text-gray-500 font-mono">{tpl.theme_config.headingFont}</span>
                      </div>
                      {selectedTplId === tpl.id && (
                        <div className="w-6 h-6 rounded-full bg-[#B76E79] text-white flex items-center justify-center">
                          <Check className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2.5 rounded-xl border border-[#E8DFD8] text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Quay Lại
              </button>
              <button
                disabled={!selectedTplId}
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl bg-[#B76E79] text-white text-sm font-semibold hover:bg-[#a25b66] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                Tiếp Theo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: EVENT DETAILS */}
        {step === 3 && (
          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD8] shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#292624]">Bước 3: Nhập Thông Tin Sự Kiện</h2>
              <p className="text-sm text-gray-600 mt-1">Cung cấp các chi tiết quan trọng nhất cho bữa tiệc của bạn.</p>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-[#292624] mb-1">Tên Thiệp Mời *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Ví dụ: Đám Cưới Minh & Anh"
                  className="w-full px-4 py-2.5 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#292624] mb-1">Đường dẫn Slug (URL) *</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-gray-100 border border-r-0 border-[#E8DFD8] rounded-l-xl text-xs text-gray-500 font-mono">
                    /i/
                  </span>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E8DFD8] rounded-r-xl font-mono focus:ring-2 focus:ring-[#B76E79] focus:outline-none text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-[#292624] mb-1">Tên Chủ Tiệc / Cô Dâu - Chú Rể</label>
                  <input
                    type="text"
                    value={hostName}
                    onChange={(e) => setHostName(e.target.value)}
                    placeholder="Minh Hoàng & Ngọc Anh"
                    className="w-full px-4 py-2.5 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#292624] mb-1">Ngày Tổ Chức *</label>
                  <input
                    type="date"
                    required
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-4 py-2.5 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#292624] mb-1">Tên Địa Điểm Tổ Chức *</label>
                <input
                  type="text"
                  required
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                  placeholder="Trung Tâm Hội Nghị White Palace"
                  className="w-full px-4 py-2.5 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#292624] mb-1">Địa Chỉ Chi Tiết *</label>
                <input
                  type="text"
                  required
                  value={venueAddress}
                  onChange={(e) => setVenueAddress(e.target.value)}
                  placeholder="194 Hoàng Văn Thụ, Phường 9, Phú Nhuận, TP.HCM"
                  className="w-full px-4 py-2.5 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-[#B76E79] focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2.5 rounded-xl border border-[#E8DFD8] text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Quay Lại
              </button>
              <button
                disabled={!title || !slug || !venueName || !venueAddress}
                onClick={() => setStep(4)}
                className="px-6 py-2.5 rounded-xl bg-[#B76E79] text-white text-sm font-semibold hover:bg-[#a25b66] transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                Tiếp Theo <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: CUSTOMIZE & CREATE */}
        {step === 4 && (
          <div className="bg-white p-8 rounded-3xl border border-[#E8DFD8] shadow-sm space-y-6">
            <div>
              <h2 className="text-2xl font-serif font-bold text-[#292624]">Bước 4: Tùy Chỉnh & Hoàn Tất</h2>
              <p className="text-sm text-gray-600 mt-1">Chọn tông màu yêu thích và tạo thiệp để bắt đầu chỉnh sửa chi tiết.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-semibold text-[#292624] mb-2">Màu chủ đạo</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-[#E8DFD8]"
                  />
                  <input
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#292624] mb-2">Màu phụ</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-[#E8DFD8]"
                  />
                  <input
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl font-mono text-xs"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-[#E8DFD8]">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-2.5 rounded-xl border border-[#E8DFD8] text-gray-700 text-sm font-semibold hover:bg-gray-50"
              >
                Quay Lại
              </button>
              <button
                onClick={handleCreate}
                disabled={submitting}
                className="px-8 py-3 rounded-xl bg-[#B76E79] text-white text-sm font-semibold hover:bg-[#a25b66] transition-colors shadow-md disabled:opacity-50"
              >
                {submitting ? 'Đang Khởi Tạo...' : 'Tạo Thiệp & Mở Trình Biên Tập'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function NewInvitationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center text-gray-500">Đang tải...</div>}>
      <NewInvitationContent />
    </Suspense>
  );
}
