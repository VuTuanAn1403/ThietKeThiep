'use client';

import React, { useState, useEffect } from 'react';
import { Search, Shield, Lock, Unlock, Users, UserX } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { UserProfile } from '@/types/database.types';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    setLoading(true);
    const list = await AdminService.getUsers(search);
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const handleToggleStatus = async (id: string) => {
    await AdminService.toggleUserStatus(id);
    loadData();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-admin-text">Quản Lý Người Dùng</h1>
        <p className="text-sm text-admin-muted mt-0.5">Danh sách toàn bộ thành viên trên hệ thống</p>
      </div>

      {/* Search & Filters */}
      <div className="admin-card p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên hoặc email..."
            className="admin-input pl-9"
          />
        </div>
        <div className="text-xs text-admin-muted">
          {!loading && <span>{users.length} người dùng</span>}
        </div>
      </div>

      {/* Users Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Người Dùng</th>
                <th>Email</th>
                <th>Quyền Hạn</th>
                <th>Trạng Thái</th>
                <th>Ngày Tham Gia</th>
                <th className="text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td><div className="flex items-center gap-3"><div className="admin-skeleton w-8 h-8 rounded-full" /><div className="admin-skeleton h-4 w-24" /></div></td>
                    <td><div className="admin-skeleton h-4 w-32" /></td>
                    <td><div className="admin-skeleton h-5 w-16 rounded-full" /></td>
                    <td><div className="admin-skeleton h-5 w-16 rounded-full" /></td>
                    <td><div className="admin-skeleton h-4 w-20" /></td>
                    <td><div className="admin-skeleton h-7 w-20 ml-auto rounded-lg" /></td>
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty py-12">
                      <div className="admin-empty-icon">
                        <UserX className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-admin-text text-sm">Chưa có người dùng</h3>
                      <p className="text-xs text-admin-muted mt-1">Người dùng mới sẽ xuất hiện tại đây.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-admin-hover text-admin-muted font-semibold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            u.full_name?.charAt(0) || 'U'
                          )}
                        </div>
                        <span className="font-medium text-admin-text">{u.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="text-admin-muted font-mono text-xs">{u.email}</td>
                    <td>
                      <span
                        className={`admin-badge ${
                          u.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-700' : 'admin-badge-inactive'
                        }`}
                      >
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`admin-badge ${
                          u.status === 'ACTIVE' ? 'admin-badge-active' : 'admin-badge-blocked'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.status === 'ACTIVE' ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td className="text-admin-muted text-xs">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          u.status === 'ACTIVE'
                            ? 'admin-btn-danger'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
                        {u.status === 'ACTIVE' ? 'Khóa' : 'Mở Khóa'}
                      </button>
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
