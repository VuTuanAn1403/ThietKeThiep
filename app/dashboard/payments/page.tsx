'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { PaymentOrder } from '@/types/database.types';

export default function UserPaymentHistoryPage() {
  const [orders, setOrders] = useState<PaymentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/payments/orders');
      const data = await res.json();
      if (res.ok && data.data) {
        setOrders(data.data);
      }
    } catch {
      console.error('Failed to fetch payment orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return (
          <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" /> Đã thanh toán
          </span>
        );
      case 'WAITING_CONFIRMATION':
        return (
          <span className="px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-bold flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" /> Chờ xác nhận
          </span>
        );
      case 'FAILED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold flex items-center gap-1 w-fit">
            <AlertCircle className="w-3.5 h-3.5" /> Thất bại / Từ chối
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200 text-[11px] font-medium flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" /> Hết hạn
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-[11px] font-bold flex items-center gap-1 w-fit">
            <Clock className="w-3.5 h-3.5" /> Chờ thanh toán
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-[#e85d75]" /> Lịch Sử Thanh Toán
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi tất cả đơn hàng, giao dịch nâng cấp gói cước và trạng thái đối soát.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/subscription"
            className="px-4 py-2 rounded-xl bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <PlusCircle className="w-4 h-4" /> Nâng cấp gói mới
          </Link>
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="p-2 rounded-xl border border-[#e8dfd8] hover:bg-gray-50 text-gray-600 transition-colors"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#e8dfd8] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-gray-700">
            <thead className="bg-[#fdfbf7] text-gray-500 font-semibold border-b border-[#e8dfd8]">
              <tr>
                <th className="px-6 py-4">Mã Giao Dịch</th>
                <th className="px-6 py-4">Gói Dịch Vụ</th>
                <th className="px-6 py-4">Số Tiền</th>
                <th className="px-6 py-4">Phương Thức</th>
                <th className="px-6 py-4">Trạng Thái</th>
                <th className="px-6 py-4">Ngày Tạo</th>
                <th className="px-6 py-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-[#e85d75]" />
                    Đang tải lịch sử giao dịch...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 space-y-2">
                    <CreditCard className="w-10 h-10 mx-auto text-gray-300 mb-1" />
                    <p className="font-semibold text-gray-800">Bạn chưa có giao dịch thanh toán nào</p>
                    <p className="text-xs text-gray-400">
                      Nâng cấp gói dịch vụ để tận hưởng các tính năng tạo thiệp cao cấp không giới hạn.
                    </p>
                    <div className="pt-2">
                      <Link
                        href="/dashboard/subscription"
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#e85d75] text-white text-xs font-semibold"
                      >
                        Khám phá gói cước <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-gray-900 whitespace-nowrap">
                      #{o.order_code}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-800">
                      {o.subscription_plan_id === 'plan-premium'
                        ? 'Premium Plan'
                        : o.subscription_plan_id === 'plan-basic'
                        ? 'Basic Plan'
                        : 'Free Plan'}
                    </td>
                    <td className="px-6 py-4 font-bold text-[#e85d75] whitespace-nowrap">
                      {o.final_amount.toLocaleString('vi-VN')} đ
                    </td>
                    <td className="px-6 py-4 text-gray-500 whitespace-nowrap">
                      QR Chuyển khoản
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(o.status)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 whitespace-nowrap text-[11px]">
                      {new Date(o.created_at).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      <Link
                        href={`/dashboard/payments/${o.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 text-gray-700 hover:text-[#e85d75] hover:border-[#e85d75] font-semibold text-xs transition-colors"
                      >
                        Chi tiết <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
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
