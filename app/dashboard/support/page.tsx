'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HelpCircle,
  BookOpen,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

const FAQS = [
  {
    q: 'Làm thế nào để gửi link thiệp mời cá nhân hóa cho từng khách?',
    a: 'Tại trang quản lý thiệp, bạn vào mục "Khách mời" -> Bấm nút "Thêm khách" hoặc "Nhập CSV". Sau đó mỗi khách mời sẽ có nút sao chép đường link cá nhân hóa dạng: /i/slug-thiep?to=slug-khach.',
  },
  {
    q: 'Khách mời có cần đăng ký tài khoản để xác nhận tham dự (RSVP) không?',
    a: 'Hoàn toàn không cần! Khách mời chỉ cần mở link thiệp, kéo xuống phần "Xác nhận tham dự", chọn Có/Không/Chưa chắc và gửi phản hồi trong 5 giây.',
  },
  {
    q: 'Tôi có thể tải ảnh cưới chất lượng cao lên thiệp không?',
    a: 'Có, hệ thống hỗ trợ định dạng JPG, PNG, WEBP với dung lượng tối đa 5MB mỗi ảnh, đảm bảo tốc độ tải trang nhanh và độ nét cao.',
  },
  {
    q: 'Mã QR Code nhận tiền mừng cưới hoạt động như thế nào?',
    a: 'Khi bạn nhập Số tài khoản và Tên ngân hàng tại mục "Quà tặng", hệ thống tự động sinh mã VietQR chuẩn liên ngân hàng. Khách chỉ cần quét mã bằng app ngân hàng là có thể chuyển khoản tức thì.',
  },
  {
    q: 'Tôi có thể thay đổi nhạc nền thiệp cưới không?',
    a: 'Bạn có thể dán trực tiếp đường link file MP3 vào ô "Nhạc nền" trong Trình biên tập thiệp.',
  },
];

export default function SupportFAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif font-bold text-gray-900">Trung Tâm Trợ Giúp & FAQ</h1>
        <p className="text-xs text-gray-500 mt-1">
          Các câu hỏi thường gặp và kênh hỗ trợ trực tiếp từ đội ngũ Nhà Có Tiệc
        </p>
      </div>

      {/* Contact Support Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-3xl border border-[#e8dfd8] shadow-xs space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-[#e85d75] flex items-center justify-center mx-auto">
            <Mail className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-gray-800">Email Hỗ Trợ</h3>
          <p className="text-[11px] text-gray-500 font-mono">support@nhacotiec.vn</p>
          <p className="text-[10px] text-gray-400">Phản hồi trong 2 giờ</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#e8dfd8] shadow-xs space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Phone className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-gray-800">Hotline 24/7</h3>
          <p className="text-[11px] text-gray-500 font-mono">1900 6868</p>
          <p className="text-[10px] text-gray-400">Tư vấn miễn phí</p>
        </div>

        <div className="p-5 bg-white rounded-3xl border border-[#e8dfd8] shadow-xs space-y-2 text-center">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
            <MessageCircle className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-xs text-gray-800">Góp Ý Tính Năng</h3>
          <Link href="/dashboard/feedback" className="text-[11px] text-[#e85d75] font-semibold hover:underline block">
            Gửi phản hồi ngay &rarr;
          </Link>
          <p className="text-[10px] text-gray-400">Đóng góp ý kiến</p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#e8dfd8] shadow-xs space-y-4">
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-[#e85d75]" /> Các Câu Hỏi Thường Gặp
        </h2>

        <div className="divide-y divide-gray-100">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div key={idx} className="py-4">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full flex items-center justify-between text-left text-xs font-bold text-gray-800 hover:text-[#e85d75] transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
                {isOpen && (
                  <p className="mt-2 text-xs text-gray-600 leading-relaxed pl-1">
                    {faq.a}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
