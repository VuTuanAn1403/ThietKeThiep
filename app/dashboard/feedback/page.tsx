'use client';

import React, { useState, useEffect } from 'react';
import {
  MessageSquarePlus,
  Star,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { FeedbackService, FeedbackInput } from '@/services/feedback.service';
import { AuthService } from '@/lib/auth/auth-service';
import { Feedback, FeedbackType } from '@/types/database.types';

export default function UserFeedbackPage() {
  const currentUser = AuthService.getCurrentUserSync();
  const [feedbackList, setFeedbackList] = useState<Feedback[]>([]);
  const [type, setType] = useState<FeedbackType>('FEATURE');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const userId = currentUser?.id || 'usr-demo-01';
      const list = await FeedbackService.getUserFeedback(userId);
      setFeedbackList(list);
      setLoading(false);
    }
    load();
  }, [currentUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const userId = currentUser?.id || 'usr-demo-01';
    setError(null);
    setSubmitting(true);
    setSuccess(false);

    try {
      const res = await FeedbackService.submitFeedback(userId, {
        type,
        title,
        content,
        rating,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.feedback) {
        setFeedbackList((prev) => [res.feedback!, ...prev]);
        setTitle('');
        setContent('');
        setSuccess(true);
        setTimeout(() => setSuccess(false), 4000);
      }
    } catch {
      setError('Đã xảy ra lỗi khi gửi góp ý.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Chia Sẻ Góp Ý & Đánh Giá</h1>
        <p className="text-xs text-gray-500 mt-1">
          Mỗi ý kiến đóng góp của bạn là động lực to lớn giúp Nhà Có Tiệc ngày càng hoàn thiện hơn
        </p>
      </div>

      {/* Submit Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfd8] shadow-xs space-y-6">
        <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
          <MessageSquarePlus className="w-5 h-5 text-[#e85d75]" /> Gửi Phản Hồi Mới
        </h2>

        {error && (
          <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-rose-700 text-xs font-medium">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center gap-2 text-emerald-800 text-xs font-medium">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Cảm ơn bạn! Ý kiến đóng góp của bạn đã được gửi thành công đến đội ngũ kỹ thuật.</span>
          </div>
        )}

        <div className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-gray-800 mb-1">Loại Phản Hồi *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { type: 'FEATURE', label: 'Tính năng mới' },
                { type: 'UI_UX', label: 'Giao diện & Trải nghiệm' },
                { type: 'BUG', label: 'Báo lỗi hệ thống' },
                { type: 'OTHER', label: 'Góp ý khác' },
              ].map((item) => (
                <button
                  type="button"
                  key={item.type}
                  onClick={() => setType(item.type as FeedbackType)}
                  className={`py-2 px-3 rounded-xl font-semibold text-xs border text-center transition-colors ${
                    type === item.type
                      ? 'bg-[#e85d75] text-white border-[#e85d75]'
                      : 'bg-[#fdfbf7] text-gray-700 border-[#e8dfd8] hover:bg-gray-50'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Đánh Giá Trải Nghiệm</label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 text-amber-400 hover:scale-110 transition-transform"
                >
                  <Star className={`w-6 h-6 ${rating >= star ? 'fill-amber-400' : 'text-gray-300'}`} />
                </button>
              ))}
              <span className="text-xs font-semibold text-gray-500 ml-2">({rating}/5 sao)</span>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Tiêu Đề *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Tóm tắt ngắn gọn ý kiến của bạn..."
              className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-gray-800 mb-1">Nội Dung Chi Tiết *</label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Mô tả chi tiết mong muốn hoặc trải nghiệm của bạn..."
              className="w-full px-4 py-2.5 bg-[#fdfbf7] border border-[#e8dfd8] rounded-xl focus:ring-2 focus:ring-[#e85d75] focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#e85d75] text-white text-xs font-semibold hover:bg-[#d64c64] transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> {submitting ? 'Đang gửi...' : 'Gửi Phản Hồi'}
          </button>
        </div>
      </form>

      {/* History Feedback List */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-gray-900">Lịch Sử Góp Ý Của Bạn</h2>

        {feedbackList.length === 0 ? (
          <div className="bg-white p-8 rounded-3xl border border-[#e8dfd8] text-center text-xs text-gray-500">
            Bạn chưa gửi phản hồi nào.
          </div>
        ) : (
          <div className="space-y-3">
            {feedbackList.map((fb) => (
              <div key={fb.id} className="p-5 bg-white rounded-2xl border border-[#e8dfd8] shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-700 text-[10px] font-bold">
                      {fb.type}
                    </span>
                    <h3 className="font-bold text-gray-900 text-xs">{fb.title}</h3>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      fb.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : fb.status === 'REVIEWING'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {fb.status === 'RESOLVED' ? 'Đã Xử Lý' : fb.status === 'REVIEWING' ? 'Đang Xem Xét' : 'Mới Gửi'}
                  </span>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">{fb.content}</p>
                <div className="text-[11px] text-gray-400 font-mono pt-1">
                  {new Date(fb.created_at).toLocaleDateString('vi-VN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
