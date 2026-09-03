'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Check,
  Zap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Clock,
  Layers,
} from 'lucide-react';
import { SubscriptionService } from '@/services/subscription.service';
import { AnalyticsService } from '@/services/analytics.service';
import { AuthService } from '@/lib/auth/auth-service';
import { SubscriptionPlan, UserSubscription } from '@/types/database.types';

export default function UserSubscriptionPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [allPlans, setAllPlans] = useState<SubscriptionPlan[]>([]);
  const [invitationsCount, setInvitationsCount] = useState(0);
  const [viewsCount, setViewsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const userId = currentUser?.id || 'usr-demo-01';
      const [plans, userSub, metrics] = await Promise.all([
        SubscriptionService.getPlans(),
        SubscriptionService.getUserSubscription(userId),
        AnalyticsService.getUserOverviewMetrics(userId),
      ]);
      setAllPlans(plans);
      setCurrentPlan(userSub.plan);
      setSubscription(userSub.subscription);
      setInvitationsCount(metrics.totalInvitations);
      setViewsCount(metrics.totalViews);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Gói Dịch Vụ Của Tôi</h1>
        <p className="text-xs text-gray-500 mt-1">
          Theo dõi trạng thái gói cước, dung lượng sử dụng và các tính năng nâng cao
        </p>
      </div>

      {/* Current Plan Card */}
      <div className="bg-gradient-to-br from-[#1F2421] to-[#292E2B] text-white p-6 sm:p-8 rounded-3xl border border-[#3A403C] shadow-lg space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e85d75]/20 text-[#e85d75] text-[11px] font-bold border border-[#e85d75]/30">
              <Zap className="w-3.5 h-3.5" /> Gói Đang Hoạt Động
            </div>
            <h2 className="text-2xl font-bold font-serif text-white">{currentPlan?.name || 'Free Plan'}</h2>
            <p className="text-xs text-gray-400">
              {subscription?.expires_at
                ? `Hạn sử dụng đến: ${new Date(subscription.expires_at).toLocaleDateString('vi-VN')}`
                : 'Gói miễn phí vĩnh viễn'}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-2xl font-bold text-[#e85d75]">
              {currentPlan?.price_vnd === 0 ? 'Miễn Phí' : `${currentPlan?.price_vnd?.toLocaleString('vi-VN')} đ`}
            </div>
            <div className="text-[11px] text-gray-400">Thanh toán trọn đời / năm</div>
          </div>
        </div>

        {/* Usage Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#3A403C]">
          <div className="bg-[#1F2421]/60 p-4 rounded-2xl border border-[#3A403C] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Số thiệp đã tạo</span>
              <span className="font-bold text-white">
                {invitationsCount} / {currentPlan?.max_invitations || 1} thiệp
              </span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#e85d75] h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (invitationsCount / (currentPlan?.max_invitations || 1)) * 100)}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-[#1F2421]/60 p-4 rounded-2xl border border-[#3A403C] space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-gray-400 font-medium">Lượt xem thiệp</span>
              <span className="font-bold text-white">
                {viewsCount} / {currentPlan?.max_views_per_invitation?.toLocaleString() || '300'} lượt
              </span>
            </div>
            <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (viewsCount / (currentPlan?.max_views_per_invitation || 300)) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Available Upgrade Plans */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Các Gói Nâng Cấp Khác</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {allPlans.map((plan) => {
            const isCurrent = currentPlan?.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`bg-white p-6 rounded-3xl border flex flex-col justify-between space-y-6 transition-all ${
                  isCurrent
                    ? 'border-2 border-[#e85d75] ring-2 ring-[#e85d75]/20 shadow-md'
                    : 'border-[#e8dfd8] hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-lg text-gray-900">{plan.name}</h3>
                    {isCurrent && (
                      <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-[#e85d75] text-[10px] font-bold">
                        Đang dùng
                      </span>
                    )}
                  </div>

                  <div className="text-2xl font-bold text-gray-900">
                    {plan.price_vnd === 0 ? '0 đ' : `${plan.price_vnd.toLocaleString('vi-VN')} đ`}
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Tối đa {plan.max_invitations} thiệp mời</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{plan.max_images_per_invitation} ảnh / thiệp</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>{plan.max_views_per_invitation.toLocaleString()} lượt xem</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Mã QR cá nhân hóa {plan.allow_custom_qr ? '✓' : '✗'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>Nhạc nền MP3 tùy chỉnh {plan.allow_custom_music ? '✓' : '✗'}</span>
                    </div>
                  </div>
                </div>

                  <div>
                    {isCurrent ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-gray-100 text-gray-400 font-semibold text-xs cursor-default"
                      >
                        Gói hiện tại
                      </button>
                    ) : (
                      <Link
                        href={`/dashboard/subscription/upgrade?plan=${plan.id}`}
                        className="w-full py-2.5 rounded-xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64] transition-all text-center block"
                      >
                        Nâng cấp ngay ✨
                      </Link>
                    )}
                  </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
