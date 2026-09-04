'use client';

import React, { useState, useEffect } from 'react';
import { Search, Shield, Lock, Unlock, Users, UserX } from 'lucide-react';
import { AdminService } from '@/services/admin.service';
import { UserProfile } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'ADMIN' | 'USER'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'BLOCKED'>('ALL');
  const [loading, setLoading] = useState<boolean>(true);
  const [toggleTarget, setToggleTarget] = useState<UserProfile | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const loadData = async () => {
    setLoading(true);
    const list = await AdminService.getUsers(search);
    setUsers(list);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search]);

  const confirmToggleStatus = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      await AdminService.toggleUserStatus(toggleTarget.id);
      await loadData();
      setToggleTarget(null);
    } finally {
      setIsToggling(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchStatus = statusFilter === 'ALL' || u.status === statusFilter;
    return matchRole && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div>
        <h1 className="text-xl font-semibold text-admin-text">Quản Lý Người Dùng</h1>
        <p className="text-sm text-admin-muted mt-0.5">Danh sách toàn bộ thành viên và phân quyền trên hệ thống</p>
      </div>

      {/* Search & Filters */}
      <div className="admin-card p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Role pills */}
          <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 text-xs font-semibold">
            {(['ALL', 'USER', 'ADMIN'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  roleFilter === r ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {r === 'ALL' ? 'Tất cả vai trò' : r}
              </button>
            ))}
          </div>

          {/* Status pills */}
          <div className="inline-flex rounded-lg bg-neutral-100 p-0.5 text-xs font-semibold">
            {(['ALL', 'ACTIVE', 'BLOCKED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                  statusFilter === st ? 'bg-white text-neutral-900 shadow-xs font-bold' : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                {st === 'ALL' ? 'Tất cả trạng thái' : st === 'ACTIVE' ? 'Active' : 'Blocked'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-admin-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="admin-input pl-9 text-xs"
            />
          </div>
          <div className="text-xs text-admin-muted shrink-0 font-medium">
            {!loading && <span>{filteredUsers.length} người dùng</span>}
          </div>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="admin-empty py-12">
                      <div className="admin-empty-icon">
                        <UserX className="w-6 h-6" />
                      </div>
                      <h3 className="font-semibold text-admin-text text-sm">Không tìm thấy người dùng</h3>
                      <p className="text-xs text-admin-muted mt-1">Không có kết quả nào khớp với bộ lọc hiện tại.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-admin-hover text-admin-muted font-semibold text-xs flex items-center justify-center flex-shrink-0 overflow-hidden border border-neutral-200">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                          ) : (
                            u.full_name?.charAt(0) || 'U'
                          )}
                        </div>
                        <span className="font-medium text-admin-text text-xs">{u.full_name || '—'}</span>
                      </div>
                    </td>
                    <td className="text-admin-muted font-mono text-xs">{u.email}</td>
                    <td>
                      <Badge variant={u.role === 'ADMIN' ? 'default' : 'neutral'} size="sm">
                        {u.role === 'ADMIN' && <Shield className="w-3 h-3 mr-1 inline" />}
                        {u.role}
                      </Badge>
                    </td>
                    <td>
                      <Badge variant={u.status === 'ACTIVE' ? 'success' : 'danger'} size="sm">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1 inline-block ${u.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                        {u.status === 'ACTIVE' ? 'Active' : 'Blocked'}
                      </Badge>
                    </td>
                    <td className="text-admin-muted text-xs">
                      {new Date(u.created_at).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="text-right">
                      <button
                        onClick={() => setToggleTarget(u)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
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

      {/* Accessible ConfirmDialog for status toggle */}
      <ConfirmDialog
        isOpen={Boolean(toggleTarget)}
        onClose={() => setToggleTarget(null)}
        onConfirm={confirmToggleStatus}
        title={toggleTarget?.status === 'ACTIVE' ? 'Khóa tài khoản người dùng' : 'Mở khóa tài khoản'}
        message={
          toggleTarget?.status === 'ACTIVE'
            ? `Bạn có chắc chắn muốn khóa tài khoản "${toggleTarget?.full_name || toggleTarget?.email}"? Người dùng này sẽ không thể đăng nhập hoặc chỉnh sửa thiệp.`
            : `Bạn có chắc chắn muốn mở khóa tài khoản "${toggleTarget?.full_name || toggleTarget?.email}"?`
        }
        confirmText={toggleTarget?.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa'}
        cancelText="Hủy bỏ"
        isDestructive={toggleTarget?.status === 'ACTIVE'}
        isLoading={isToggling}
      />
    </div>
  );
}
