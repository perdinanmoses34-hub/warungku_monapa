import React, { useState } from 'react';
import { NotificationItem, UserRole } from '../../types';
import { store } from '../../services/storeService';
import { Bell, CheckCheck, X, Package, Tag, AlertTriangle, Info, Clock } from 'lucide-react';
import { formatDate } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  role: UserRole;
  userId: string;
  onSelectOrder?: (orderId: string) => void;
}

export const NotificationDrawer: React.FC<Props> = ({
  isOpen,
  onClose,
  role,
  userId,
  onSelectOrder,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'ORDER' | 'PROMO' | 'STOCK'>('ALL');
  const allNotifications = store.getNotifications(role, userId);

  const notifications = allNotifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.type === filter;
  });

  const unreadCount = allNotifications.filter((n) => !n.read).length;

  if (!isOpen) return null;

  const handleMarkAllRead = () => {
    store.markAllNotificationsRead();
  };

  const handleClickItem = (item: NotificationItem) => {
    store.markNotificationRead(item.id);
    if (item.orderId && onSelectOrder) {
      onSelectOrder(item.orderId);
      onClose();
    }
  };

  const getIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'ORDER':
        return <Package className="w-5 h-5 text-emerald-600" />;
      case 'PROMO':
        return <Tag className="w-5 h-5 text-amber-600" />;
      case 'STOCK':
        return <AlertTriangle className="w-5 h-5 text-rose-600" />;
      default:
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Bell className="w-5 h-5 text-stone-700" />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">Notifikasi</h2>
              <p className="text-xs text-stone-500">Pemberitahuan status pesanan & info toko</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1 cursor-pointer"
                title="Tandai semua telah dibaca"
              >
                <CheckCheck className="w-4 h-4" />
                Baca Semua
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="px-4 py-2.5 border-b border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          {(['ALL', 'ORDER', 'PROMO', 'STOCK'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                filter === tab
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {tab === 'ALL' && 'Semua'}
              {tab === 'ORDER' && 'Pesanan'}
              {tab === 'PROMO' && 'Promo'}
              {tab === 'STOCK' && 'Stok'}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-stone-400 flex flex-col items-center justify-center h-64">
              <Bell className="w-12 h-12 stroke-1 text-stone-300 mb-2" />
              <p className="font-semibold text-stone-600">Belum Ada Notifikasi</p>
              <p className="text-xs text-stone-400 mt-1 max-w-xs">
                Notifikasi perubahan status pesanan atau promo menarik akan muncul di sini.
              </p>
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item.id}
                onClick={() => handleClickItem(item)}
                className={`p-4 flex gap-3.5 items-start cursor-pointer transition hover:bg-stone-50 ${
                  !item.read ? 'bg-emerald-50/40' : ''
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center shrink-0 mt-0.5">
                  {getIcon(item.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className={`text-xs ${!item.read ? 'font-bold text-stone-900' : 'font-semibold text-stone-800'}`}>
                      {item.title}
                    </p>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-stone-600 mt-0.5 leading-relaxed">
                    {item.message}
                  </p>
                  <div className="flex items-center gap-1 mt-1.5 text-[11px] text-stone-400">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(item.createdAt)}</span>
                    {item.orderId && (
                      <span className="ml-2 text-emerald-600 font-medium">Buka Pesanan →</span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
