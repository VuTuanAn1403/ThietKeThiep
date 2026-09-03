'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check, CreditCard, Heart } from 'lucide-react';
import { GiftService } from '@/services/gift.service';
import { Gift as GiftType } from '@/types/database.types';

interface GiftSectionProps {
  invitationId: string;
}

export default function GiftSection({ invitationId }: GiftSectionProps) {
  const [gift, setGift] = useState<GiftType | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function load() {
      const g = await GiftService.getGiftByInvitationId(invitationId);
      setGift(g);
    }
    load();
  }, [invitationId]);

  if (!gift || !gift.is_visible) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(gift.account_number);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = gift.qr_image_url || `https://api.vietqr.io/image/970436-${gift.account_number}-compact.jpg?amount=0&accountName=${encodeURIComponent(gift.account_name)}`;

  return (
    <section className="py-20 px-4 bg-[#fdfbf7] text-center">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-[#e85d75] flex items-center justify-center mx-auto mb-2 border border-rose-100 shadow-xs">
            <Gift className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">{gift.title}</h2>
          {gift.description && (
            <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-md mx-auto">
              {gift.description}
            </p>
          )}
        </div>

        {/* Bank & QR Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfd8] shadow-md space-y-6">
          {qrUrl && (
            <div className="w-48 h-48 mx-auto bg-gray-50 rounded-2xl p-2 border border-gray-200 overflow-hidden shadow-xs">
              <img src={qrUrl} alt="QR Chuyển khoản" className="w-full h-full object-contain" />
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Ngân hàng</span>
              <span className="font-bold text-gray-900">{gift.bank_name}</span>
            </div>

            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-500 font-medium">Chủ tài khoản</span>
              <span className="font-bold text-gray-900 uppercase">{gift.account_name}</span>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-gray-500 font-medium">Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-gray-900 text-sm">{gift.account_number}</span>
                <button
                  onClick={handleCopyAccount}
                  className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Đã chép' : 'Sao chép'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
