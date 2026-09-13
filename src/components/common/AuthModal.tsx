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
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: User) => void;
}

export const AuthModal: React.FC<Props> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN' | 'SWITCH_ADMIN'>('REGISTER');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [loginInput, setLoginInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Nama lengkap wajib diisi');
      return;
    }
    if (!phone.trim() && !email.trim()) {
      setError('Harap masukkan nomor WhatsApp atau Email');
      return;
    }

    const res = store.registerUser({
      name,
      phone,
      email,
      role: 'CUSTOMER',
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
    setSuccessMsg(`Beralih ke akun ${role === 'SUPER_ADMIN' ? 'Super Admin Pusat' : role === 'ADMIN' ? 'Admin Warung' : 'Kurir'}`);
    setTimeout(() => {
      onSuccess(user);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-100">
        {/* Header modal */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-full hover:bg-white/10 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-300 uppercase tracking-wider mb-1">
            <ShoppingBag className="w-4 h-4" />
            <span>WARUNGKU Monapa</span>
          </div>
          <h2 className="text-xl font-black tracking-tight">
            {mode === 'REGISTER'
              ? 'Daftar Akun Belanja Baru'
              : mode === 'LOGIN'
              ? 'Masuk ke Akun Anda'
              : 'Portal Akses Admin & Kurir'}
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1">
            {mode === 'REGISTER'
              ? 'Buat akun pelanggan untuk mulai belanja sembako, lacak pesanan, dan dapatkan promo.'
              : mode === 'LOGIN'
              ? 'Masukkan nomor WhatsApp atau email yang pernah didaftarkan.'
              : 'Pusat kendali operasional, gudang sembako, dan pengantaran kurir.'}
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex border-b border-stone-200 bg-stone-50 p-1.5 gap-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'REGISTER' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Baru</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setError(null);
            }}
            className={`flex-1 py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'LOGIN' ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' : 'text-stone-500 hover:text-stone-800'
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
            className={`py-2 px-3 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
              mode === 'SWITCH_ADMIN' ? 'bg-purple-900 text-white shadow-2xs font-extrabold' : 'text-purple-700 hover:bg-purple-50'
            }`}
            title="Akses Pengelola Warung & Admin"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
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

          {mode === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nama Lengkap: <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Siti Rahmawati"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                    placeholder="Contoh: 08123456789"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none"
                  />
                </div>
                <p className="text-[10px] text-stone-400 mt-1">
                  *Untuk notifikasi pengantaran dan konfirmasi kurir sembako.
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:bg-white outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-black rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>Buat Akun & Mulai Belanja</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Sudah punya akun? Masuk di sini
                </button>
              </div>
            </form>
          )}

          {mode === 'LOGIN' && (
            <form onSubmit={handleLogin} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Nomor WhatsApp atau Email:
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
                <span>Masuk ke Akun Belanja</span>
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setMode('REGISTER')}
                  className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                >
                  Belum punya akun? Buat akun sekarang
                </button>
              </div>
            </form>
          )}

          {mode === 'SWITCH_ADMIN' && (
            <div className="space-y-2.5">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-[11px] text-purple-900 leading-relaxed">
                <strong>Akun Pengelola Pusat Terhubung:</strong>
                <div className="font-bold text-purple-800 mt-0.5">
                  perdinan.moses34@guru.smp.belajar.id (Super Admin)
                </div>
                <p className="text-purple-600 mt-1">
                  Akun Super Admin memiliki wewenang penuh melihat seluruh pesanan pelanggan, mengatur produk, dan mengubah konfigurasi.
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
                        Perdinan Moses • Akses Penuh
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-purple-800 px-2 py-0.5 rounded-full">Pusat</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSwitchAdmin('ADMIN')}
                  className="w-full p-3 bg-blue-700 hover:bg-blue-800 text-white rounded-2xl flex items-center justify-between text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <Store className="w-4 h-4 text-blue-300" />
                    <div className="text-left">
                      <div>Masuk sebagai Admin Warung</div>
                      <div className="text-[10px] font-normal text-blue-200">
                        Kelola stok gudang, konfirmasi pesanan
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded-full">Toko</span>
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
                        Antar pesanan ke rumah pelanggan
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
