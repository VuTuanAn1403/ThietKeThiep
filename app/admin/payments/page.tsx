'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  RefreshCw,
  Search,
  Shield,
  Filter,
  Check,
  X,
  Loader2,
} from 'lucide-react';
import { PaymentOrder } from '@/types/database.types';

export default function AdminPaymentManagementPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/payments');
      const data = await res.json();
      if (res.ok && data.data) {
        setOrders(data.data);
      }
    } catch {
      console.error('Failed to fetch admin payment orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleApprove = async (orderId: string) => {
    if (!confirm('Xác nhận đã nhận được tiền và kích hoạt gói dịch vụ cho khách hàng?')) return;
    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/v1/admin/payments/${orderId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        await fetchOrders();
      } else {
        alert(data.error || 'Lỗi duyệt thanh toán');
      }
    } catch {
      alert('Lỗi kết nối khi duyệt thanh toán');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderId: string) => {
    const reason = prompt('Nhập lý do từ chối (hoặc để trống):', 'Không nhận được chuyển khoản tương ứng');
    if (reason === null) return;

    setActionLoading(orderId);
    try {
      const res = await fetch(`/api/v1/admin/payments/${orderId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchOrders();
      } else {
        alert(data.error || 'Lỗi từ chối thanh toán');
      }
    } catch {
      alert('Lỗi kết nối khi từ chối thanh toán');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const matchesFilter = filterStatus === 'ALL' || o.status === filterStatus;
    const matchesSearch =
      o.order_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.transfer_content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-[11px] font-bold">
            PAID
          </span>
        );
      case 'WAITING_CONFIRMATION':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-bold animate-pulse">
            CHỜ DUYỆT
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-950 text-rose-300 border border-rose-800 text-[11px] font-bold">
            FAILED
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-gray-800 text-gray-400 border border-gray-700 text-[11px]">
            EXPIRED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[11px]">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="p-6 sm:p-8 space-y-6 max-w-7xl mx-auto text-gray-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#2F3531] pb-6">
        <div>
          <h1 className="text-2xl font-serif font-bold text-white flex items-center gap-2.5">
            <CreditCard className="w-6 h-6 text-[#B76E79]" /> Quản Lý Đơn Hàng & Thanh Toán
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Đối soát giao dịch chuyển khoản QR, duyệt thanh toán và kích hoạt gói cước cho thành viên.
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[#2A302D] hover:bg-[#343B37] text-white text-xs font-semibold flex items-center gap-2 transition-colors border border-[#3A403C] cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-gray-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Tìm theo mã đơn, user ID..."
            className="w-full pl-10 pr-4 py-2 bg-[#212623] border border-[#2F3531] rounded-xl text-white focus:outline-none focus:border-[#B76E79]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
          {['ALL', 'WAITING_CONFIRMATION', 'PAID', 'PENDING', 'FAILED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                filterStatus === st
                  ? 'bg-[#B76E79] text-white border-[#B76E79]'
                  : 'bg-[#212623] text-gray-400 border-[#2F3531] hover:text-white'
              }`}
            >
              {st === 'ALL'
                ? 'Tất cả'
                : st === 'WAITING_CONFIRMATION'
                ? 'Chờ duyệt'
                : st === 'PAID'
                ? 'Đã duyệt'
                : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#212623] rounded-2xl border border-[#2F3531] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-300">
            <thead className="bg-[#1A1E1C] text-gray-400 font-semibold border-b border-[#2F3531]">
              <tr>
                <th className="px-6 py-3.5">Mã Giao Dịch</th>
                <th className="px-6 py-3.5">Khách Hàng (User ID)</th>
                <th className="px-6 py-3.5">Gói Cước</th>
                <th className="px-6 py-3.5">Số Tiền</th>
                <th className="px-6 py-3.5">Trạng Thái</th>
                <th className="px-6 py-3.5">Ngày Tạo</th>
                <th className="px-6 py-3.5 text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2A302D]">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#B76E79]" />
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không có đơn hàng thanh toán nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-[#262C29] transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-white whitespace-nowrap">
                      #{o.order_code}
                    </td>
                    <td className="px-6 py-4 text-gray-300 font-mono text-[11px] whitespace-nowrap">
                      {o.user_id}
                    </td>
                    <td className="px-6 py-4 font-medium text-white whitespace-nowrap">
                      {o.subscription_plan_id === 'plan-premium'
                        ? 'Premium Plan'
                        : o.subscription_plan_id === 'plan-basic'
                        ? 'Basic Plan'
                        : 'Free Plan'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#B76E79] whitespace-nowrap">
                      {o.final_amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 font-mono text-[11px] whitespace-nowrap">
                      {new Date(o.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {o.status === 'WAITING_CONFIRMATION' || o.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleApprove(o.id)}
                            disabled={actionLoading === o.id}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-50"
                          >
                            {actionLoading === o.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Check className="w-3.5 h-3.5" />
                            )}
                            Xác nhận
                          </button>

                          <button
                            onClick={() => handleReject(o.id)}
                            disabled={actionLoading === o.id}
                            className="px-3 py-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-900 text-rose-300 font-semibold text-xs flex items-center gap-1 transition-colors border border-rose-800 cursor-pointer disabled:opacity-50"
                          >
                            <X className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      ) : o.status === 'PAID' ? (
                        <span className="text-emerald-400 text-[11px] font-semibold flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã duyệt thành công
                        </span>
                      ) : (
                        <span className="text-gray-500 text-[11px] italic">
                          Không có thao tác
                        </span>
                      )}
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
