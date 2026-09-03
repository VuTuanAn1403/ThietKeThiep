'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { Heart, ArrowLeft, Check, Plus, Palette, Type } from 'lucide-react';
import { TemplateService } from '@/services/template.service';
import { Template } from '@/types/database.types';
import { Breadcrumbs } from '@/components/Breadcrumbs';

export default function TemplateDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (slug) {
        setLoading(true);
        const tpl = await TemplateService.getTemplateBySlug(slug);
        setTemplate(tpl);
        setLoading(false);
      }
    }
    load();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex items-center justify-center">
        <p className="text-gray-500">Đang tải thông tin mẫu thiệp...</p>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="min-h-screen bg-[#FFFDF9] flex flex-col items-center justify-center px-4">
        <h1 className="text-2xl font-serif font-bold text-[#292624]">Không tìm thấy mẫu thiệp</h1>
        <Link href="/templates" className="mt-4 text-sm font-medium text-[#B76E79] hover:underline flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách mẫu
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      <header className="bg-white border-b border-[#E8DFD8] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/templates" className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-[#B76E79] transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Trở về Danh mục Mẫu
          </Link>
          <div className="flex items-center gap-2 text-xl font-serif font-bold text-[#B76E79]">
            <Heart className="w-5 h-5 fill-[#B76E79]" />
            <span>{template.name}</span>
          </div>
          <Link
            href={`/dashboard/invitations/new?templateId=${template.id}`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-white bg-[#B76E79] hover:bg-[#a25b66] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Tạo Thiệp Mẫu Này
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs
          items={[
            { label: 'Thư viện mẫu', href: '/templates' },
            { label: template.name },
          ]}
          className="mb-6"
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-8">
          <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden p-3 shadow-sm">
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={template.preview_url || template.thumbnail_url}
                alt={template.name}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E8DFD8] shadow-sm">
            <h1 className="text-3xl font-serif font-bold text-[#292624]">{template.name}</h1>
            <p className="mt-2 text-sm text-gray-600">
              Mẫu thiết kế cao cấp, được tối ưu cho cả giao diện di động và máy tính. Hỗ trợ tùy chỉnh toàn bộ thông tin sự kiện, màu sắc, font chữ và section.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F4EFEB] flex items-center justify-center text-[#B76E79]">
                  <Palette className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Bảng màu chủ đạo</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: template.theme_config.primaryColor }}></span>
                    <span className="w-4 h-4 rounded-full border border-gray-200" style={{ backgroundColor: template.theme_config.secondaryColor }}></span>
                    <span className="text-xs font-mono text-gray-700">{template.theme_config.primaryColor}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F4EFEB] flex items-center justify-center text-[#B76E79]">
                  <Type className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-medium">Font chữ tiêu đề & nội dung</div>
                  <div className="text-sm font-serif font-semibold text-[#292624] mt-0.5">
                    {template.theme_config.headingFont} + {template.theme_config.bodyFont}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-[#E8DFD8]">
              <h3 className="text-sm font-semibold text-[#292624] mb-3">Các section đi kèm:</h3>
              <ul className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                {template.default_sections.map((sec, idx) => (
                  <li key={idx} className="flex items-center gap-1.5">
                    <Check className="w-3.5 h-3.5 text-[#8FA79B]" />
                    <span>{sec.section_type}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-8">
              <Link
                href={`/dashboard/invitations/new?templateId=${template.id}`}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium text-white bg-[#B76E79] hover:bg-[#a25b66] transition-colors shadow-sm"
              >
                <Plus className="w-4 h-4" />
                Sử Dụng Mẫu Thiệp Này
              </Link>
            </div>
          </div>
        </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 bg-white border-t border-[#E8DFD8] text-center text-xs text-gray-500 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-serif font-bold text-[#B76E79] text-lg">
            <span>NHÀ CÓ TIỆC</span>
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <Link href="/" className="hover:text-[#B76E79]">Trang chủ</Link>
            <Link href="/templates" className="hover:text-[#B76E79]">Mẫu thiệp</Link>
            <Link href="/case-studies" className="hover:text-[#B76E79]">Case Studies</Link>
            <Link href="/faq" className="hover:text-[#B76E79]">FAQ</Link>
            <Link href="/privacy" className="hover:text-[#B76E79]">Bảo mật</Link>
          </div>
          <p>© 2026 NHÀ CÓ TIỆC. Tất cả quyền được bảo lưu.</p>
        </div>
      </footer>
    </div>
  );
}
