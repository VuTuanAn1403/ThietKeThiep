'use client';

import React from 'react';
import { Calendar, Clock, MapPin, Navigation } from 'lucide-react';
import { Invitation } from '@/types/database.types';

interface Props {
  invitation: Invitation;
}

export default function EventSection({ invitation }: Props) {
  return (
    <div className="py-16 px-6 bg-white border-b border-[#E8DFD8]">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-[#8FA79B]">
            Thông Tin Sự Kiện
          </span>
          <h2
            className="text-3xl sm:text-4xl font-bold text-[#292624] mt-2"
            style={{ fontFamily: invitation.heading_font || 'Cormorant Garamond' }}
          >
            Thời Gian & Địa Điểm Tổ Chức
          </h2>
        </div>

        <div className="bg-[#FFFDF9] p-8 rounded-3xl border border-[#E8DFD8] shadow-sm space-y-6 text-left">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFEB] flex items-center justify-center text-[#B76E79] flex-shrink-0">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Ngày Tổ Chức</div>
              <div className="text-lg font-bold text-[#292624] mt-0.5">{invitation.event_date}</div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFEB] flex items-center justify-center text-[#B76E79] flex-shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Thời Gian</div>
              <div className="text-lg font-bold text-[#292624] mt-0.5">
                {invitation.event_start_time || '11:00'} {invitation.event_end_time ? `- ${invitation.event_end_time}` : ''}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4EFEB] flex items-center justify-center text-[#B76E79] flex-shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-medium text-gray-500 uppercase">Địa Điểm Tổ Chức</div>
              <div className="text-lg font-bold text-[#292624] mt-0.5">{invitation.venue_name}</div>
              <div className="text-sm text-gray-600 mt-1">{invitation.venue_address}</div>
            </div>
          </div>

          {invitation.map_url && (
            <div className="pt-4 border-t border-[#E8DFD8] flex justify-end">
              <a
                href={invitation.map_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#B76E79] text-white text-xs font-semibold hover:bg-[#a25b66] transition-colors shadow-sm"
              >
                <Navigation className="w-4 h-4" />
                Mở Bản Đồ Chỉ Đường
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
