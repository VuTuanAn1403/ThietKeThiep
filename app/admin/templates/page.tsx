'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle, EyeOff } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { Template } from '@/types/database.types';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const list = await AdminService.getTemplates();
    setTemplates(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggle = async (id: string) => {
    await AdminService.toggleTemplateStatus(id);
    loadData();
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-600 hover:text-purple-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#292624]">Quản Lý Mẫu Thiệp Mời</h1>
            <p className="text-xs text-gray-500">Quản lý kho giao diện mẫu hiển thị cho người dùng</p>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="relative h-44 bg-gray-100">
                <img src={tpl.thumbnail_url} alt={tpl.name} className="w-full h-full object-cover" />
                <span
                  className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${
                    tpl.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {tpl.is_active ? 'Active' : 'Hidden'}
                </span>
              </div>
              <div className="p-4 space-y-2 text-xs">
                <h3 className="font-serif font-bold text-base text-[#292624]">{tpl.name}</h3>
                <p className="text-gray-500 font-mono text-[11px]">slug: {tpl.slug}</p>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: tpl.theme_config.primaryColor }}></span>
                  <span className="w-3.5 h-3.5 rounded-full border border-gray-200" style={{ backgroundColor: tpl.theme_config.secondaryColor }}></span>
                  <span className="text-gray-600 font-medium">{tpl.theme_config.headingFont}</span>
                </div>
              </div>
              <div className="p-4 border-t border-[#E8DFD8] bg-[#FFFDF9] flex justify-end">
                <button
                  onClick={() => handleToggle(tpl.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition-colors ${
                    tpl.is_active
                      ? 'bg-rose-50 text-rose-700 border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  }`}
                >
                  {tpl.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                  {tpl.is_active ? 'Ẩn Mẫu Này' : 'Kích Hoạt'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
