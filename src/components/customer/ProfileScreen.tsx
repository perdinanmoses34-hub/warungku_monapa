import React, { useState } from 'react';
import { Address, Product, SystemSettings, User } from '../../types';
import { store } from '../../services/storeService';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import {
  User as UserIcon,
  MapPin,
  Heart,
  Phone,
  MessageCircle,
  Clock,
  Plus,
  Trash2,
  Edit2,
  Check,
  RotateCcw,
  Smartphone,
  ChevronRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface Props {
  user: User;
  settings: SystemSettings;
  wishlistProducts: Product[];
  onOpenProductDetail: (product: Product) => void;
  onNavigateOrders: () => void;
  onOpenAuth?: () => void;
}

export const ProfileScreen: React.FC<Props> = ({
  user,
  settings,
  wishlistProducts,
  onOpenProductDetail,
  onNavigateOrders,
  onOpenAuth,
}) => {
  const { isInstallable, install } = usePWAInstall();
  const [activeTab, setActiveTab] = useState<'ADDRESS' | 'WISHLIST' | 'INFO'>('ADDRESS');
  const [showAddModal, setShowAddModal] = useState(false);
  const [addressForm, setAddressForm] = useState<Partial<Address>>({
    label: 'Rumah',
    recipientName: user.name,
    phone: user.phone,
    street: '',
    kelurahan: 'Sukamaju',
    kecamatan: 'Cilodong',
    city: 'Depok',
    postalCode: '16415',
    notes: '',
  });

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressForm.street) return;
    store.saveAddress(addressForm);
    setShowAddModal(false);
  };

  const handleSetDefaultAddress = (addressId: string) => {
    store.setDefaultAddress(addressId);
  };

  const handleDeleteAddress = (addressId: string) => {
    if (confirm('Hapus alamat ini?')) {
      store.deleteAddress(addressId);
    }
  };

  const handleResetData = () => {
    if (confirm('Kembalikan semua data ke pengaturan awal demo? Riwayat pesanan dan stok akan direset.')) {
      store.resetToDefault();
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 pb-28 space-y-4 text-stone-900">
      {/* Profile Header Card */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 text-white p-5 rounded-3xl shadow-md flex items-center gap-4">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80'}
          alt={user.name}
          className="w-16 h-16 rounded-2xl object-cover border-2 border-white/80 shadow-sm"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-black tracking-tight truncate">{user.name}</h1>
            <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              Pelanggan Setia
            </span>
          </div>
          <p className="text-xs text-emerald-100 mt-0.5">{user.phone}</p>
          <p className="text-[11px] text-emerald-200 truncate">{user.email || 'Akun Pengguna WARUNGKU'}</p>
        </div>

        {onOpenAuth && (
          <button
            onClick={onOpenAuth}
            className="px-3 py-1.5 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Ganti / Daftar</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="grid grid-cols-3 gap-2 bg-stone-100 p-1 rounded-2xl">
        <button
          onClick={() => setActiveTab('ADDRESS')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'ADDRESS' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600'
          }`}
        >
          <MapPin className="w-3.5 h-3.5" />
          <span>Alamat</span>
        </button>
        <button
          onClick={() => setActiveTab('WISHLIST')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'WISHLIST' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600'
          }`}
        >
          <Heart className="w-3.5 h-3.5" />
          <span>Wishlist ({wishlistProducts.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('INFO')}
          className={`py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 ${
            activeTab === 'INFO' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-stone-600'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Bantuan & Info</span>
        </button>
      </div>

      {/* TAB 1: ALAMAT TERSIMPAN */}
      {activeTab === 'ADDRESS' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-800">Daftar Alamat Pengantaran</h2>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Tambah Alamat
            </button>
          </div>

          <div className="space-y-2.5">
            {user.addresses.map((addr) => (
              <div
                key={addr.id}
                className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-stone-900">{addr.recipientName}</span>
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[10px]">
                      {addr.label}
                    </span>
                    {addr.isDefault && (
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        Utama
                      </span>
                    )}
                  </div>
                  <p className="text-stone-500 mt-1">{addr.phone}</p>
                  <p className="text-stone-700 mt-0.5">
                    {addr.street}, Kel. {addr.kelurahan}, Kec. {addr.kecamatan}, {addr.city} {addr.postalCode}
                  </p>
                  {addr.notes && (
                    <p className="text-amber-700 text-[11px] mt-0.5">Patokan: {addr.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl font-semibold transition cursor-pointer text-[11px]"
                    >
                      Jadikan Utama
                    </button>
                  )}
                  {user.addresses.length > 1 && (
                    <button
                      onClick={() => handleDeleteAddress(addr.id)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 rounded-xl transition cursor-pointer"
                      title="Hapus Alamat"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: WISHLIST / PRODUK FAVORIT */}
      {activeTab === 'WISHLIST' && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-stone-800">Produk Sembako Favorit Anda</h2>

          {wishlistProducts.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
              <Heart className="w-10 h-10 mx-auto mb-2 text-stone-300" />
              <p className="font-bold text-stone-700 text-xs">Belum Ada Produk yang Disimpan</p>
              <p className="text-[11px] text-stone-400 mt-0.5">
                Ketuk ikon hati pada produk untuk menyimpannya ke daftar belanja favorit.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {wishlistProducts.map((p) => (
                <div
                  key={p.id}
                  onClick={() => onOpenProductDetail(p)}
                  className="bg-white p-3 rounded-2xl border border-stone-200 cursor-pointer hover:border-emerald-400 transition"
                >
                  <img src={p.imageUrl} alt={p.name} className="w-full aspect-square object-cover rounded-xl mb-2" />
                  <p className="font-bold text-xs text-stone-800 line-clamp-1">{p.name}</p>
                  <p className="text-xs font-black text-emerald-700 mt-1">
                    {formatRupiah(p.promoPrice || p.normalPrice)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: BANTUAN & INFO TOKO */}
      {activeTab === 'INFO' && (
        <div className="space-y-3 text-xs">
          {/* Seller registration card */}
          {onOpenAuth && (
            <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl flex items-center justify-between gap-3">
              <div>
                <p className="font-bold text-teal-900 text-xs">Punya Warung Sembako Sendiri?</p>
                <p className="text-[11px] text-teal-700">Daftarkan warung Anda, atur produk, harga & kurir sendiri</p>
              </div>
              <button
                onClick={onOpenAuth}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl text-xs transition cursor-pointer shrink-0"
              >
                Buka Warung
              </button>
            </div>
          )}

          {/* WhatsApp Direct Contact */}
          <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-emerald-950">Layanan Pelanggan WhatsApp</p>
                <p className="text-[11px] text-emerald-700">Hubungi langsung pemilik warung untuk tanya sembako</p>
              </div>
            </div>
            <a
              href={`https://wa.me/${settings.storePhone}?text=Halo%20WARUNGKU%20saya%20ingin%20bertanya`}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
            >
              Chat WA
            </a>
          </div>

          {/* Operating hours info */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200 space-y-2">
            <p className="font-bold text-stone-800 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-emerald-600" />
              Jam Operasional Warung
            </p>
            <div className="divide-y divide-stone-100 text-[11px] text-stone-600">
              {Object.entries(settings.operatingHours).map(([day, sched]) => {
                const hour = sched as { open: string; close: string; isOpen?: boolean };
                return (
                  <div key={day} className="py-1.5 flex justify-between">
                    <span>{day}</span>
                    <span className="font-semibold text-stone-800">{hour.open} - {hour.close} WIB</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* PWA manual install button if browser supports */}
          {isInstallable && (
            <div className="bg-stone-900 text-white p-4 rounded-2xl flex items-center justify-between">
              <div>
                <p className="font-bold text-white text-xs">Install Aplikasi WARUNGKU</p>
                <p className="text-[11px] text-stone-400">Tambahkan ke homescreen tanpa lewat PlayStore</p>
              </div>
              <button
                onClick={install}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 font-bold rounded-xl text-xs"
              >
                Install
              </button>
            </div>
          )}

          {/* Reset Demo Data Button */}
          <div className="pt-2">
            <button
              onClick={handleResetData}
              className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-800 font-bold rounded-2xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset Data Demo ke Awal</span>
            </button>
          </div>
        </div>
      )}

      {/* MODAL TAMBAH ALAMAT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-3 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-sm">Tambah Alamat Baru</h3>
              <button onClick={() => setShowAddModal(false)} className="text-stone-400 hover:text-stone-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAddress} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Label Alamat:</label>
                <input
                  type="text"
                  required
                  placeholder="Rumah / Kantor / Kos"
                  value={addressForm.label}
                  onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Penerima:</label>
                <input
                  type="text"
                  required
                  value={addressForm.recipientName}
                  onChange={(e) => setAddressForm({ ...addressForm, recipientName: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">No. HP / WA:</label>
                <input
                  type="tel"
                  required
                  value={addressForm.phone}
                  onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>
              <div>
                <label className="font-bold text-stone-700 block mb-1">Alamat Lengkap:</label>
                <textarea
                  rows={2}
                  required
                  value={addressForm.street}
                  onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                  placeholder="Jl. Melati No. 24 RT 03/05"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
