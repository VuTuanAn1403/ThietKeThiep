'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle, EyeOff, LayoutTemplate } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { Template } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function AdminTemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toggleTarget, setToggleTarget] = useState<Template | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const list = await AdminService.getTemplates();
    setTemplates(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const confirmToggle = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      await AdminService.toggleTemplateStatus(toggleTarget.id);
      await loadData();
      setToggleTarget(null);
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-admin-text flex items-center gap-2">
          <LayoutTemplate className="w-5 h-5 text-admin-accent" /> Quản Lý Mẫu Thiệp Cưới
        </h1>
        <p className="text-xs sm:text-sm text-admin-muted mt-0.5">
          Kiểm duyệt kho giao diện mẫu hiển thị trong bộ sưu tập cho người dùng
        </p>
      </div>

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="admin-card overflow-hidden p-0 space-y-4">
              <div className="admin-skeleton h-44 w-full rounded-none" />
              <div className="p-4 space-y-3">
                <div className="admin-skeleton h-5 w-3/4" />
                <div className="admin-skeleton h-4 w-1/2" />
                <div className="admin-skeleton h-8 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="admin-card">
          <div className="admin-empty">
            <div className="admin-empty-icon">
              <LayoutTemplate className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-admin-text text-sm">Chưa có mẫu thiệp</h3>
            <p className="text-xs text-admin-muted mt-1">Các mẫu thiệp mới sẽ xuất hiện tại đây.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates.map((tpl) => (
            <div key={tpl.id} className="admin-card overflow-hidden flex flex-col justify-between p-0 shadow-soft">
              <div className="relative h-44 bg-neutral-100">
                <img src={tpl.thumbnail_url} alt={tpl.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 right-3 shadow-xs">
                  <Badge variant={tpl.is_active ? 'success' : 'neutral'} size="sm">
                    <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${tpl.is_active ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                    {tpl.is_active ? 'Active' : 'Hidden'}
                  </Badge>
                </div>
              </div>
              <div className="p-5 space-y-3">
                <div>
                  <h3 className="font-semibold text-sm text-admin-text">{tpl.name}</h3>
                  <p className="text-admin-muted font-mono text-[11px] mt-0.5">slug: {tpl.slug}</p>
                </div>
                <div className="flex items-center gap-2 text-xs text-admin-muted">
                  <span className="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: tpl.theme_config.primaryColor }}></span>
                  <span className="inline-block w-3.5 h-3.5 rounded-full border border-white shadow-xs" style={{ backgroundColor: tpl.theme_config.secondaryColor }}></span>
                  <span>{tpl.theme_config.headingFont}</span>
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => {
                      if (tpl.is_active) {
                        setToggleTarget(tpl);
                      } else {
                        // Immediately activate without dialog
                        AdminService.toggleTemplateStatus(tpl.id).then(loadData);
                      }
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      tpl.is_active
                        ? 'admin-btn-danger'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    }`}
                  >
                    {tpl.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <CheckCircle className="w-3.5 h-3.5" />}
                    {tpl.is_active ? 'Ẩn khỏi thư viện' : 'Kích hoạt hiển thị'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Accessible ConfirmDialog for hiding template */}
      <ConfirmDialog
        isOpen={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        onConfirm={confirmToggle}
        title="Ẩn mẫu thiệp khỏi thư viện"
        message={`Bạn có chắc muốn ẩn mẫu "${toggleTarget?.name}"? Người dùng mới sẽ không thể nhìn thấy mẫu này khi duyệt thư viện thiệp cưới.`}
        confirmText="Xác nhận ẩn"
        cancelText="Hủy bỏ"
        isDestructive={true}
        isLoading={isToggling}
      />
    </div>
  );
}
