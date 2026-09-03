'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles, Eye, Plus, Heart } from 'lucide-react';
import { TemplateService } from '@/services/template.service';
import { Category, Template } from '@/types/database.types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NavAuth } from '@/components/NavAuth';

export default function TemplatesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const cats = await TemplateService.getCategories();
      const tpls = await TemplateService.getTemplates(selectedCategory, search);
      setCategories(cats);
      setTemplates(tpls);
      setLoading(false);
    }
    load();
  }, [selectedCategory, search]);

  return (
    <div className="min-h-screen bg-[#FFFDF9]">
      {/* Header Bar */}
      <header className="bg-white border-b border-[#E8DFD8] sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-serif font-bold text-[#B76E79]">
            <Heart className="w-6 h-6 fill-[#B76E79]" />
            <span>NHÀ CÓ TIỆC</span>
          </Link>
          <NavAuth />
        </div>
      </header>

      {/* Hero Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'Thư viện mẫu thiệp' }]} className="mb-4" />
        <div className="text-center">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F4EFEB] text-[#B76E79] text-xs font-semibold tracking-wide uppercase mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Thư Viện Mẫu Thiệp Mới Nhất
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#292624]">
            Chọn Mẫu Thiệp Cho Bữa Tiệc Của Bạn
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl mx-auto">
            Khám phá bộ sưu tập mẫu thiệp sang trọng, hiện đại, dễ dàng tùy chỉnh theo phong cách riêng của bạn.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên mẫu thiệp, phong cách..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#E8DFD8] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B76E79] text-sm"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 flex items-center justify-center flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-[#B76E79] text-white shadow-sm'
                : 'bg-white text-[#292624] border border-[#E8DFD8] hover:bg-[#F4EFEB]'
            }`}
          >
            Tất Cả
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#B76E79] text-white shadow-sm'
                  : 'bg-white text-[#292624] border border-[#E8DFD8] hover:bg-[#F4EFEB]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Template Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#E8DFD8] h-80 animate-pulse p-4">
                <div className="bg-gray-200 h-48 rounded-xl w-full mb-4"></div>
                <div className="bg-gray-200 h-6 rounded w-3/4 mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-[#E8DFD8]">
            <p className="text-gray-500">Không tìm thấy mẫu thiệp phù hợp với tìm kiếm của bạn.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((tpl) => (
              <div
                key={tpl.id}
                className="group bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="relative h-64 w-full bg-gray-100 overflow-hidden">
                  <Image
                    src={tpl.thumbnail_url}
                    alt={tpl.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <Link
                      href={`/templates/${tpl.slug}`}
                      className="px-4 py-2 rounded-xl bg-white text-[#292624] text-xs font-semibold flex items-center gap-1.5 shadow"
                    >
                      <Eye className="w-3.5 h-3.5" /> Xem Mẫu
                    </Link>
                    <Link
                      href={`/dashboard/invitations/new?templateId=${tpl.id}`}
                      className="px-4 py-2 rounded-xl bg-[#B76E79] text-white text-xs font-semibold flex items-center gap-1.5 shadow"
                    >
                      <Plus className="w-3.5 h-3.5" /> Dùng Mẫu Này
                    </Link>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-serif font-bold text-[#292624] group-hover:text-[#B76E79] transition-colors">
                      {tpl.name}
                    </h3>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-block w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: tpl.theme_config.primaryColor || '#B76E79' }}></span>
                      <span className="inline-block w-4 h-4 rounded-full border border-white shadow-sm" style={{ backgroundColor: tpl.theme_config.secondaryColor || '#8FA79B' }}></span>
                      <span className="text-xs text-gray-500 font-medium ml-1">{tpl.theme_config.headingFont}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-[#E8DFD8] flex items-center justify-between">
                    <Link
                      href={`/templates/${tpl.slug}`}
                      className="text-xs font-semibold text-gray-500 hover:text-[#B76E79] transition-colors"
                    >
                      Xem chi tiết &rarr;
                    </Link>
                    <Link
                      href={`/dashboard/invitations/new?templateId=${tpl.id}`}
                      className="px-3.5 py-1.5 rounded-lg bg-[#B76E79] text-white text-xs font-medium hover:bg-[#a25b66] transition-colors"
                    >
                      Chọn Mẫu
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

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
