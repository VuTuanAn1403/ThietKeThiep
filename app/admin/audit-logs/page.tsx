'use client';

import React, { useState, useEffect } from 'react';
import { History, Shield, RefreshCw, Clock, ShieldCheck, Lock } from 'lucide-react';
import { AuditLog } from '@/types/database.types';
import { AuditService } from '@/services/audit.service';
import { Badge } from '@/components/ui/Badge';

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await AuditService.getLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getActionBadge = (action: string) => {
    if (action.includes('LOGIN')) {
      return <Badge variant="info" size="sm">LOGIN</Badge>;
    }
    if (action.includes('CREATE') || action.includes('PUBLISH') || action.includes('APPROVE')) {
      return <Badge variant="success" size="sm">{action}</Badge>;
    }
    if (action.includes('DELETE') || action.includes('DISABLE') || action.includes('REJECT') || action.includes('BLOCK')) {
      return <Badge variant="danger" size="sm">{action}</Badge>;
    }
    return <Badge variant="warning" size="sm">{action}</Badge>;
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-bold mb-1 border border-neutral-200">
            <Lock className="w-3 h-3 text-neutral-500" /> Append-only Ledger
          </div>
          <h1 className="text-xl font-semibold text-admin-text flex items-center gap-2">
            <History className="w-5 h-5 text-admin-accent" /> Nhật Ký Hoạt Động Hệ Thống (Audit Logs)
          </h1>
          <p className="text-xs sm:text-sm text-admin-muted mt-0.5">
            Ghi nhận toàn bộ thao tác quản trị viên và sự kiện bảo mật quan trọng, không thể bị sửa đổi hay xóa bỏ
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="admin-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Logs Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Thời Gian</th>
                <th>Người Thực Hiện</th>
                <th>Hành Động</th>
                <th>Loại Tài Nguyên</th>
                <th>Resource ID</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-admin-muted text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-admin-accent" />
                    Đang tải nhật ký bảo mật...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-admin-muted text-xs">
                    Chưa có hoạt động quản trị nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="whitespace-nowrap text-admin-muted font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium text-neutral-800 text-xs">
                        <Shield className="w-3.5 h-3.5 text-admin-accent" />
                        <span>{log.user_id}</span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="whitespace-nowrap text-neutral-700 text-xs font-medium">
                      {log.resource_type}
                    </td>
                    <td className="whitespace-nowrap font-mono text-[11px] text-admin-muted">
                      {log.resource_id}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
