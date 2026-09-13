import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { store } from '../../services/storeService';
import {
  X,
  UserPlus,
  LogIn,
  ShoppingBag,
  Shield,
  Truck,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  User as UserIcon,
  Store,
  MapPin,
  Sparkles,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
  defaultMode?: 'REGISTER_BUYER' | 'REGISTER_SELLER' | 'LOGIN' | 'SWITCH_ADMIN';
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess, defaultMode = 'REGISTER_BUYER' }) => {
  const [mode, setMode] = useState<'REGISTER_BUYER' | 'REGISTER_SELLER' | 'LOGIN' | 'SWITCH_ADMIN'>(defaultMode);

  // Buyer Form State
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  // Seller Form State
  const [sellerName, setSellerName] = useState('');
  const [sellerStoreName, setSellerStoreName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [sellerEmail, setSellerEmail] = useState('');
  const [sellerAddress, setSellerAddress] = useState('');
  const [sellerTagline, setSellerTagline] = useState('Sembako Segar & Murah Langsung dari Warung');

  // Login Form State
  const [loginInput, setLoginInput] = useState('');

  // Status feedback
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegisterBuyer = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!buyerName.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }
    if (!buyerPhone.trim() && !buyerEmail.trim()) {
      setError('Harap masukkan nomor WhatsApp atau Email');
      return;
    }

    const res = store.registerBuyer({
      name: buyerName.trim(),
      phone: buyerPhone.trim(),
      email: buyerEmail.trim(),
    });

    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 900);
    } else {
      setError(res.message);
    }
  };

  const handleRegisterSeller = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!sellerName.trim()) {
      setError('Nama pemilik warung wajib diisi');
      return;
    }
    if (!sellerStoreName.trim()) {
      setError('Nama warung / toko wajib diisi');
      return;
    }
    if (!sellerPhone.trim()) {
      setError('Nomor WhatsApp warung wajib diisi');
      return;
    }

    const res = store.registerSeller({
      name: sellerName.trim(),
      phone: sellerPhone.trim(),
      email: sellerEmail.trim(),
      storeName: sellerStoreName.trim(),
      storeAddress: sellerAddress.trim() || 'Lokasi Warung Monapa',
      storeTagline: sellerTagline.trim(),
    });

    if (res.success && res.user) {
      setSuccessMsg(`Selamat! Akun penjual "${sellerStoreName}" berhasil didaftarkan.`);
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 900);
    } else {
      setError(res.message);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loginInput.trim()) {
      setError('Masukkan nomor WhatsApp atau Email Anda');
      return;
    }

    const res = store.loginUser(loginInput);
    if (res.success && res.user) {
      setSuccessMsg(res.message);
      setTimeout(() => {
        onSuccess(res.user!);
        onClose();
      }, 900);
    } else {
      setError(res.message);
    }
  };

  const handleSwitchAdmin = (role: UserRole) => {
    store.switchUserByRole(role);
    const user = store.getCurrentUser();
    setSuccessMsg(
      `Beralih ke akun ${
        role === 'SUPER_ADMIN'
          ? 'Super Admin Pusat'
          : role === 'ADMIN'
          ? 'Admin Warung'
          : role === 'SELLER'
          ? 'Penjual'
          : 'Kurir'
      }`
    );
    setTimeout(() => {
      onSuccess(user);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100 my-auto">
        {/* Header modal */}
        <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-cyan-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>WARUNGKU Monapa • Marketplace Sembako</span>
          </div>
          <h2 className="text-lg sm:text-xl font-black tracking-tight">
            {mode === 'REGISTER_BUYER'
              ? 'Daftar Sebagai Pembeli'
              : mode === 'REGISTER_SELLER'
              ? 'Buka Warung Sendiri (Daftar Penjual)'
              : mode === 'LOGIN'
              ? 'Masuk ke Akun Anda'
              : 'Portal Akses Pengelola & Super Admin'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {mode === 'REGISTER_BUYER'
              ? 'Buat akun pembeli untuk belanja dari semua warung sembako terdaftar dan lacak pesanan.'
              : mode === 'REGISTER_SELLER'
              ? 'Miliki warung digital sendiri! Atur nama warung, katalog produk, pembayaran, dan kurir pengantaran.'
              : mode === 'LOGIN'
              ? 'Masukkan nomor WhatsApp atau email yang pernah Anda daftarkan.'
              : 'Pusat kendali Super Admin Pusat, Admin Toko, dan Kurir.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1.5 gap-1 text-[11px] sm:text-xs font-bold overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER_BUYER');
              setError(null);
            }}
            className={`flex-1 min-w-[90px] py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              mode === 'REGISTER_BUYER'
                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Pembeli</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('REGISTER_SELLER');
              setError(null);
            }}
            className={`flex-1 min-w-[95px] py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              mode === 'REGISTER_SELLER'
                ? 'bg-teal-700 text-white shadow-2xs font-extrabold'
                : 'text-teal-700 hover:bg-teal-50'
            }`}
          >
            <Store className="w-3.5 h-3.5" />
            <span>Buka Warung</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setError(null);
            }}
            className={`flex-1 min-w-[70px] py-2 px-1.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              mode === 'LOGIN'
                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('SWITCH_ADMIN');
              setError(null);
            }}
            className={`py-2 px-2.5 rounded-xl transition flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap ${
              mode === 'SWITCH_ADMIN'
                ? 'bg-purple-900 text-white shadow-2xs font-extrabold'
                : 'text-purple-700 hover:bg-purple-50'
            }`}
            title="Portal Super Admin & Pengelola"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Super Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-xl flex items-center gap-2 font-bold">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: DAFTAR PEMBELI */}
          {mode === 'REGISTER_BUYER' && (
            <form onSubmit={handleRegisterBuyer} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Lengkap Pembeli: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Siti Rahmawati"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nomor WhatsApp: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081234567890"
                    value={buyerPhone}
                    onChange={(e) => setBuyerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  *Untuk verifikasi pesanan dan konfirmasi pengantaran kurir sembako.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Alamat Email (Opsional):
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    placeholder="email.anda@gmail.com"
                    value={buyerEmail}
                    onChange={(e) => setBuyerEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Buat Akun Pembeli & Mulai Belanja</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setMode('REGISTER_SELLER')}
                  className="font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  Mau jualan sembako? Buka Warung
                </button>
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="font-bold text-stone-600 hover:underline cursor-pointer"
                >
                  Sudah punya akun? Masuk
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: DAFTAR PENJUAL (BUKA WARUNG) */}
          {mode === 'REGISTER_SELLER' && (
            <form onSubmit={handleRegisterSeller} className="space-y-3">
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-2xl text-[11px] text-teal-900 leading-relaxed">
                <div className="flex items-center gap-1.5 font-extrabold text-teal-800 mb-1">
                  <Sparkles className="w-4 h-4 text-teal-600" />
                  <span>Keuntungan Membuka Warung di WARUNGKU:</span>
                </div>
                <p>
                  Atur nama warung Anda sendiri, tentukan stok sembako, metode pembayaran toko (COD/Transfer/E-Wallet), serta tarif pengantaran dan kurir sendiri.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nama Pemilik Warung: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Haji Syamsul"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nama Warung / Toko Anda: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Warung Berkah Monapa"
                    value={sellerStoreName}
                    onChange={(e) => setSellerStoreName(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-teal-900 focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Nomor WhatsApp Toko: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="Contoh: 081298765432"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">
                    Email Akun (Opsional):
                  </label>
                  <input
                    type="email"
                    placeholder="warung.berkah@gmail.com"
                    value={sellerEmail}
                    onChange={(e) => setSellerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Alamat Fisik / Lokasi Warung:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Jl. Monapa Raya No. 45, Monapa"
                  value={sellerAddress}
                  onChange={(e) => setSellerAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Slogan / Tagline Warung:
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sembako Terlengkap, Murah & Siap Antar Cepat"
                  value={sellerTagline}
                  onChange={(e) => setSellerTagline(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-teal-600 focus:bg-white outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-teal-700 hover:bg-teal-800 active:scale-95 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs mt-2"
              >
                <Store className="w-4 h-4" />
                <span>Daftarkan Warung & Mulai Berjualan</span>
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-xs font-bold text-stone-600 hover:underline cursor-pointer"
                >
                  Sudah terdaftar sebagai penjual? Masuk di sini
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: MASUK / LOGIN */}
          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nomor WhatsApp atau Email Akun:
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Ketik 08... atau email akun Anda"
                    value={loginInput}
                    onChange={(e) => setLoginInput(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Akun</span>
              </button>

              <div className="flex items-center justify-between text-xs pt-2">
                <button
                  type="button"
                  onClick={() => setMode('REGISTER_BUYER')}
                  className="font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Belum punya akun? Daftar Pembeli
                </button>
                <button
                  type="button"
                  onClick={() => setMode('REGISTER_SELLER')}
                  className="font-bold text-teal-700 hover:underline cursor-pointer"
                >
                  Buka Warung Baru
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: PORTAL SUPER ADMIN & PENGELOLA */}
          {mode === 'SWITCH_ADMIN' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-[11px] text-purple-900 leading-relaxed">
                <strong>Akun Pengelola Pusat & Super Admin:</strong>
                <div className="font-bold text-purple-800 mt-0.5">
                  perdinan.moses34@guru.smp.belajar.id (Perdinan Moses)
                </div>
                <p className="text-purple-600 mt-1">
                  Akses pengawasan menyeluruh: kelola semua akun pembeli dan penjual, batasi atau hapus akun pelanggar, pantau komisi platform, dan atur penarikan dana.
                </p>
              </div>

              <div className="space-y-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleSwitchAdmin('SUPER_ADMIN')}
                  className="w-full p-3 bg-purple-900 hover:bg-purple-800 text-white rounded-2xl flex items-center justify-between text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-purple-300" />
                    <div className="text-left">
                      <div>Masuk sebagai Super Admin Pusat</div>
                      <div className="text-[10px] font-normal text-purple-300">
                        Perdinan Moses • Hak Akses Seluruh Akun & Komisi
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-800 px-2 py-0.5 rounded-full">Pusat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchAdmin('SELLER')}
                  className="w-full p-3 bg-teal-800 hover:bg-teal-900 text-white rounded-2xl flex items-center justify-between text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-teal-300" />
                    <div className="text-left">
                      <div>Masuk sebagai Penjual (Warung Demo)</div>
                      <div className="text-[10px] font-normal text-teal-200">
                        Kelola katalog produk, harga, & pesanan toko sendiri
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-teal-700 px-2 py-0.5 rounded-full">Penjual</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchAdmin('COURIER')}
                  className="w-full p-3 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl flex items-center justify-between text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Truck className="w-4 h-4 text-amber-200" />
                    <div className="text-left">
                      <div>Masuk sebagai Kurir Pengantar</div>
                      <div className="text-[10px] font-normal text-amber-100">
                        Antar pesanan ke alamat pembeli
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-700 px-2 py-0.5 rounded-full">Kurir</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
