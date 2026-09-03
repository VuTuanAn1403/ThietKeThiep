'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Search, Shield, Lock, Unlock } from 'lucide-react';
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
    <div className="min-h-screen bg-[#FFFDF9] py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="text-gray-600 hover:text-purple-700">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#292624]">Quản Lý Người Dùng</h1>
            <p className="text-xs text-gray-500">Danh sách toàn bộ thành viên trên hệ thống</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-[#E8DFD8] shadow-sm flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc email..."
              className="w-full pl-9 pr-3 py-2 bg-[#FFFDF9] border border-[#E8DFD8] rounded-xl text-xs focus:ring-2 focus:ring-purple-600 focus:outline-none"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-[#E8DFD8] overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FFFDF9] border-b border-[#E8DFD8] text-gray-500 font-semibold uppercase">
                <tr>
                  <th className="py-3.5 px-4">Người Dùng</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Quyền Hạn</th>
                  <th className="py-3.5 px-4">Trạng Thái</th>
                  <th className="py-3.5 px-4">Ngày Tham Gia</th>
                  <th className="py-3.5 px-4 text-right">Hành Động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DFD8]">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-400">
                      Đang tải danh sách người dùng...
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} className="hover:bg-[#FFFDF9]/60 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#292624] flex items-center gap-3">
                        <img src={u.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} alt="Avatar" className="w-8 h-8 rounded-full object-cover" />
                        <span>{u.full_name || '—'}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-600">{u.email}</td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-gray-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u.id)}
                          className={`px-3 py-1 rounded-xl text-xs font-semibold flex items-center gap-1 border ml-auto transition-colors ${
                            u.status === 'ACTIVE'
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          }`}
                        >
                          {u.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                          {u.status === 'ACTIVE' ? 'Khóa TK' : 'Mở Khóa'}
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
    </div>
  );
}
