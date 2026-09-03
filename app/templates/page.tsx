'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles, Eye, Plus, Heart, ArrowRight } from 'lucide-react';
import { motion, useInView } from 'framer-motion';
import { TemplateService } from '@/services/template.service';
import { Category, Template } from '@/types/database.types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NavAuth } from '@/components/NavAuth';

function RevealItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30, scale: 0.97 }}
      animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

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
    <div className="min-h-screen bg-[#FFFDFB] text-[#1F1B1C]">
      {/* Floating Glass Header Navigation */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="glass-header rounded-full px-6 h-16 flex items-center justify-between shadow-soft">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E85B6A] to-[#F27B88] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-110 transition-transform duration-300">
              <Heart className="w-4.5 h-4.5 fill-white text-white" />
            </div>
            <span className="tracking-tight text-[#1F1B1C] font-serif font-bold text-xl sm:text-2xl">
              NHÀ CÓ TIỆC
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-[#756B70]">
            <Link href="/" className="hover:text-[#E85B6A] transition-colors">Trang chủ</Link>
            <Link href="/templates" className="text-[#E85B6A] font-bold">Mẫu thiệp</Link>
            <Link href="/case-studies" className="hover:text-[#E85B6A] transition-colors">Case Studies</Link>
            <Link href="/#pricing" className="hover:text-[#E85B6A] transition-colors">Bảng giá</Link>
            <Link href="/faq" className="hover:text-[#E85B6A] transition-colors">FAQ</Link>
            <Link href="/dashboard/support" className="hover:text-[#E85B6A] transition-colors">Hỗ trợ</Link>
          </nav>

          <NavAuth />
        </div>
      </header>

      {/* Hero Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'Thư viện mẫu thiệp' }]} className="mb-4" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-3xl mx-auto space-y-3"
        >
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FAF7F5] border border-[#EAE4DF] text-[#E85B6A] text-xs font-semibold tracking-wide uppercase shadow-soft">
            <Sparkles className="w-3.5 h-3.5 text-[#E85B6A]" />
            BỘ SƯU TẬP MẪU THIỆP CAO CẤP
          </span>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-[#1F1B1C] leading-tight">
            Chọn Phong Cách Thiệp Cho Bữa Tiệc Của Bạn
          </h1>
          <p className="text-sm sm:text-base text-[#756B70] leading-relaxed">
            Khám phá những mẫu thiệp cưới và sự kiện chuẩn Editorial lãng mạn, tinh tế, dễ dàng tùy chỉnh theo câu chuyện riêng của bạn.
          </p>
        </motion.div>

        {/* Search & Filter */}
        <div className="mt-8 max-w-xl mx-auto relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#756B70]">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm tên mẫu thiệp, phong cách..."
            className="w-full pl-11 pr-4 py-3 bg-white border border-[#EAE4DF] rounded-full shadow-soft focus:outline-none focus:ring-2 focus:ring-[#E85B6A] text-xs text-[#1F1B1C] placeholder-[#756B70]"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="mt-6 flex items-center justify-center flex-wrap gap-2.5">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
              selectedCategory === 'all'
                ? 'btn-3d-primary text-white shadow-sm'
                : 'btn-3d-secondary text-[#1F1B1C]'
            }`}
          >
            Tất Cả Mẫu
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-5 py-2 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'btn-3d-primary text-white shadow-sm'
                  : 'btn-3d-secondary text-[#1F1B1C]'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </section>

      {/* Template Grid with 3D Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="admin-card rounded-3xl h-96 p-4 space-y-4">
                <div className="skeleton-pulse h-64 w-full"></div>
                <div className="skeleton-pulse h-6 w-3/4"></div>
                <div className="skeleton-pulse h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20 depth-card bg-white rounded-3xl max-w-lg mx-auto p-8 space-y-3 border border-[#EAE4DF]">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#E85B6A] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-bold text-lg text-[#1F1B1C]">Không tìm thấy mẫu phù hợp</h3>
            <p className="text-xs text-[#756B70]">Vui lòng thử tìm với từ khóa khác hoặc chọn danh mục khác.</p>
            <button
              onClick={() => { setSelectedCategory('all'); setSearch(''); }}
              className="mt-2 px-4 py-2 rounded-full btn-3d-secondary text-xs font-semibold"
            >
              Xem tất cả mẫu thiệp
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((tpl, idx) => (
              <RevealItem key={tpl.id} delay={idx * 0.06}>
                <div
                  className="group depth-card-tilt bg-white rounded-3xl overflow-hidden border border-[#EAE4DF] flex flex-col"
                >
                  <div className="relative aspect-[3/4] w-full bg-[#FAF7F5] overflow-hidden">
                    <Image
                      src={tpl.thumbnail_url}
                      alt={tpl.name}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 gap-2.5">
                      <div className="flex items-center justify-center gap-2.5">
                        <Link
                          href={`/templates/${tpl.slug}`}
                          className="flex-1 py-2.5 rounded-full btn-3d-secondary text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> Xem Mẫu
                        </Link>
                        <Link
                          href={`/dashboard/invitations/new?templateId=${tpl.id}`}
                          className="flex-1 py-2.5 rounded-full btn-3d-primary text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm"
                        >
                          <Plus className="w-3.5 h-3.5" /> Dùng Mẫu Này
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#1F1B1C] group-hover:text-[#E85B6A] transition-colors">
                        {tpl.name}
                      </h3>
                      <div className="mt-2.5 flex items-center gap-2">
                        <span className="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-sm ring-1 ring-gray-200" style={{ backgroundColor: tpl.theme_config.primaryColor || '#E85B6A' }}></span>
                        <span className="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-sm ring-1 ring-gray-200" style={{ backgroundColor: tpl.theme_config.secondaryColor || '#8FA79B' }}></span>
                        <span className="text-[11px] text-[#756B70] font-medium ml-1.5">{tpl.theme_config.headingFont || 'Cormorant Garamond'}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#FAF7F5] flex items-center justify-between">
                      <Link
                        href={`/templates/${tpl.slug}`}
                        className="text-xs font-semibold text-[#756B70] hover:text-[#E85B6A] transition-colors flex items-center gap-1"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link
                        href={`/dashboard/invitations/new?templateId=${tpl.id}`}
                        className="px-4 py-1.5 rounded-full btn-3d-secondary text-[#1F1B1C] text-xs font-semibold hover:text-[#E85B6A]"
                      >
                        Chọn Mẫu
                      </Link>
                    </div>
                  </div>
                </div>
              </RevealItem>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="py-12 bg-[#1F1B1C] text-[#FAF7F5]/70 text-xs border-t border-[#2F292B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-serif font-bold text-white text-lg">
              <Heart className="w-4 h-4 fill-[#E85B6A] text-[#E85B6A]" />
              <span>NHÀ CÓ TIỆC</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-[#FAF7F5]/70">
              <Link href="/" className="hover:text-white transition-colors">Trang chủ</Link>
              <Link href="/templates" className="text-white font-semibold">Mẫu thiệp</Link>
              <Link href="/case-studies" className="hover:text-white transition-colors">Case Studies</Link>
              <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Bảo mật</Link>
            </div>
            <p className="text-[11px] text-[#FAF7F5]/50">© 2026 NHÀ CÓ TIỆC. Tất cả quyền được bảo lưu.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
