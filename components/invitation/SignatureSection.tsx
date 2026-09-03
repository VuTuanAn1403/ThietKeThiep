'use client';

import React, { useState, useEffect } from 'react';
import { PenTool, Send, CheckCircle2, AlertCircle, Heart } from 'lucide-react';
import { SignatureService } from '@/services/signature.service';
import { Signature } from '@/types/database.types';

interface SignatureSectionProps {
  invitationId: string;
  guestNameDefault?: string;
  guestId?: string | null;
}

export default function SignatureSection({ invitationId, guestNameDefault = '', guestId }: SignatureSectionProps) {
  const [signatures, setSignatures] = useState<Signature[]>([]);
  const [name, setName] = useState(guestNameDefault);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const sigs = await SignatureService.getVisibleSignatures(invitationId);
      setSignatures(sigs);
    }
    load();
  }, [invitationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) {
      setError('Vui lòng nhập tên và lời nhắn lưu bút.');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await SignatureService.submitSignature(invitationId, name, message, null, guestId);
      if (res.error) {
        setError(res.error);
      } else if (res.signature) {
        setSignatures((prev) => [res.signature!, ...prev]);
        setMessage('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      }
    } catch {
      setError('Đã xảy ra lỗi khi gửi lưu bút.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-20 px-4 bg-white text-center">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-3">
          <div className="w-12 h-12 rounded-full bg-rose-50 text-[#e85d75] flex items-center justify-center mx-auto mb-2 border border-rose-100 shadow-xs">
            <PenTool className="w-6 h-6" />
          </div>
          <h2 className="text-3xl font-serif font-bold text-gray-900">Sổ Lưu Bút Kỷ Niệm</h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md mx-auto">
            Hãy để lại chữ ký điện tử và vài dòng lưu bút chúc phúc gửi đến cô dâu & chú rể nhé!
          </p>
        </div>

        {/* Submit Signature Form */}
        <form onSubmit={handleSubmit} className="bg-[#fdfbf7] p-6 sm:p-8 rounded-3xl border border-[#e8dfd8] shadow-sm space-y-4 text-left">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Cảm ơn bạn đã ký tên lưu bút và gửi lời chúc!</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tên của bạn *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên khách mời..."
              className="w-full px-4 py-2 bg-white border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Dòng lưu bút kỷ niệm *</label>
            <textarea
              rows={3}
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Gửi lời chúc phúc và ký tên lưu bút..."
              className="w-full px-4 py-2 bg-white border border-[#e8dfd8] rounded-xl text-xs focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#e85d75] text-white font-semibold text-xs shadow-md hover:bg-[#d64c64] transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" /> {loading ? 'Đang gửi...' : 'Ký Tên & Lưu Bút'}
          </button>
        </form>

        {/* List Signatures */}
        {signatures.length > 0 && (
          <div className="space-y-4 text-left">
            <h3 className="font-serif font-bold text-gray-800 text-lg text-center">Nét Bút Yêu Thương</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {signatures.map((sig) => (
                <div key={sig.id} className="p-4 bg-[#fdfbf7] rounded-2xl border border-[#e8dfd8] space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-xs">{sig.guest_name}</span>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(sig.created_at).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 leading-relaxed font-serif italic">&ldquo;{sig.message}&rdquo;</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
