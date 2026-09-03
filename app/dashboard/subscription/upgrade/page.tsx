'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CreditCard,
  Check,
  Zap,
  ArrowRight,
  ArrowLeft,
  Tag,
  ShieldCheck,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { SubscriptionPlan } from '@/types/database.types';
import { SubscriptionService } from '@/services/subscription.service';
import { PAYMENT_CONFIG } from '@/lib/payment/config';

function UpgradeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const targetPlanId = searchParams.get('plan') || 'plan-basic';

  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [discountCode, setDiscountCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [discountSuccess, setDiscountSuccess] = useState<string | null>(null);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const plans = await SubscriptionService.getPlans();
      const found = plans.find((p) => p.id === targetPlanId) || plans.find((p) => p.price_vnd > 0);
      if (found) {
        setPlan(found);
      }
      setLoadingPlan(false);
    }
    load();
  }, [targetPlanId]);

  const handleApplyDiscount = () => {
    setDiscountError(null);
    setDiscountSuccess(null);

    const clean = discountCode.trim().toUpperCase();
    if (!clean) {
      setDiscountError('Vui lòng nhập mã giảm giá');
      return;
    }

    const val = PAYMENT_CONFIG.VALID_DISCOUNT_CODES[clean];
    if (val) {
      setAppliedDiscount(val);
      setDiscountSuccess(`Đã áp dụng mã giảm ${val.toLocaleString('vi-VN')} đ thành công!`);
    } else {
      setDiscountError('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setAppliedDiscount(0);
    }
  };

  const handleCreatePayment = async () => {
    if (!plan) return;
    if (!agreeTerms) {
      setErrorMsg('Vui lòng đồng ý với điều khoản dịch vụ để tiếp tục');
      return;
    }

    setErrorMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch('/api/v1/payments/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          discountCode: appliedDiscount > 0 ? discountCode.trim().toUpperCase() : undefined,
        }),
      });

      const data = await res.json();
      if (res.ok && data.data) {
        router.push(`/dashboard/payments/${data.data.id}`);
      } else {
        setErrorMsg(data.error || 'Không thể tạo đơn hàng thanh toán');
      }
    } catch {
      setErrorMsg('Lỗi kết nối khi khởi tạo thanh toán');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingPlan) {
    return (
      <div className="min-h-[400px] flex items-center justify-center text-xs text-gray-500">
        <Loader2 className="w-6 h-6 animate-spin text-[#e85d75] mr-2" />
        Đang tải thông tin gói cước...
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-[#e8dfd8] text-center space-y-3">
        <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
        <p className="text-sm font-bold text-gray-800">Không tìm thấy gói dịch vụ</p>
        <Link href="/dashboard/subscription" className="text-xs text-[#e85d75] hover:underline font-semibold">
          Quay lại danh sách gói cước
        </Link>
      </div>
    );
  }

  const originalPrice = plan.price_vnd;
  const finalPrice = Math.max(0, originalPrice - appliedDiscount);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard/subscription"
          className="inline-flex items-center gap-1.5 text-xs text-gray-600 hover:text-[#e85d75] font-semibold"
        >
          <ArrowLeft className="w-4 h-4" /> Quay lại Gói Dịch Vụ
        </Link>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfd8] shadow-lg space-y-6">
        <div>
          <span className="px-3 py-1 rounded-full bg-rose-50 text-[#e85d75] text-[11px] font-bold border border-rose-200 inline-flex items-center gap-1">
            <Zap className="w-3.5 h-3.5" /> Nâng Cấp Gói Dịch Vụ
          </span>
          <h1 className="text-2xl font-serif font-bold text-gray-900 mt-2">
            Xác Nhận & Thanh Toán Gói {plan.name}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Mở khóa đầy đủ các tính năng tạo thiệp cưới online cao cấp, không giới hạn lượt xem và thiệp mời.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Plan Summary Card */}
        <div className="bg-[#fdfbf7] p-5 rounded-2xl border border-[#e8dfd8] space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-bold text-base text-gray-900">{plan.name}</h3>
              <p className="text-xs text-gray-500">Thời hạn sử dụng: 1 Năm (Kích hoạt ngay sau thanh toán)</p>
            </div>
            <div className="text-right">
              <span className="text-lg font-bold text-gray-900">
                {originalPrice.toLocaleString('vi-VN')} đ
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 border-t border-gray-200/60 pt-3">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Tối đa {plan.max_invitations} thiệp mời sự kiện</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{plan.max_images_per_invitation} ảnh HD / thiệp</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>{plan.max_views_per_invitation.toLocaleString()} lượt xem khách mời</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
              <span>Mã QR cá nhân hóa {plan.allow_custom_qr ? '✓' : '✗'}</span>
            </div>
          </div>
        </div>

        {/* Discount Code Input */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-gray-800">
            Mã giảm giá (Nếu có)
          </label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Tag className="w-4 h-4 absolute left-3.5 top-3 text-gray-400" />
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
                placeholder="Ví dụ: PROMO130, TIECVUI, NHAMOI"
                className="w-full pl-10 pr-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl text-xs uppercase font-mono focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={handleApplyDiscount}
              className="px-5 py-2.5 rounded-xl bg-gray-900 text-white font-semibold text-xs hover:bg-gray-800 transition-colors cursor-pointer"
            >
              Áp dụng
            </button>
          </div>

          {discountError && (
            <p className="text-[11px] text-rose-600 font-medium">{discountError}</p>
          )}
          {discountSuccess && (
            <p className="text-[11px] text-emerald-600 font-medium">{discountSuccess}</p>
          )}
        </div>

        {/* Pricing Breakdown */}
        <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
          <div className="flex justify-between text-gray-600">
            <span>Giá gốc</span>
            <span>{originalPrice.toLocaleString('vi-VN')} đ</span>
          </div>

          {appliedDiscount > 0 && (
            <div className="flex justify-between text-emerald-600 font-semibold">
              <span>Mã giảm giá ({discountCode.toUpperCase()})</span>
              <span>-{appliedDiscount.toLocaleString('vi-VN')} đ</span>
            </div>
          )}

          <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-100">
            <span>Tổng số tiền cần thanh toán</span>
            <span className="text-xl text-[#e85d75]">{finalPrice.toLocaleString('vi-VN')} đ</span>
          </div>
        </div>

        {/* Terms Agreement */}
        <div className="flex items-center gap-2 pt-2">
          <input
            type="checkbox"
            id="terms"
            checked={agreeTerms}
            onChange={(e) => setAgreeTerms(e.target.checked)}
            className="rounded border-[#e8dfd8] text-[#e85d75] focus:ring-[#e85d75]"
          />
          <label htmlFor="terms" className="text-[11px] text-gray-600">
            Tôi đồng ý với{' '}
            <Link href="/privacy" className="text-[#e85d75] hover:underline font-semibold">
              Điều khoản dịch vụ & Chính sách hoàn tiền
            </Link>{' '}
            của NHÀ CÓ TIỆC.
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleCreatePayment}
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Đang tạo mã QR thanh toán...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4" />
              Thanh toán ngay bằng QR Chuyển Khoản
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function UpgradePage() {
  return (
    <Suspense fallback={<div className="text-xs text-gray-400 p-8">Đang tải...</div>}>
      <UpgradeForm />
    </Suspense>
  );
}
