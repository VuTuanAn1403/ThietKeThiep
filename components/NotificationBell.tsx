'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, CheckCheck, MessageSquare, UserCheck, PenTool, Sparkles, AlertCircle } from 'lucide-react';
import { Notification } from '@/types/database.types';
import { NotificationService } from '@/services/notification.service';
import { useAuth } from '@/lib/auth/auth-context';

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user) return;
    const list = await NotificationService.getUserNotifications(user.id);
    setNotifications(list);
    setUnreadCount(list.filter((n) => n.read_at === null).length);
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await NotificationService.markAsRead(id);
    await loadNotifications();
  };

  const handleMarkAllAsRead = async () => {
    if (!user) return;
    setLoading(true);
    await NotificationService.markAllAsRead(user.id);
    await loadNotifications();
    setLoading(false);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'RSVP_RECEIVED':
        return <UserCheck className="w-3.5 h-3.5 text-emerald-600" />;
      case 'WISH_RECEIVED':
        return <MessageSquare className="w-3.5 h-3.5 text-blue-600" />;
      case 'SIGNATURE_RECEIVED':
        return <PenTool className="w-3.5 h-3.5 text-purple-600" />;
      case 'INVITATION_PUBLISHED':
        return <Sparkles className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <AlertCircle className="w-3.5 h-3.5 text-gray-600" />;
    }
  };

  if (!user) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        aria-label="Thông báo"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#e85d75] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#e8dfd8] rounded-2xl shadow-xl py-2 z-50 text-xs animate-in fade-in zoom-in-95 duration-100">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-sm">Thông báo</span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-50 text-[#e85d75] font-bold text-[10px]">
                  {unreadCount} mới
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                disabled={loading}
                className="text-[11px] text-[#e85d75] hover:underline font-semibold flex items-center gap-1 cursor-pointer disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" /> Đọc tất cả
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300 opacity-50" />
                <p>Bạn chưa có thông báo nào</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                    n.read_at === null ? 'bg-[#fdfbf7]' : ''
                  }`}
                >
                  <div className="p-2 rounded-xl bg-gray-100 flex-shrink-0 mt-0.5">
                    {getIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1 text-left">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-gray-900 truncate">{n.title}</p>
                      <span className="text-[10px] text-gray-400 whitespace-nowrap">
                        {new Date(n.created_at).toLocaleDateString('vi-VN', {
                          month: 'numeric',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-gray-600 text-[11px] leading-relaxed line-clamp-2">{n.message}</p>
                  </div>

                  {n.read_at === null && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Đánh dấu đã đọc"
                      className="text-gray-400 hover:text-emerald-600 p-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
