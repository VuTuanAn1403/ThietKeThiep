'use client';

import React, { useState, useEffect } from 'react';
import { Gift, Copy, Check } from 'lucide-react';
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
    <section className="py-24 px-4 text-center">
      <div className="max-w-xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-[#FAF7F5] text-[#C5A880] flex items-center justify-center mx-auto mb-2 border border-[#C5A880]/30 shadow-soft">
            <Gift className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#C5A880]">
            <span>HỘP MỪNG CƯỚI & QUÀ TẶNG</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#1F1B1C]">{gift.title}</h2>
          {gift.description && (
            <p className="text-xs sm:text-sm text-[#756B70] leading-relaxed max-w-md mx-auto">
              {gift.description}
            </p>
          )}
        </div>

        {/* Bank & QR Card with Depth */}
        <div className="depth-card bg-white p-7 sm:p-9 rounded-3xl border border-[#EAE4DF] space-y-6 text-left shadow-card">
          {qrUrl && (
            <div className="w-52 h-52 mx-auto bg-[#FAF7F5] rounded-2xl p-3 border border-[#EAE4DF] overflow-hidden shadow-soft flex items-center justify-center">
              <img src={qrUrl} alt="QR Chuyển khoản" className="w-full h-full object-contain" />
            </div>
          )}

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-2.5 border-b border-[#FAF7F5]">
              <span className="text-[#756B70] font-medium">Ngân hàng</span>
              <span className="font-bold text-[#1F1B1C]">{gift.bank_name}</span>
            </div>

            <div className="flex justify-between py-2.5 border-b border-[#FAF7F5]">
              <span className="text-[#756B70] font-medium">Chủ tài khoản</span>
              <span className="font-bold text-[#1F1B1C] uppercase">{gift.account_name}</span>
            </div>

            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#756B70] font-medium">Số tài khoản</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-bold text-[#1F1B1C] text-sm tracking-wider">{gift.account_number}</span>
                <button
                  onClick={handleCopyAccount}
                  className="px-3.5 py-1.5 rounded-full btn-3d-secondary text-[#1F1B1C] text-[11px] font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-[#E85B6A]" />}
                  {copied ? 'Đã sao chép' : 'Sao chép'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
