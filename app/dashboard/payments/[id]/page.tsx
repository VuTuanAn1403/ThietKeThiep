'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  CreditCard,
  Copy,
  Check,
  Clock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  ArrowLeft,
  RefreshCw,
  Zap,
  Building,
  User,
  FileText,
  Loader2,
} from 'lucide-react';
import { PaymentOrder } from '@/types/database.types';
import { PaymentQRCode } from '@/components/payment/PaymentQRCode';
import { PAYMENT_CONFIG } from '@/lib/payment/config';

export default function PaymentOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<{ minutes: number; seconds: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/v1/payments/orders/${orderId}`);
      const data = await res.json();
      if (res.ok && data.data) {
        setOrder(data.data);
      } else {
        setErrorMsg(data.error || 'Không tìm thấy thông tin đơn hàng');
      }
    } catch {
      setErrorMsg('Lỗi tải thông tin thanh toán');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Countdown timer based on expires_at
  useEffect(() => {
    if (!order) return;

    const calculateTimeLeft = () => {
      const difference = new Date(order.expires_at).getTime() - new Date().getTime();
      if (difference <= 0) {
        setIsExpired(true);
        setTimeLeft({ minutes: 0, seconds: 0 });
        return;
      }

      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);
      setTimeLeft({ minutes, seconds });
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [order]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleConfirmPaid = async () => {
    if (!order) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/v1/payments/orders/${order.id}/confirm-request`, {
        method: 'POST',
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setOrder(data.data);
      } else {
        alert(data.error || 'Có lỗi xảy ra khi xác nhận thanh toán');
      }
    } catch {
      alert('Lỗi gửi xác nhận thanh toán');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-xs text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#e85d75] mr-2" />
        Đang tải thông tin giao dịch...
      </div>
    );
  }

  if (!order || errorMsg) {
    return (
      <div className="max-w-xl mx-auto p-8 bg-white rounded-3xl border border-[#e8dfd8] text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
        <h2 className="text-lg font-bold text-gray-900">Không tìm thấy đơn hàng</h2>
        <p className="text-xs text-gray-500">{errorMsg || 'Đơn hàng không tồn tại hoặc đã bị hủy.'}</p>
        <Link
          href="/dashboard/subscription"
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#e85d75] text-white text-xs font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Gói Dịch Vụ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/payments"
          className="inline-flex items-center gap-1.5 text-xs text-[#756B70] hover:text-[#E85B6A] font-semibold transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Lịch sử thanh toán
        </Link>
        <span className="text-xs font-mono text-[#756B70]">Mã đơn: #{order.order_code}</span>
      </div>

      {/* Warning Banner */}
      <div className="bg-amber-50/70 border border-amber-200/80 p-5 rounded-3xl flex items-start gap-3.5 text-amber-900 text-xs shadow-soft">
        <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-serif font-bold text-sm">Lưu ý quan trọng khi chuyển khoản:</p>
          <p className="text-amber-800 leading-relaxed">
            Vui lòng nhập <strong>chính xác Số tiền</strong> và <strong>Nội dung chuyển khoản ({order.order_code})</strong> để hệ thống tự động đối soát. Nếu bạn đã thanh toán mà sau 3-5 phút chưa được duyệt, vui lòng{' '}
            <Link href={PAYMENT_CONFIG.SUPPORT_URL} className="font-bold underline text-amber-900">
              liên hệ hỗ trợ
            </Link>.
          </p>
        </div>
      </div>

      {/* Status Bar */}
      {order.status === 'PAID' && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-emerald-900 text-xs shadow-soft">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="font-bold">Đã thanh toán thành công! Gói dịch vụ đã được kích hoạt.</span>
          </div>
          <Link
            href="/dashboard/subscription"
            className="px-4 py-1.5 rounded-full bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700 transition-colors"
          >
            Xem gói cước
          </Link>
        </div>
      )}

      {order.status === 'WAITING_CONFIRMATION' && (
        <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 flex items-center gap-2 text-blue-900 text-xs font-medium shadow-soft">
          <RefreshCw className="w-4 h-4 text-blue-600 animate-spin flex-shrink-0" />
          <span>Yêu cầu xác nhận thanh toán đã được gửi. Hệ thống đang tiến hành đối soát...</span>
        </div>
      )}

      {order.status === 'FAILED' && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between text-rose-900 text-xs shadow-soft">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-600" />
            <span className="font-bold">Giao dịch chưa được xác nhận hoặc bị từ chối.</span>
          </div>
          <Link
            href={PAYMENT_CONFIG.SUPPORT_URL}
            className="px-4 py-1.5 rounded-full bg-rose-600 text-white font-semibold text-xs"
          >
            Hỗ trợ ngay
          </Link>
        </div>
      )}

      {/* Main 2-Column Payment Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 luxury-card p-7 sm:p-9 rounded-3xl shadow-card">
        {/* Left Column: Transfer Information */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-serif font-bold text-[#1F1B1C] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#E85B6A]" /> Thông Tin Chuyển Khoản
            </h2>
            <p className="text-xs text-[#756B70] mt-1">
              Quét mã QR hoặc thực hiện chuyển khoản theo thông tin bên dưới
            </p>
          </div>

          <div className="space-y-3.5 text-xs">
            {/* Bank Name */}
            <div className="bg-[#FAF7F5] p-4 rounded-2xl border border-[#EAE4DF]">
              <span className="text-[11px] text-[#756B70] block mb-0.5 font-medium">Ngân hàng</span>
              <span className="font-bold text-[#1F1B1C] text-sm">{order.bank_name}</span>
            </div>

            {/* Account Number */}
            <div className="bg-[#FAF7F5] p-4 rounded-2xl border border-[#EAE4DF] flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#756B70] block mb-0.5 font-medium">Số tài khoản</span>
                <span className="font-mono font-bold text-[#1F1B1C] text-base">{order.account_number}</span>
              </div>
              <button
                onClick={() => handleCopy(order.account_number, 'acc')}
                className="px-3 py-1.5 rounded-full btn-luxury-secondary text-[#1F1B1C] transition-all flex items-center gap-1 font-semibold text-[11px] cursor-pointer"
              >
                {copiedKey === 'acc' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#E85B6A]" />}
                {copiedKey === 'acc' ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>

            {/* Account Name */}
            <div className="bg-[#FAF7F5] p-4 rounded-2xl border border-[#EAE4DF]">
              <span className="text-[11px] text-[#756B70] block mb-0.5 font-medium">Tên chủ tài khoản</span>
              <span className="font-bold text-[#1F1B1C]">{order.account_name}</span>
            </div>

            {/* Transfer Content */}
            <div className="bg-[#FAF7F5] p-4 rounded-2xl border-2 border-dashed border-[#E85B6A]/50 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-[#E85B6A] block mb-0.5 font-bold">Nội dung chuyển khoản (Bắt buộc)</span>
                <span className="font-mono font-bold text-[#1F1B1C] text-base">{order.transfer_content}</span>
              </div>
              <button
                onClick={() => handleCopy(order.transfer_content, 'content')}
                className="px-3.5 py-1.5 rounded-full btn-luxury-primary text-white transition-all flex items-center gap-1 font-semibold text-[11px] cursor-pointer shadow-sm"
              >
                {copiedKey === 'content' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedKey === 'content' ? 'Đã sao chép' : 'Sao chép'}
              </button>
            </div>

            {/* Total Amount */}
            <div className="bg-gradient-to-r from-rose-50 to-amber-50 p-4 rounded-2xl border border-rose-200 flex items-center justify-between shadow-soft">
              <div>
                <span className="text-[11px] text-[#756B70] font-medium block">Tổng số tiền thanh toán</span>
                <div className="text-2xl font-serif font-bold text-[#E85B6A]">
                  {order.final_amount.toLocaleString('vi-VN')} đ
                </div>
              </div>
              {order.discount_amount > 0 && (
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full">
                  Tiết kiệm {order.discount_amount.toLocaleString('vi-VN')} đ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: QR Code & Actions */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <PaymentQRCode
              qrCodeUrl={order.qr_code_url}
              orderCode={order.order_code}
              amount={order.final_amount}
            />

            {/* Countdown Box */}
            <div className="bg-[#FAF7F5] border border-[#EAE4DF] p-3.5 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-[#756B70] font-medium">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Thời gian giữ đơn hàng:</span>
              </div>
              <div className="font-mono font-bold text-sm text-[#E85B6A]">
                {isExpired
                  ? 'Hết hạn'
                  : timeLeft
                  ? `${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}`
                  : '--:--'}
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div>
            {order.status === 'PAID' ? (
              <Link
                href="/dashboard/subscription"
                className="w-full py-3.5 rounded-full bg-emerald-600 text-white font-semibold text-xs shadow-soft hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Đã hoàn tất thanh toán
              </Link>
            ) : isExpired || order.status === 'EXPIRED' ? (
              <Link
                href="/dashboard/subscription"
                className="w-full py-3.5 rounded-full bg-[#1F1B1C] text-white font-semibold text-xs shadow-soft hover:bg-[#2F292B] transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" /> Thời gian đã hết — Tạo giao dịch mới
              </Link>
            ) : order.status === 'WAITING_CONFIRMATION' ? (
              <button
                disabled
                className="w-full py-3.5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs cursor-default flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4" /> Đã gửi yêu cầu xác nhận
              </button>
            ) : (
              <button
                onClick={handleConfirmPaid}
                disabled={confirming}
                className="w-full py-3.5 rounded-full btn-luxury-primary text-white font-semibold text-xs shadow-card flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {confirming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang gửi thông báo...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Tôi đã chuyển khoản thành công
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
