import React, { useState } from 'react';
import { SellerStoreProfile, User } from '../../types';
import { store } from '../../services/storeService';
import { formatRupiah } from '../../utils/formatters';
import {
  Store,
  CreditCard,
  Truck,
  MapPin,
  Phone,
  Mail,
  Plus,
  Trash2,
  Save,
  Check,
  AlertCircle,
  Clock,
  Sparkles,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';

interface Props {
  currentUser: User;
}

export const AdminSellerProfileTab: React.FC<Props> = ({ currentUser }) => {
  const profile = currentUser.storeProfile || {
    storeName: currentUser.name,
    storeTagline: 'Sembako Segar & Terlengkap',
    storeDescription: `Warung resmi milik ${currentUser.name}.`,
    storeAddress: currentUser.addresses[0]?.street || 'Depok',
    storePhone: currentUser.phone,
    storeEmail: currentUser.email,
    isOpen: true,
    rating: 5.0,
    totalOrders: 0,
    paymentMethods: {
      codEnabled: true,
      bankTransferEnabled: true,
      ewalletEnabled: true,
    },
    bankAccounts: [
      {
        id: 'bank-1',
        bankName: 'BCA',
        accountNumber: '7140001234',
        accountHolder: currentUser.name.toUpperCase(),
      }
    ],
    ewallets: [
      {
        id: 'ew-1',
        walletName: 'GoPay',
        phoneNumber: currentUser.phone,
        accountHolder: currentUser.name,
      }
    ],
    deliverySettings: {
      baseFee: 5000,
      feePerKm: 2000,
      freeShippingMinOrder: 50000,
      maxRadiusKm: 10,
      estimatedMinutesBase: 25,
      deliveryFleetName: `Kurir ${currentUser.name}`,
    },
  };

  const [storeName, setStoreName] = useState(profile.storeName);
  const [storeTagline, setStoreTagline] = useState(profile.storeTagline || '');
  const [storeDescription, setStoreDescription] = useState(profile.storeDescription || '');
  const [storeAddress, setStoreAddress] = useState(profile.storeAddress || '');
  const [storePhone, setStorePhone] = useState(profile.storePhone || '');
  const [isOpen, setIsOpen] = useState(profile.isOpen ?? true);

  // Payment methods
  const [codEnabled, setCodEnabled] = useState(profile.paymentMethods?.codEnabled ?? true);
  const [bankTransferEnabled, setBankTransferEnabled] = useState(profile.paymentMethods?.bankTransferEnabled ?? true);
  const [ewalletEnabled, setEwalletEnabled] = useState(profile.paymentMethods?.ewalletEnabled ?? true);

  // Bank accounts
  const [bankAccounts, setBankAccounts] = useState(profile.bankAccounts || []);
  const [newBankName, setNewBankName] = useState('');
  const [newAccNumber, setNewAccNumber] = useState('');
  const [newAccHolder, setNewAccHolder] = useState('');

  // E-wallets
  const [ewallets, setEwallets] = useState(profile.ewallets || []);
  const [newWalletName, setNewWalletName] = useState('');
  const [newWalletPhone, setNewWalletPhone] = useState('');
  const [newWalletHolder, setNewWalletHolder] = useState('');

  // Delivery settings
  const [baseFee, setBaseFee] = useState(profile.deliverySettings?.baseFee ?? 5000);
  const [feePerKm, setFeePerKm] = useState(profile.deliverySettings?.feePerKm ?? 2000);
  const [freeShippingMinOrder, setFreeShippingMinOrder] = useState(profile.deliverySettings?.freeShippingMinOrder ?? 50000);
  const [maxRadiusKm, setMaxRadiusKm] = useState(profile.deliverySettings?.maxRadiusKm ?? 10);
  const [estimatedMinutesBase, setEstimatedMinutesBase] = useState(profile.deliverySettings?.estimatedMinutesBase ?? 25);
  const [deliveryFleetName, setDeliveryFleetName] = useState(profile.deliverySettings?.deliveryFleetName || `Kurir ${currentUser.name}`);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankName.trim() || !newAccNumber.trim()) return;
    const newAcc = {
      id: `bank-${Date.now()}`,
      bankName: newBankName.trim(),
      accountNumber: newAccNumber.trim(),
      accountHolder: newAccHolder.trim() || currentUser.name,
    };
    setBankAccounts([...bankAccounts, newAcc]);
    setNewBankName('');
    setNewAccNumber('');
    setNewAccHolder('');
  };

  const handleRemoveBank = (id: string) => {
    setBankAccounts(bankAccounts.filter((b) => b.id !== id));
  };

  const handleAddEwallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWalletName.trim() || !newWalletPhone.trim()) return;
    const newW = {
      id: `ew-${Date.now()}`,
      walletName: newWalletName.trim(),
      phoneNumber: newWalletPhone.trim(),
      accountHolder: newWalletHolder.trim() || currentUser.name,
    };
    setEwallets([...ewallets, newW]);
    setNewWalletName('');
    setNewWalletPhone('');
    setNewWalletHolder('');
  };

  const handleRemoveEwallet = (id: string) => {
    setEwallets(ewallets.filter((e) => e.id !== id));
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: Partial<SellerStoreProfile> = {
      storeName: storeName.trim(),
      storeTagline: storeTagline.trim(),
      storeDescription: storeDescription.trim(),
      storeAddress: storeAddress.trim(),
      storePhone: storePhone.trim(),
      isOpen,
      paymentMethods: {
        codEnabled,
        bankTransferEnabled,
        ewalletEnabled,
      },
      bankAccounts,
      ewallets,
      deliverySettings: {
        baseFee: Number(baseFee),
        feePerKm: Number(feePerKm),
        freeShippingMinOrder: Number(freeShippingMinOrder),
        maxRadiusKm: Number(maxRadiusKm),
        estimatedMinutesBase: Number(estimatedMinutesBase),
        deliveryFleetName: deliveryFleetName.trim(),
      },
    };

    store.updateSellerStoreProfile(currentUser.id, updatedProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 text-xs text-stone-900 animate-in fade-in">
      {savedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-900 rounded-2xl font-bold flex items-center gap-2 shadow-xs">
          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Pengaturan dan identitas Warung Anda berhasil disimpan!</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-teal-800 to-emerald-800 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-teal-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-teal-200">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-white">
                  {storeName || 'Warung Saya'}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    isOpen ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-rose-400/20 text-rose-200 border border-rose-400/30'
                  }`}
                >
                  {isOpen ? '🟢 Warung Buka' : '🔴 Warung Tutup'}
                </span>
              </div>
              <p className="text-teal-100/80 text-[11px] mt-0.5">
                Atur nama warung, nomor kontak, rekening pembayaran, dan ongkos kirim pengantaran sendiri.
              </p>
            </div>
          </div>

          {/* Toggle Store Status */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              isOpen ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isOpen ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
            <span>{isOpen ? 'Status: BUKA' : 'Status: TUTUP'}</span>
          </button>
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveProfile} className="space-y-5">
        {/* SECTION 1: PROFIL & NAMA WARUNG */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-black text-sm border-b border-stone-100 pb-2">
            <Store className="w-4 h-4 text-teal-600" />
            <span>Identitas & Nama Warung</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nama Warung Anda: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Contoh: Warung Berkah Makmur"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:bg-white focus:ring-2 focus:ring-teal-600 outline-none"
              />
              <p className="text-[10px] text-stone-400 mt-1">
                Nama ini akan muncul pada katalog produk, keranjang, dan nota pelanggan.
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Slogan / Tagline Warung:
              </label>
              <input
                type="text"
                value={storeTagline}
                onChange={(e) => setStoreTagline(e.target.value)}
                placeholder="Contoh: Sembako Segar, Murah & Siap Antar"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Alamat Fisik / Lokasi Warung: <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                placeholder="Contoh: Jl. Nusantara No. 12, RT 02/04, Cilodong"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nomor WhatsApp Toko: <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                placeholder="Contoh: 081234567890"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block font-bold text-stone-700 mb-1">
                Deskripsi Singkat Warung:
              </label>
              <textarea
                rows={2}
                value={storeDescription}
                onChange={(e) => setStoreDescription(e.target.value)}
                placeholder="Jelaskan jenis sembako yang Anda sediakan..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white focus:ring-2 focus:ring-teal-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: METODE PEMBAYARAN WARUNG */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-black text-sm border-b border-stone-100 pb-2">
            <CreditCard className="w-4 h-4 text-teal-600" />
            <span>Pengaturan Metode Pembayaran Warung</span>
          </div>

          {/* Toggle Switches */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <label className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100">
              <input
                type="checkbox"
                checked={codEnabled}
                onChange={(e) => setCodEnabled(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
              <span className="font-bold text-stone-800">Bayar di Tempat (COD)</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100">
              <input
                type="checkbox"
                checked={bankTransferEnabled}
                onChange={(e) => setBankTransferEnabled(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
              <span className="font-bold text-stone-800">Transfer Bank</span>
            </label>

            <label className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-2xl cursor-pointer hover:bg-stone-100">
              <input
                type="checkbox"
                checked={ewalletEnabled}
                onChange={(e) => setEwalletEnabled(e.target.checked)}
                className="w-4 h-4 accent-teal-600 rounded cursor-pointer"
              />
              <span className="font-bold text-stone-800">E-Wallet (GoPay/OVO/DANA)</span>
            </label>
          </div>

          {/* Bank accounts list & add form */}
          {bankTransferEnabled && (
            <div className="space-y-3 pt-2">
              <div className="font-bold text-stone-700">Daftar Rekening Bank Toko Anda:</div>
              <div className="space-y-2">
                {bankAccounts.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-extrabold text-stone-900">{b.bankName} - {b.accountNumber}</div>
                      <div className="text-[11px] text-stone-500">a.n. {b.accountHolder}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveBank(b.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus rekening"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add bank input */}
              <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-2xl space-y-2">
                <div className="font-bold text-stone-700 text-[11px]">Tambah Rekening Bank Baru:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama Bank (BCA, Mandiri, BRI, dll)"
                    value={newBankName}
                    onChange={(e) => setNewBankName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Nomor Rekening"
                    value={newAccNumber}
                    onChange={(e) => setNewAccNumber(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Atas Nama"
                    value={newAccHolder}
                    onChange={(e) => setNewAccHolder(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddBank}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah Rekening</span>
                </button>
              </div>
            </div>
          )}

          {/* E-Wallets list & add form */}
          {ewalletEnabled && (
            <div className="space-y-3 pt-2">
              <div className="font-bold text-stone-700">Daftar Nomor E-Wallet Toko Anda:</div>
              <div className="space-y-2">
                {ewallets.map((ew) => (
                  <div
                    key={ew.id}
                    className="p-3 bg-stone-50 border border-stone-200 rounded-2xl flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-extrabold text-stone-900">{ew.walletName} - {ew.phoneNumber}</div>
                      <div className="text-[11px] text-stone-500">a.n. {ew.accountHolder}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveEwallet(ew.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg cursor-pointer"
                      title="Hapus e-wallet"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add ewallet input */}
              <div className="p-3 bg-stone-50 border border-dashed border-stone-300 rounded-2xl space-y-2">
                <div className="font-bold text-stone-700 text-[11px]">Tambah E-Wallet Baru:</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Nama E-Wallet (GoPay, OVO, DANA, dll)"
                    value={newWalletName}
                    onChange={(e) => setNewWalletName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                  <input
                    type="tel"
                    placeholder="Nomor HP E-Wallet"
                    value={newWalletPhone}
                    onChange={(e) => setNewWalletPhone(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Atas Nama"
                    value={newWalletHolder}
                    onChange={(e) => setNewWalletHolder(e.target.value)}
                    className="px-2.5 py-1.5 bg-white border border-stone-200 rounded-xl text-xs"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddEwallet}
                  className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tambah E-Wallet</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* SECTION 3: PENGATURAN PENGANTARAN & ONGKIR WARUNG */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-black text-sm border-b border-stone-100 pb-2">
            <Truck className="w-4 h-4 text-teal-600" />
            <span>Pengaturan Pengantaran & Kurir Warung</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Ongkos Kirim Dasar (Rp):
              </label>
              <input
                type="number"
                value={baseFee}
                onChange={(e) => setBaseFee(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-stone-900 focus:bg-white outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Tarif Tambahan Per Km (Rp):
              </label>
              <input
                type="number"
                value={feePerKm}
                onChange={(e) => setFeePerKm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Minimal Belanja Gratis Ongkir (Rp):
              </label>
              <input
                type="number"
                value={freeShippingMinOrder}
                onChange={(e) => setFreeShippingMinOrder(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-bold text-emerald-800 focus:bg-white outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Radius Maksimal Pengantaran (Km):
              </label>
              <input
                type="number"
                value={maxRadiusKm}
                onChange={(e) => setMaxRadiusKm(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Estimasi Waktu Pengantaran (Menit):
              </label>
              <input
                type="number"
                value={estimatedMinutesBase}
                onChange={(e) => setEstimatedMinutesBase(Number(e.target.value))}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Nama Armada Kurir Warung:
              </label>
              <input
                type="text"
                value={deliveryFleetName}
                onChange={(e) => setDeliveryFleetName(e.target.value)}
                placeholder="Contoh: Kurir Toko Cepat"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs text-stone-900 focus:bg-white outline-none focus:ring-2 focus:ring-teal-600"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-teal-600 hover:bg-teal-700 active:scale-95 text-white font-black rounded-2xl shadow-lg transition flex items-center gap-2 cursor-pointer text-xs"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan Warung</span>
          </button>
        </div>
      </form>
    </div>
  );
};
