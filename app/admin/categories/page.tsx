'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, Layers } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { Category } from '@/types/database.types';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState<string>('');
  const [slug, setSlug] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const list = await AdminService.getCategories();
    setCategories(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNameChange = (val: string) => {
    setName(val);
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

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    await AdminService.createCategory(name.trim(), slug.trim(), description.trim());
    setName('');
    setSlug('');
    setDescription('');
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa danh mục này?')) {
      await AdminService.deleteCategory(id);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-600 hover:text-purple-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#292624]">Quản Lý Danh Mục Sự Kiện</h1>
            <p className="text-xs text-gray-500">Các chủ đề tiệc chính trên hệ thống</p>
          </div>
        </div>

        {/* Add Category Form */}
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-3xl border border-[#E8DFD8] shadow-sm space-y-4 text-xs">
          <h3 className="text-sm font-serif font-bold text-[#292624] flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" /> Thêm Danh Mục Mới
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Tên danh mục *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Ví dụ: Đám Cưới"
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#292624] mb-1">Slug URL *</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl font-mono focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="block font-semibold text-[#292624] mb-1">Mô tả danh mục</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Mô tả ngắn..."
              className="w-full px-3 py-2 border border-[#E8DFD8] rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-5 py-2 bg-purple-900 text-white rounded-xl font-semibold flex items-center gap-1">
              <Plus className="w-4 h-4" /> Thêm Danh Mục
            </button>
          </div>
        </form>

        {/* Categories List */}
        <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-sm">
          <div className="divide-y divide-[#E8DFD8]">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 flex items-center justify-between hover:bg-[#FFFDF9] transition-colors text-xs">
                <div>
                  <h4 className="font-bold text-sm text-[#292624]">{cat.name}</h4>
                  <span className="font-mono text-gray-400 text-[11px] block mt-0.5">slug: {cat.slug}</span>
                  {cat.description && <p className="text-gray-500 mt-1">{cat.description}</p>}
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
