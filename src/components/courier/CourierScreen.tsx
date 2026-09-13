import React, { useState } from 'react';
import { Order, User, SystemSettings } from '../../types';
import { formatRupiah, formatDate, formatWeight } from '../../utils/formatters';
import { store } from '../../services/storeService';
import {
  Truck,
  MapPin,
  Phone,
  MessageCircle,
  Navigation,
  CheckCircle2,
  Camera,
  AlertTriangle,
  Banknote,
  Clock,
  Package,
  ChevronRight,
  UserCheck,
  X,
  Upload,
} from 'lucide-react';

interface Props {
  currentUser: User;
  settings: SystemSettings;
  orders: Order[];
}

export const CourierScreen: React.FC<Props> = ({
  currentUser,
  settings,
  orders,
}) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [selectedTab, setSelectedTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [activeTaskOrder, setActiveTaskOrder] = useState<Order | null>(null);

  // Completion modal state
  const [showCompleteModal, setShowCompleteModal] = useState<Order | null>(null);
  const [recipientRelation, setRecipientRelation] = useState<string>('Penerima Langsung');
  const [codAmountReceived, setCodAmountReceived] = useState<number>(0);
  const [deliveryProofImage, setDeliveryProofImage] = useState<string>('');

  // Active tasks: ready for pickup, on delivery, or arrived
  const activeOrders = orders.filter((o) =>
    ['READY_FOR_PICKUP', 'ON_DELIVERY', 'ARRIVED'].includes(o.orderStatus) &&
    o.deliveryMethod === 'DELIVERY'
  );

  // Completed tasks by this courier
  const completedOrders = orders.filter((o) =>
    o.orderStatus === 'COMPLETED' && o.deliveryMethod === 'DELIVERY'
  );

  // Daily recap
  const totalCompletedToday = completedOrders.length;
  const totalCodCollected = completedOrders
    .filter((o) => o.paymentMethod === 'COD')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  // Handle pickup from warung
  const handlePickupOrder = (orderId: string) => {
    store.assignCourier(orderId, currentUser.name, currentUser.phone, 'Honda Vario B 4521 SXZ');
    store.updateOrderStatus(orderId, 'ON_DELIVERY');
  };

  // Handle arrived at location
  const handleMarkArrived = (orderId: string) => {
    store.updateOrderStatus(orderId, 'ARRIVED');
  };

  // Open Google Maps
  const handleOpenNavigation = (order: Order) => {
    if (!order.shippingAddress) return;
    const query = encodeURIComponent(
      `${order.shippingAddress.street}, ${order.shippingAddress.kelurahan}, ${order.shippingAddress.kecamatan}`
    );
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // Handle proof photo upload simulation
  const handleProofPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setDeliveryProofImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit completion
  const handleFinishDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showCompleteModal) return;

    // If COD, mark payment confirmed
    if (showCompleteModal.paymentMethod === 'COD') {
      store.updateOrderPayment(showCompleteModal.id, 'PAID', deliveryProofImage);
    }

    store.updateOrderStatus(showCompleteModal.id, 'COMPLETED');
    alert(`Pengantaran pesanan ${showCompleteModal.orderNumber} berhasil diselesaikan!`);
    setShowCompleteModal(null);
    setDeliveryProofImage('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 py-4 pb-28 space-y-4 text-stone-900 overflow-x-hidden">
      {/* Courier Profile & Status Toggle */}
      <div className="bg-stone-900 text-white p-4 sm:p-5 rounded-3xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-stone-950 flex items-center justify-center font-black text-xl shadow-md">
            🏍️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-black tracking-tight">{currentUser.name}</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Kurir Sembako
              </span>
            </div>
            <p className="text-xs text-stone-400 mt-0.5">Motor: Honda Vario 160 (B 4521 SXZ)</p>
          </div>
        </div>

        {/* Online/Offline Toggle */}
        <div className="flex items-center gap-3 bg-stone-800 p-2 rounded-2xl border border-stone-700">
          <span className="text-xs font-bold text-stone-300">Status Kurir:</span>
          <button
            onClick={() => setIsOnline(!isOnline)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              isOnline ? 'bg-emerald-600 text-white shadow-xs' : 'bg-rose-600 text-white'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-300 animate-pulse' : 'bg-rose-300'}`} />
            <span>{isOnline ? 'Siap Antar' : 'Istirahat'}</span>
          </button>
        </div>
      </div>

      {/* Recap Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Tugas Hari Ini</span>
          <span className="text-xl font-black text-stone-900">{totalCompletedToday} Selesai</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">Pengantaran sukses</span>
        </div>
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Titipan Uang COD</span>
          <span className="text-xl font-black text-amber-700">{formatRupiah(totalCodCollected)}</span>
          <span className="text-[10px] text-stone-400 block mt-0.5">Wajib disetor ke kasir warung</span>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-white p-3.5 rounded-2xl border border-stone-200 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-stone-400 block">Tugas Aktif</span>
          <span className="text-xl font-black text-emerald-700">{activeOrders.length} Pesanan</span>
          <span className="text-[10px] text-stone-500 block mt-0.5">Perlu diproses sekarang</span>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setSelectedTab('ACTIVE')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            selectedTab === 'ACTIVE'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>Pengantaran Aktif ({activeOrders.length})</span>
        </button>

        <button
          onClick={() => setSelectedTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            selectedTab === 'HISTORY'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Riwayat Selesai ({completedOrders.length})</span>
        </button>
      </div>

      {/* ACTIVE TASKS LIST */}
      {selectedTab === 'ACTIVE' && (
        <div className="space-y-3">
          {activeOrders.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
              <Truck className="w-12 h-12 stroke-1 text-stone-300 mx-auto mb-2" />
              <p className="font-bold text-stone-700 text-sm">Belum Ada Tugas Pengantaran</p>
              <p className="text-xs text-stone-400 mt-1">
                Pesanan yang telah dikemas oleh admin warung akan muncul di sini untuk Anda ambil.
              </p>
            </div>
          ) : (
            activeOrders.map((order) => {
              const isCOD = order.paymentMethod === 'COD';
              const isOnDelivery = order.orderStatus === 'ON_DELIVERY';
              const isArrived = order.orderStatus === 'ARRIVED';
              const isReadyForPickup = order.orderStatus === 'READY_FOR_PICKUP';

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border-2 border-stone-200 hover:border-emerald-500 transition p-4 shadow-sm space-y-3"
                >
                  {/* Header info */}
                  <div className="flex items-center justify-between pb-2 border-b border-stone-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-stone-900">{order.orderNumber}</span>
                      <span className="text-stone-400">•</span>
                      <span className="text-stone-500">{formatDate(order.createdAt)}</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {isCOD ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                          <Banknote className="w-3 h-3" />
                          COD: {formatRupiah(order.grandTotal)}
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          ✓ LUNAS (Non-Tunai)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Customer & Address Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Penerima</span>
                      <p className="font-bold text-stone-900 text-sm">{order.customerName}</p>
                      <p className="text-stone-600">{order.customerPhone}</p>

                      {/* Quick Contact buttons */}
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 rounded-lg text-stone-700 font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                        >
                          <Phone className="w-3 h-3 text-emerald-600" />
                          <span>Telepon</span>
                        </a>
                        <a
                          href={`https://wa.me/${order.customerPhone}?text=Halo%20${order.customerName},%20saya%20kurir%20Warungku%20sedang%20mengantar%20pesanan%20${order.orderNumber}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg font-bold flex items-center gap-1 cursor-pointer text-[11px]"
                        >
                          <MessageCircle className="w-3 h-3 text-emerald-600" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <div className="space-y-1 bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                      <span className="text-[10px] text-stone-400 uppercase font-bold block flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-emerald-600" />
                        Alamat Pengantaran
                      </span>
                      <p className="text-stone-800 font-medium">
                        {order.shippingAddress?.street}, {order.shippingAddress?.kelurahan}
                      </p>
                      {order.deliveryNotes && (
                        <p className="text-amber-800 font-semibold text-[11px]">
                          Patokan: "{order.deliveryNotes}"
                        </p>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenNavigation(order)}
                        className="mt-1 text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        <Navigation className="w-3 h-3" />
                        <span>Buka Rute di Google Maps</span>
                      </button>
                    </div>
                  </div>

                  {/* Items to bring */}
                  <div className="bg-stone-50 p-3 rounded-xl text-xs space-y-1">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">
                      Barang yang Dibawa ({order.items.length} item):
                    </span>
                    <ul className="list-disc list-inside text-stone-700 space-y-0.5">
                      {order.items.map((i, idx) => (
                        <li key={idx}>
                          <strong>{i.quantity} {i.unit}</strong> {i.name}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Courier Action Buttons */}
                  <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-end gap-2">
                    {isReadyForPickup && (
                      <button
                        onClick={() => handlePickupOrder(order.id)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Truck className="w-4 h-4" />
                        <span>Ambil Barang di Warung & Mulai Antar</span>
                      </button>
                    )}

                    {isOnDelivery && (
                      <button
                        onClick={() => handleMarkArrived(order.id)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>Saya Sudah Tiba di Lokasi</span>
                      </button>
                    )}

                    {isArrived && (
                      <button
                        onClick={() => {
                          setShowCompleteModal(order);
                          if (order.paymentMethod === 'COD') {
                            setCodAmountReceived(order.grandTotal);
                          }
                        }}
                        className="w-full sm:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Selesaikan Pengantaran</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* COMPLETED TASKS HISTORY */}
      {selectedTab === 'HISTORY' && (
        <div className="space-y-3">
          {completedOrders.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-2xl border border-stone-200 text-stone-400">
              <p className="text-xs">Belum ada pengantaran yang diselesaikan hari ini.</p>
            </div>
          ) : (
            completedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
                    <span className="text-emerald-700 font-bold">✓ Selesai</span>
                  </div>
                  <p className="text-stone-600 mt-0.5">{order.customerName} • {order.shippingAddress?.street}</p>
                </div>

                <div className="text-right">
                  <span className="font-black text-stone-900 block">{formatRupiah(order.grandTotal)}</span>
                  <span className="text-[10px] text-stone-400">{order.paymentMethod}</span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* COMPLETE DELIVERY MODAL (Confirmation + Photo Proof + COD Receipt) */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 text-xs animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-sm text-stone-900">Konfirmasi Serah Terima Sembako</h3>
                <span className="font-mono text-stone-500">{showCompleteModal.orderNumber}</span>
              </div>
              <button onClick={() => setShowCompleteModal(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFinishDelivery} className="space-y-3">
              {/* COD Warning & Cash verification */}
              {showCompleteModal.paymentMethod === 'COD' && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center gap-1.5 text-rose-800 font-black text-xs">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Tagih Pembayaran Tunai (COD)</span>
                  </div>
                  <p className="text-rose-700 text-[11px]">
                    Pastikan Anda telah menerima uang tunai dari pelanggan sebesar:
                  </p>
                  <p className="text-base font-black text-rose-900">
                    {formatRupiah(showCompleteModal.grandTotal)}
                  </p>
                </div>
              )}

              <div>
                <label className="font-bold text-stone-700 block mb-1">Diterima Oleh:</label>
                <select
                  value={recipientRelation}
                  onChange={(e) => setRecipientRelation(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl outline-none"
                >
                  <option value="Penerima Langsung">Penerima Langsung ({showCompleteModal.customerName})</option>
                  <option value="Keluarga Serumah">Keluarga Serumah (Suami/Istri/Anak)</option>
                  <option value="Tetangga">Tetangga Sekitar</option>
                  <option value="Dititipkan di Pagar / Teras">Dititipkan di Pagar / Teras Rumah</option>
                </select>
              </div>

              {/* Delivery Photo Proof */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Foto Bukti Serah Terima Barang:
                </label>
                <label className="p-3 bg-stone-50 border-2 border-dashed border-stone-300 rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer hover:bg-stone-100">
                  <Camera className="w-6 h-6 text-stone-400 mb-1" />
                  <span className="font-bold text-stone-700">Ambil Foto / Pilih Gambar</span>
                  <span className="text-[10px] text-stone-400">Bukti barang sembako telah diserahkan</span>
                  <input type="file" accept="image/*" onChange={handleProofPhoto} className="hidden" />
                </label>

                {deliveryProofImage && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={deliveryProofImage} alt="Bukti Serah Terima" className="w-12 h-12 object-cover rounded-xl border border-stone-200" />
                    <span className="text-emerald-700 font-bold text-xs">✓ Foto terlampir</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCompleteModal(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md cursor-pointer"
                >
                  Selesaikan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
