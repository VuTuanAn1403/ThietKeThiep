'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Search, Sparkles, Eye, Plus, Heart, ArrowRight, SlidersHorizontal, Check } from 'lucide-react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { TemplateService } from '@/services/template.service';
import { Category, Template } from '@/types/database.types';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { NavAuth } from '@/components/NavAuth';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import Dialog from '@/components/ui/Dialog';
import EmptyState from '@/components/ui/EmptyState';

function RevealItem({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });
  const [mounted, setMounted] = useState(false);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    setMounted(true);
  }, []);

  const prefersReducedMotion = mounted && shouldReduceMotion;

  return (
    <motion.div
      ref={ref}
      initial={false}
      animate={
        mounted && !prefersReducedMotion
          ? isInView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 25 }
          : undefined
      }
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
  const [sortBy, setSortBy] = useState<'newest' | 'featured'>('featured');
  const [loading, setLoading] = useState(true);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const cats = await TemplateService.getCategories();
      let tpls = await TemplateService.getTemplates(selectedCategory, search);

      if (sortBy === 'newest') {
        tpls = [...tpls].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      }
      setCategories(cats);
      setTemplates(tpls);
      setLoading(false);
    }
    load();
  }, [selectedCategory, search, sortBy]);

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-[#1F1B1C]">
      {/* Floating Header */}
      <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="bg-white/85 backdrop-blur-md border border-[#EAE4DF] rounded-full px-6 h-16 flex items-center justify-between shadow-[0_2px_15px_-3px_rgba(31,27,28,0.05)]">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#B76E79] to-[#E85B6A] text-white flex items-center justify-center font-bold text-lg shadow-sm group-hover:scale-105 transition-transform duration-300">
              <Heart className="w-4 h-4 fill-white text-white" />
            </div>
            <span className="tracking-tight text-[#1F1B1C] font-serif font-bold text-xl sm:text-2xl">
              NHÀ CÓ TIỆC
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-muted-foreground">
            <Link href="/" className="hover:text-primary transition-colors">
              Trang chủ
            </Link>
            <Link href="/templates" className="text-primary font-bold">
              Mẫu thiệp
            </Link>
            <Link href="/case-studies" className="hover:text-primary transition-colors">
              Case Studies
            </Link>
            <Link href="/#pricing" className="hover:text-primary transition-colors">
              Bảng giá
            </Link>
            <Link href="/faq" className="hover:text-primary transition-colors">
              FAQ
            </Link>
            <Link href="/dashboard/support" className="hover:text-primary transition-colors">
              Hỗ trợ
            </Link>
          </nav>

          <NavAuth />
        </div>
      </header>

      {/* Gallery Header */}
      <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <Breadcrumbs items={[{ label: 'Thư viện mẫu thiệp' }]} className="mb-4" />
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FAF7F5] border border-[#EAE4DF] text-primary text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Bộ sưu tập mẫu thiệp cao cấp</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-[#1F1B1C] leading-tight">
            Chọn Phong Cách Cho Ngày Trọng Đại
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Khám phá những mẫu thiệp cưới và sự kiện chuẩn Editorial thanh lịch, dễ dàng tùy chỉnh theo câu chuyện riêng của bạn.
          </p>
        </div>

        {/* Search, Sort & Category Controls */}
        <div className="mt-8 max-w-3xl mx-auto space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-muted-foreground">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm kiếm mẫu thiệp, phong cách (Editorial, Minimal, Vintage)..."
                className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#EAE4DF] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-xs text-[#1F1B1C] placeholder:text-gray-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'featured')}
                className="bg-white border border-[#EAE4DF] text-xs font-medium text-[#1F1B1C] rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
              >
                <option value="featured">Nổi bật nhất</option>
                <option value="newest">Mới cập nhật</option>
              </select>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#1F1B1C] text-white shadow-sm'
                  : 'bg-[#FAF7F5] text-[#1F1B1C] border border-[#EAE4DF] hover:bg-white'
              }`}
            >
              Tất Cả Mẫu
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#1F1B1C] text-white shadow-sm'
                    : 'bg-[#FAF7F5] text-[#1F1B1C] border border-[#EAE4DF] hover:bg-white'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Template Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-[#EAE4DF] h-96 p-4 space-y-4 animate-pulse">
                <div className="bg-gray-100 rounded-xl h-64 w-full"></div>
                <div className="bg-gray-100 rounded h-5 w-3/4"></div>
                <div className="bg-gray-100 rounded h-4 w-1/2"></div>
              </div>
            ))}
          </div>
        ) : templates.length === 0 ? (
          <EmptyState
            title="Không tìm thấy mẫu thiệp phù hợp"
            description="Vui lòng thử tìm với từ khóa khác hoặc chuyển sang danh mục khác."
            action={{
              label: 'Xem tất cả mẫu thiệp',
              onClick: () => {
                setSelectedCategory('all');
                setSearch('');
              },
            }}
            className="max-w-md mx-auto my-12"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {templates.map((tpl, idx) => (
              <RevealItem key={tpl.id} delay={idx * 0.05}>
                <Card hoverEffect className="group overflow-hidden flex flex-col h-full">
                  {/* Thumbnail with overlay actions */}
                  <div className="relative aspect-[3/4] w-full bg-[#FAF7F5] overflow-hidden">
                    <Image
                      src={tpl.thumbnail_url}
                      alt={tpl.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <Badge variant="default">
                        {tpl.theme_config?.headingFont || 'Editorial Serif'}
                      </Badge>
                    </div>

                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 gap-2.5 z-10">
                      <div className="flex items-center justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          onClick={() => setPreviewTemplate(tpl)}
                          leftIcon={<Eye className="w-3.5 h-3.5" />}
                        >
                          Xem Nhanh
                        </Button>
                        <Link href={`/dashboard/invitations/new?templateId=${tpl.id}`} className="flex-1">
                          <Button
                            variant="primary"
                            size="sm"
                            className="w-full"
                            leftIcon={<Plus className="w-3.5 h-3.5" />}
                          >
                            Dùng Mẫu
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-lg font-serif font-bold text-[#1F1B1C] group-hover:text-primary transition-colors">
                        {tpl.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span
                          className="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-sm ring-1 ring-gray-200"
                          style={{ backgroundColor: tpl.theme_config?.primaryColor || '#B76E79' }}
                        />
                        <span
                          className="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-sm ring-1 ring-gray-200"
                          style={{ backgroundColor: tpl.theme_config?.secondaryColor || '#8FA79B' }}
                        />
                        <span className="text-[11px] text-muted-foreground ml-1">
                          Tông màu chủ đạo
                        </span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-[#FAF7F5] flex items-center justify-between">
                      <Link
                        href={`/templates/${tpl.slug}`}
                        className="text-xs font-semibold text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                      >
                        <span>Chi tiết mẫu</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                      <Link href={`/dashboard/invitations/new?templateId=${tpl.id}`}>
                        <Button variant="outline" size="sm">
                          Chọn Mẫu Này
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              </RevealItem>
            ))}
          </div>
        )}
      </section>

      {/* Quick Preview Dialog */}
      {previewTemplate && (
        <Dialog
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={previewTemplate.name}
          description="Xem trước phong cách thiết kế và phối màu"
          maxWidth="lg"
        >
          <div className="space-y-5">
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden border border-[#EAE4DF] bg-[#FAF7F5]">
              <Image
                src={previewTemplate.thumbnail_url}
                alt={previewTemplate.name}
                fill
                className="object-cover"
              />
            </div>

            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#FAF7F5] border border-[#EAE4DF] text-xs">
              <div>
                <span className="text-muted-foreground">Font chữ tiêu đề:</span>
                <div className="font-serif font-bold text-sm text-[#1F1B1C] mt-0.5">
                  {previewTemplate.theme_config?.headingFont || 'Cormorant Garamond'}
                </div>
              </div>
              <div>
                <span className="text-muted-foreground">Tông màu chủ đạo:</span>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: previewTemplate.theme_config?.primaryColor || '#B76E79' }}
                  />
                  <span
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: previewTemplate.theme_config?.secondaryColor || '#8FA79B' }}
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href={`/templates/${previewTemplate.slug}`}>
                <Button variant="outline" size="sm">
                  Xem Trang Chi Tiết
                </Button>
              </Link>
              <Link href={`/dashboard/invitations/new?templateId=${previewTemplate.id}`}>
                <Button variant="primary" size="sm" leftIcon={<Check className="w-3.5 h-3.5" />}>
                  Sử Dụng Mẫu Này
                </Button>
              </Link>
            </div>
          </div>
        </Dialog>
      )}

      {/* Footer */}
      <footer className="py-12 bg-[#1F1B1C] text-[#FAF7F5]/70 text-xs border-t border-[#2F292B]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 font-serif font-bold text-white text-lg">
              <Heart className="w-4 h-4 fill-primary text-primary" />
              <span>NHÀ CÓ TIỆC</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-[#FAF7F5]/70">
              <Link href="/" className="hover:text-white transition-colors">
                Trang chủ
              </Link>
              <Link href="/templates" className="text-white font-semibold">
                Mẫu thiệp
              </Link>
              <Link href="/case-studies" className="hover:text-white transition-colors">
                Case Studies
              </Link>
              <Link href="/faq" className="hover:text-white transition-colors">
                FAQ
              </Link>
              <Link href="/privacy" className="hover:text-white transition-colors">
                Bảo mật
              </Link>
            </div>
            <p className="text-[11px] text-[#FAF7F5]/50">
              © 2026 NHÀ CÓ TIỆC. Tất cả quyền được bảo lưu.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
