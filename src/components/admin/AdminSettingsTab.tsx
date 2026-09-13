import React, { useState } from 'react';
import { PromoVoucher, SystemSettings } from '../../types';
import { store } from '../../services/storeService';
import { formatRupiah } from '../../utils/formatters';
import {
  Settings,
  Store,
  Clock,
  Truck,
  CreditCard,
  Tag,
  Plus,
  Trash2,
  Save,
  Check,
  X,
} from 'lucide-react';

interface Props {
  settings: SystemSettings;
  vouchers: PromoVoucher[];
}

export const AdminSettingsTab: React.FC<Props> = ({ settings, vouchers }) => {
  const [storeName, setStoreName] = useState(settings.storeName);
  const [storeAddress, setStoreAddress] = useState(settings.storeAddress);
  const [storePhone, setStorePhone] = useState(settings.storePhone);

  const [baseFee, setBaseFee] = useState(settings.deliverySettings.baseFee);
  const [freeShippingMinOrder, setFreeShippingMinOrder] = useState(settings.deliverySettings.freeShippingMinOrder);
  const [maxDistanceKm, setMaxDistanceKm] = useState(settings.deliverySettings.maxRadiusKm);
  const [estimatedMinutesBase, setEstimatedMinutesBase] = useState(settings.deliverySettings.estimatedMinutesBase);

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Voucher Add Modal
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [vCode, setVCode] = useState('');
  const [vTitle, setVTitle] = useState('');
  const [vDesc, setVDesc] = useState('');
  const [vType, setVType] = useState<'PERCENT' | 'FIXED' | 'FREE_SHIPPING'>('PERCENT');
  const [vVal, setVVal] = useState(10);
  const [vMinOrder, setVMinOrder] = useState(50000);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings({
      storeName,
      storeAddress,
      storePhone,
      deliverySettings: {
        baseFee: Number(baseFee),
        feePerKm: 2000,
        freeShippingMinOrder: Number(freeShippingMinOrder),
        maxRadiusKm: Number(maxDistanceKm),
        estimatedMinutesBase: Number(estimatedMinutesBase),
      },
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleCreateVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vCode) return;

    store.addVoucher({
      code: vCode.toUpperCase(),
      title: vTitle,
      description: vDesc,
      discountType: vType,
      discountValue: Number(vVal),
      minOrderAmount: Number(vMinOrder),
      isActive: true,
      validUntil: '2026-12-31',
    });

    setShowVoucherModal(false);
  };

  const handleToggleVoucher = (id: string, active: boolean) => {
    store.toggleVoucher(id, active);
  };

  return (
    <div className="space-y-5 text-xs text-stone-900">
      {/* Save indicator */}
      {savedSuccess && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-800 rounded-2xl font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan warung berhasil disimpan!</span>
        </div>
      )}

      {/* General Store Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-4">
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Store className="w-5 h-5 text-emerald-600" />
            <span>Identitas & Kontak Warung</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Nama Toko / Warung:</label>
              <input
                type="text"
                required
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Nomor Telepon / WhatsApp Warung:</label>
              <input
                type="tel"
                required
                value={storePhone}
                onChange={(e) => setStorePhone(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="font-bold text-stone-700 block mb-1">Alamat Fisik Toko:</label>
              <textarea
                rows={2}
                required
                value={storeAddress}
                onChange={(e) => setStoreAddress(e.target.value)}
                className="w-full p-2.5 border border-stone-300 rounded-xl outline-none"
              />
            </div>
          </div>
        </div>

        {/* Delivery & Tariffs */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Truck className="w-5 h-5 text-emerald-600" />
            <span>Ketentuan Ongkos Kirim & Radius Antar</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-stone-700 block mb-1">Ongkos Kirim Dasar (Rp):</label>
              <input
                type="number"
                required
                value={baseFee}
                onChange={(e) => setBaseFee(Number(e.target.value))}
                className="w-full p-2.5 border border-stone-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Min. Belanja Gratis Ongkir (Rp):</label>
              <input
                type="number"
                required
                value={freeShippingMinOrder}
                onChange={(e) => setFreeShippingMinOrder(Number(e.target.value))}
                className="w-full p-2.5 border border-stone-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Maks. Jarak Antar (KM):</label>
              <input
                type="number"
                required
                value={maxDistanceKm}
                onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                className="w-full p-2.5 border border-stone-300 rounded-xl outline-none"
              />
            </div>

            <div>
              <label className="font-bold text-stone-700 block mb-1">Estimasi Waktu Sampai (Menit):</label>
              <input
                type="number"
                required
                value={estimatedMinutesBase}
                onChange={(e) => setEstimatedMinutesBase(Number(e.target.value))}
                className="w-full p-2.5 border border-stone-300 rounded-xl outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Perubahan Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Promo Vouchers Management */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <Tag className="w-5 h-5 text-emerald-600" />
            <span>Kupon & Voucher Diskon Warung</span>
          </div>
          <button
            onClick={() => setShowVoucherModal(true)}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Buat Voucher Baru</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {vouchers.map((v) => (
            <div
              key={v.id}
              className="p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 bg-stone-50"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-black text-stone-900 text-sm">{v.code}</span>
                  <span className={`px-2 py-0.2 rounded-full text-[10px] font-bold ${v.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-500'}`}>
                    {v.isActive ? 'Aktif' : 'Non-aktif'}
                  </span>
                </div>
                <p className="font-bold text-stone-800 text-xs mt-0.5">{v.title}</p>
                <p className="text-[11px] text-stone-500">{v.description}</p>
                <p className="text-[10px] text-stone-400 mt-1">
                  Min. Belanja: {formatRupiah(v.minOrderAmount)} • Berlaku s/d {v.validUntil}
                </p>
              </div>

              <button
                onClick={() => handleToggleVoucher(v.id, !v.isActive)}
                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                  v.isActive ? 'bg-rose-100 text-rose-800 hover:bg-rose-200' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                }`}
              >
                {v.isActive ? 'Matikan' : 'Aktifkan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE VOUCHER MODAL */}
      {showVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-sm">Buat Voucher Promo Baru</h3>
              <button onClick={() => setShowVoucherModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVoucher} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Kode Voucher:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. GAJIANHEMAT"
                  value={vCode}
                  onChange={(e) => setVCode(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Judul Promo:</label>
                <input
                  type="text"
                  required
                  placeholder="Diskon Gajian 15%"
                  value={vTitle}
                  onChange={(e) => setVTitle(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Tipe Diskon:</label>
                  <select
                    value={vType}
                    onChange={(e) => setVType(e.target.value as any)}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  >
                    <option value="PERCENTAGE">Persentase (%)</option>
                    <option value="FIXED">Potongan Tetap (Rp)</option>
                    <option value="FREE_SHIPPING">Gratis Ongkir</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Nilai Potongan:</label>
                  <input
                    type="number"
                    required
                    value={vVal}
                    onChange={(e) => setVVal(Number(e.target.value))}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Min. Belanja (Rp):</label>
                <input
                  type="number"
                  required
                  value={vMinOrder}
                  onChange={(e) => setVMinOrder(Number(e.target.value))}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVoucherModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Simpan Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
