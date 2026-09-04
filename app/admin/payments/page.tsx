'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  CheckCircle,
  XCircle,
  RefreshCw,
  Search,
  Check,
  X,
  Loader2,
  Clock,
} from 'lucide-react';
import { PaymentOrder } from '@/types/database.types';
import { Badge } from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import Dialog from '@/components/ui/Dialog';
import Button from '@/components/ui/Button';

export default function AdminPaymentManagementPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialog states
  const [approveTarget, setApproveTarget] = useState<PaymentOrder | null>(null);
  const [rejectTarget, setRejectTarget] = useState<PaymentOrder | null>(null);
  const [rejectReason, setRejectReason] = useState('Không nhận được chuyển khoản tương ứng');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  const handleConfirmApprove = async () => {
    if (!approveTarget) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/v1/admin/payments/${approveTarget.id}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        await fetchOrders();
        setApproveTarget(null);
      } else {
        setErrorMessage(data.error || 'Lỗi duyệt thanh toán');
      }
    } catch {
      setErrorMessage('Lỗi kết nối khi duyệt thanh toán');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmReject = async () => {
    if (!rejectTarget) return;
    setActionLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch(`/api/v1/admin/payments/${rejectTarget.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();
      if (res.ok) {
        await fetchOrders();
        setRejectTarget(null);
      } else {
        setErrorMessage(data.error || 'Lỗi từ chối thanh toán');
      }
    } catch {
      setErrorMessage('Lỗi kết nối khi từ chối thanh toán');
    } finally {
      setActionLoading(false);
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

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <Badge variant="success" size="sm">PAID (ĐÃ DUYỆT)</Badge>;
      case 'WAITING_CONFIRMATION':
        return <Badge variant="warning" size="sm">CHỜ DUYỆT</Badge>;
      case 'FAILED':
        return <Badge variant="danger" size="sm">FAILED</Badge>;
      case 'EXPIRED':
        return <Badge variant="neutral" size="sm">EXPIRED</Badge>;
      default:
        return <Badge variant="info" size="sm">PENDING</Badge>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-admin-text flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-admin-accent" /> Quản Lý Đơn Hàng & Thanh Toán
          </h1>
          <p className="text-xs sm:text-sm text-admin-muted mt-0.5">
            Đối soát giao dịch chuyển khoản VietQR, phê duyệt đơn hàng và kích hoạt gói cước dịch vụ
          </p>
        </div>

        <button
          onClick={fetchOrders}
          disabled={loading}
          className="admin-btn-secondary px-3.5 py-1.5 text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      {errorMessage && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center justify-between">
          <span>{errorMessage}</span>
          <button onClick={() => setErrorMessage(null)} className="font-bold text-rose-500 hover:text-rose-700">
            ×
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="admin-card p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
          {['ALL', 'WAITING_CONFIRMATION', 'PAID', 'PENDING', 'FAILED', 'EXPIRED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors cursor-pointer whitespace-nowrap text-xs ${
                filterStatus === st
                  ? 'bg-admin-accent text-white shadow-xs'
                  : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
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

        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-admin-muted" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo mã đơn, user ID..."
              className="admin-input pl-9 text-xs"
            />
          </div>
          <span className="text-xs text-admin-muted shrink-0 font-medium">
            {!loading && `${filteredOrders.length} đơn`}
          </span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã Giao Dịch</th>
                <th>Khách Hàng (User ID)</th>
                <th>Gói Cước</th>
                <th>Số Tiền</th>
                <th>Trạng Thái</th>
                <th>Ngày Tạo</th>
                <th className="text-right">Thao Tác Quản Trị</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-admin-muted text-xs">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-admin-accent" />
                    Đang tải danh sách đơn hàng...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-admin-muted text-xs">
                    Không có đơn hàng nào khớp với điều kiện tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="font-mono font-bold text-neutral-900 text-xs whitespace-nowrap">
                      #{o.order_code}
                    </td>
                    <td className="text-admin-muted font-mono text-[11px] whitespace-nowrap">
                      {o.user_id}
                    </td>
                    <td className="font-medium text-neutral-800 text-xs whitespace-nowrap">
                      {o.subscription_plan_id === 'plan-premium'
                        ? 'Premium Plan'
                        : o.subscription_plan_id === 'plan-basic'
                        ? 'Basic Plan'
                        : 'Free Plan'}
                    </td>
                    <td className="font-bold text-admin-accent text-xs whitespace-nowrap">
                      {o.final_amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="whitespace-nowrap">
                      {renderStatusBadge(o.status)}
                    </td>
                    <td className="text-admin-muted font-mono text-[11px] whitespace-nowrap">
                      {new Date(o.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="text-right whitespace-nowrap">
                      {o.status === 'WAITING_CONFIRMATION' || o.status === 'PENDING' ? (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setApproveTarget(o)}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" /> Duyệt
                          </button>

                          <button
                            onClick={() => {
                              setRejectTarget(o);
                              setRejectReason('Không nhận được chuyển khoản tương ứng');
                            }}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-semibold text-xs flex items-center gap-1 transition-colors border border-rose-200 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" /> Từ chối
                          </button>
                        </div>
                      ) : o.status === 'PAID' ? (
                        <span className="text-emerald-600 text-[11px] font-semibold flex items-center justify-end gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Đã hoàn tất
                        </span>
                      ) : (
                        <span className="text-admin-muted text-[11px] italic">
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

      {/* Accessible ConfirmDialog for Approval */}
      <ConfirmDialog
        isOpen={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        onConfirm={handleConfirmApprove}
        title="Duyệt thanh toán đơn hàng"
        message={`Xác nhận đã nhận chuyển khoản hợp lệ cho đơn #${approveTarget?.order_code} (${approveTarget?.final_amount.toLocaleString('vi-VN')} đ)? Hệ thống sẽ ngay lập tức kích hoạt gói dịch vụ cho người dùng.`}
        confirmText="Xác nhận duyệt"
        cancelText="Hủy bỏ"
        isDestructive={false}
        isLoading={actionLoading}
      />

      {/* Modal for Rejection with Reason */}
      <Dialog
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Từ chối đơn thanh toán"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <p className="text-neutral-600">
            Bạn đang từ chối đơn hàng <span className="font-mono font-bold text-neutral-900">#{rejectTarget?.order_code}</span>. Vui lòng nhập lý do từ chối:
          </p>
          <div>
            <label className="block text-neutral-700 font-medium mb-1">Lý do từ chối:</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="admin-input w-full p-2.5 resize-none text-xs"
              placeholder="Nhập lý do gửi đến người dùng..."
            />
          </div>
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRejectTarget(null)}
              disabled={actionLoading}
            >
              Hủy
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReject}
              isLoading={actionLoading}
            >
              Xác nhận từ chối
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
