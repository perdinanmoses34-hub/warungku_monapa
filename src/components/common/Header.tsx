import React, { useState } from 'react';
import { User, UserRole, SystemSettings } from '../../types';
import { store } from '../../services/storeService';
import {
  Store,
  MapPin,
  Bell,
  ShoppingCart,
  Search,
  UserCheck,
  ChevronDown,
  Clock,
  Shield,
  Truck,
  User as UserIcon,
} from 'lucide-react';

interface Props {
  currentUser: User;
  cartCount: number;
  unreadNotifsCount: number;
  settings: SystemSettings;
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onOpenNotifications: () => void;
  onOpenCart: () => void;
  onOpenSearch: () => void;
}

export const Header: React.FC<Props> = ({
  currentUser,
  cartCount,
  unreadNotifsCount,
  settings,
  activeScreen,
  onNavigate,
  onOpenNotifications,
  onOpenCart,
  onOpenSearch,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  // Check if store is open based on today's operating hours
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const todayName = days[new Date().getDay()];
  const todaySchedule = settings.operatingHours[todayName] || { open: '06:30', close: '21:30', isOpen: true };

  const defaultAddress = currentUser.addresses.find((a) => a.isDefault) || currentUser.addresses[0];

  const handleSwitchRole = (role: UserRole) => {
    store.switchUserByRole(role);
    setShowRoleMenu(false);
  };

  const getRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return { label: 'Super Admin', bg: 'bg-purple-100 text-purple-800 border-purple-200' };
      case 'ADMIN':
        return { label: 'Admin Warung', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'COURIER':
        return { label: 'Kurir', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'CUSTOMER':
        return { label: 'Pelanggan', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    }
  };

  const roleInfo = getRoleBadge(currentUser.role);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-2xs transition-colors">
      {/* Top micro bar for store hours & Role Switcher */}
      <div className="bg-emerald-700 text-emerald-50 px-3.5 py-1 text-[11px] font-medium flex items-center justify-between">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3 text-emerald-300" />
            <span className="font-semibold text-white">Buka:</span> {todaySchedule.open} - {todaySchedule.close} WIB
          </span>
          <span className="hidden sm:inline text-emerald-300">|</span>
          <span className="hidden sm:inline truncate text-emerald-100">
            Gratis Ongkir Min. Belanja Rp {settings.deliverySettings.freeShippingMinOrder.toLocaleString('id-ID')}
          </span>
        </div>

        {/* Quick Role Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-1.5 bg-emerald-800/80 hover:bg-emerald-900/90 text-white px-2 py-0.5 rounded-full text-[11px] font-medium transition cursor-pointer border border-emerald-600/50"
            title="Ganti Mode Pengguna"
          >
            <UserCheck className="w-3 h-3 text-emerald-300" />
            <span>Mode: <strong className="font-bold">{roleInfo.label}</strong></span>
            <ChevronDown className="w-3 h-3 opacity-70" />
          </button>

          {showRoleMenu && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white rounded-xl shadow-xl border border-stone-200 p-1 text-stone-800 z-50 animate-in fade-in zoom-in-95">
              <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                Pilih Peran Pengguna
              </div>
              <button
                onClick={() => handleSwitchRole('CUSTOMER')}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition cursor-pointer ${
                  currentUser.role === 'CUSTOMER' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'hover:bg-stone-50'
                }`}
              >
                <UserIcon className="w-4 h-4 text-emerald-600" />
                <div>
                  <div>Pelanggan (Customer)</div>
                  <div className="text-[10px] font-normal text-stone-400">Belanja sembako & checkout</div>
                </div>
              </button>

              <button
                onClick={() => handleSwitchRole('COURIER')}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition cursor-pointer ${
                  currentUser.role === 'COURIER' ? 'bg-amber-50 text-amber-700 font-bold' : 'hover:bg-stone-50'
                }`}
              >
                <Truck className="w-4 h-4 text-amber-600" />
                <div>
                  <div>Kurir Pengantar</div>
                  <div className="text-[10px] font-normal text-stone-400">Antar barang & navigasi peta</div>
                </div>
              </button>

              <button
                onClick={() => handleSwitchRole('ADMIN')}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition cursor-pointer ${
                  currentUser.role === 'ADMIN' ? 'bg-blue-50 text-blue-700 font-bold' : 'hover:bg-stone-50'
                }`}
              >
                <Store className="w-4 h-4 text-blue-600" />
                <div>
                  <div>Admin Warung</div>
                  <div className="text-[10px] font-normal text-stone-400">Kelola pesanan, produk, & stok</div>
                </div>
              </button>

              <button
                onClick={() => handleSwitchRole('SUPER_ADMIN')}
                className={`w-full text-left px-3 py-2 text-xs rounded-lg flex items-center gap-2 transition cursor-pointer ${
                  currentUser.role === 'SUPER_ADMIN' ? 'bg-purple-50 text-purple-700 font-bold' : 'hover:bg-stone-50'
                }`}
              >
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <div className="truncate">
                  <div>Super Admin (Perdinan Moses)</div>
                  <div className="text-[10px] font-normal text-stone-400 truncate">perdinan.moses34@guru.smp.belajar.id</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Bar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Logo & Warung Title */}
        <div
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20 font-black text-lg">
            WK
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-base sm:text-lg font-black tracking-tight text-emerald-800">
                {settings.storeName}
              </span>
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                SEMBAKO ONLINE
              </span>
            </div>
            {/* Delivery address snippet */}
            <div className="flex items-center gap-1 text-[11px] text-stone-500 max-w-[160px] sm:max-w-xs truncate">
              <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
              <span className="truncate">
                {defaultAddress ? `${defaultAddress.recipientName} • ${defaultAddress.street}` : 'Pilih Alamat Pengiriman'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Search trigger (clickable mockup for mobile and desktop) */}
        <div
          onClick={onOpenSearch}
          className="flex-1 max-w-md hidden md:flex items-center gap-2.5 bg-stone-100 hover:bg-stone-200/70 text-stone-500 px-3.5 py-2 rounded-xl text-xs cursor-pointer transition border border-stone-200/70"
        >
          <Search className="w-4 h-4 text-stone-400" />
          <span className="truncate">Cari beras, minyak goreng, telur, gula, bumbu...</span>
          <kbd className="ml-auto hidden lg:inline-block bg-white px-1.5 py-0.5 text-[10px] text-stone-400 border border-stone-200 rounded">
            Cari
          </kbd>
        </div>

        {/* Action icons (Search on mobile, Notif, Cart) */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mobile Search Button */}
          <button
            onClick={onOpenSearch}
            className="md:hidden p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition cursor-pointer"
            aria-label="Cari Produk"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Notifications Button */}
          <button
            onClick={onOpenNotifications}
            className="p-2 text-stone-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition relative cursor-pointer"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {unreadNotifsCount > 0 && (
              <span className="absolute top-1 right-1 min-w-4 h-4 px-1 bg-rose-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse">
                {unreadNotifsCount}
              </span>
            )}
          </button>

          {/* Cart Button (for Customer view) */}
          {(currentUser.role === 'CUSTOMER') && (
            <button
              onClick={onOpenCart}
              className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition active:scale-95 cursor-pointer"
              aria-label="Keranjang Belanja"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-amber-400 text-stone-900 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-emerald-600">
                    {cartCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline font-bold text-xs">Keranjang</span>
            </button>
          )}

          {/* Admin shortcut button if admin/superadmin is logged in */}
          {(currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') && (
            <button
              onClick={() => onNavigate(activeScreen === 'admin' ? 'home' : 'admin')}
              className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>{activeScreen === 'admin' ? 'Tampilan Toko' : 'Dashboard Admin'}</span>
            </button>
          )}

          {/* Courier shortcut */}
          {currentUser.role === 'COURIER' && (
            <button
              onClick={() => onNavigate(activeScreen === 'courier' ? 'home' : 'courier')}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Truck className="w-3.5 h-3.5" />
              <span>{activeScreen === 'courier' ? 'Tampilan Toko' : 'Tugas Kurir'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
