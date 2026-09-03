'use client';

import React, { useState, useEffect } from 'react';
import { History, Shield, RefreshCw, Filter, Clock, Activity, CheckCircle, Tag } from 'lucide-react';
import { AuditLog } from '@/types/database.types';
import { AuditService } from '@/services/audit.service';

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
      return <span className="px-2.5 py-1 rounded-full bg-blue-900/40 text-blue-300 border border-blue-700/50 text-[10px] font-bold">LOGIN</span>;
    }
    if (action.includes('CREATE') || action.includes('PUBLISH')) {
      return <span className="px-2.5 py-1 rounded-full bg-emerald-900/40 text-emerald-300 border border-emerald-700/50 text-[10px] font-bold">{action}</span>;
    }
    if (action.includes('DELETE') || action.includes('DISABLE')) {
      return <span className="px-2.5 py-1 rounded-full bg-rose-900/40 text-rose-300 border border-rose-700/50 text-[10px] font-bold">{action}</span>;
    }
    return <span className="px-2.5 py-1 rounded-full bg-amber-900/40 text-amber-300 border border-amber-700/50 text-[10px] font-bold">{action}</span>;
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2F3531] pb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
            <History className="w-6 h-6 text-[#B76E79]" /> Nhật Ký Hoạt Động Hệ Thống (Audit Logs)
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Ghi nhận toàn bộ các thao tác quản trị viên và sự kiện bảo mật quan trọng.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#2A302D] hover:bg-[#343B37] text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-[#3A403C] cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-[#212623] rounded-2xl border border-[#2F3531] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1A1E1C] text-gray-400 font-semibold border-b border-[#2F3531]">
              <tr>
                <th className="px-6 py-3.5">Thời Gian</th>
                <th className="px-6 py-3.5">Người Thực Hiện</th>
                <th className="px-6 py-3.5">Hành Động</th>
                <th className="px-6 py-3.5">Loại Tài Nguyên</th>
                <th className="px-6 py-3.5">Resource ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A302D]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#B76E79]" />
                    Đang tải danh sách nhật ký...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    Chưa có hoạt động quản trị nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#262C29] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        {new Date(log.created_at).toLocaleString('vi-VN')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 font-medium text-white">
                        <Shield className="w-3.5 h-3.5 text-[#B76E79]" />
                        <span>{log.user_id}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded-md bg-[#2A302D] text-gray-300 font-mono text-[10px]">
                        {log.resource_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400 font-mono text-[11px]">
                      {log.resource_id || '—'}
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
