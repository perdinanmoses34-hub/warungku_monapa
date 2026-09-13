import React, { useState } from 'react';
import { Order, OrderStatus, SystemSettings, UserRole } from '../../types';
import { formatRupiah, formatDate, formatWeight } from '../../utils/formatters';
import { store } from '../../services/storeService';
import {
  Package,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronRight,
  Phone,
  MessageCircle,
  FileText,
  Star,
  MapPin,
  Calendar,
  AlertCircle,
  X,
  ExternalLink,
  Store,
  ShoppingBag,
  RotateCcw,
} from 'lucide-react';

interface Props {
  orders: Order[];
  settings: SystemSettings;
  userRole: UserRole;
  currentUserId: string;
  initialSelectedOrderId?: string;
  onSelectOrder?: (orderId: string) => void;
  onNavigateHome?: () => void;
}

export const OrdersScreen: React.FC<Props> = ({
  orders,
  settings,
  userRole,
  currentUserId,
  initialSelectedOrderId,
  onSelectOrder,
  onNavigateHome,
}) => {
  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(initialSelectedOrderId || null);
  const [showReviewModal, setShowReviewModal] = useState<string | null>(null); // productId or orderId
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>('Sembako sangat segar, pengantaran cepat sampai ke dapur!');

  const activeOrder = orders.find((o) => o.id === activeOrderId);

  // Status counters
  const unpaidCount = orders.filter((o) => o.orderStatus === 'WAITING_PAYMENT').length;
  const processingCount = orders.filter((o) => ['CREATED', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PROCESSING', 'PACKING', 'READY_FOR_PICKUP'].includes(o.orderStatus)).length;
  const deliveringCount = orders.filter((o) => ['ON_DELIVERY', 'DELIVERING', 'ARRIVED'].includes(o.orderStatus)).length;
  const completedCount = orders.filter((o) => o.orderStatus === 'COMPLETED').length;
  const cancelledCount = orders.filter((o) => o.orderStatus === 'CANCELLED').length;

  // Filter orders by tab
  const filteredOrders = orders.filter((o) => {
    if (selectedTab === 'ALL') return true;
    if (selectedTab === 'UNPAID') return o.orderStatus === 'WAITING_PAYMENT';
    if (selectedTab === 'PROCESSING') return ['CREATED', 'PAYMENT_CONFIRMED', 'ACCEPTED', 'PROCESSING', 'PACKING', 'READY_FOR_PICKUP'].includes(o.orderStatus);
    if (selectedTab === 'DELIVERING') return ['ON_DELIVERY', 'DELIVERING', 'ARRIVED'].includes(o.orderStatus);
    if (selectedTab === 'COMPLETED') return o.orderStatus === 'COMPLETED';
    if (selectedTab === 'CANCELLED') return o.orderStatus === 'CANCELLED';
    return true;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return { label: 'Menunggu Pembayaran', bg: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 'CREATED':
      case 'PAYMENT_CONFIRMED':
      case 'ACCEPTED':
      case 'PROCESSING':
        return { label: 'Diproses Warung', bg: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'PACKING':
      case 'READY_FOR_PICKUP':
        return { label: 'Sedang Dikemas', bg: 'bg-indigo-100 text-indigo-800 border-indigo-200' };
      case 'DELIVERING':
      case 'ON_DELIVERY':
      case 'ARRIVED':
        return { label: 'Sedang Diantar Kurir', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'COMPLETED':
        return { label: 'Selesai', bg: 'bg-stone-100 text-stone-700 border-stone-200' };
      case 'CANCELLED':
        return { label: 'Dibatalkan', bg: 'bg-rose-100 text-rose-800 border-rose-200' };
    }
  };

  // 9-Stage Timeline Steps
  const timelineStages: { key: OrderStatus; label: string; desc: string }[] = [
    { key: 'CREATED', label: 'Pesanan Dibuat', desc: 'Pesanan masuk ke sistem Warungku' },
    { key: 'PAYMENT_CONFIRMED', label: 'Pembayaran Terkonfirmasi', desc: 'Metode pembayaran diverifikasi' },
    { key: 'ACCEPTED', label: 'Diterima Warung', desc: 'Admin warung menyetujui pesanan' },
    { key: 'PACKING', label: 'Sedang Dikemas', desc: 'Barang sembako disiapkan & ditimbang' },
    { key: 'READY_FOR_PICKUP', label: 'Siap Diambil / Diantar', desc: 'Menunggu kurir mengambil pesanan' },
    { key: 'ON_DELIVERY', label: 'Sedang Diantar Kurir', desc: 'Kurir dalam perjalanan menuju alamat' },
    { key: 'ARRIVED', label: 'Kurir Tiba di Lokasi', desc: 'Kurir sampai di alamat tujuan' },
    { key: 'COMPLETED', label: 'Pesanan Selesai', desc: 'Barang telah diterima dengan baik' },
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'WAITING_PAYMENT':
        return 0;
      case 'CREATED':
        return 1;
      case 'PAYMENT_CONFIRMED':
        return 2;
      case 'ACCEPTED':
        return 3;
      case 'PACKING':
        return 4;
      case 'READY_FOR_PICKUP':
        return 5;
      case 'ON_DELIVERY':
        return 6;
      case 'ARRIVED':
        return 7;
      case 'COMPLETED':
        return 8;
      case 'CANCELLED':
        return -1;
      default:
        return 1;
    }
  };

  // Submit Review
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeOrder) return;

    const firstItem = activeOrder.items[0];
    if (firstItem) {
      store.addReview({
        productId: firstItem.productId,
        productName: firstItem.name,
        orderId: activeOrder.id,
        userId: currentUserId,
        userName: activeOrder.customerName,
        rating: reviewRating,
        comment: reviewComment,
      });
      alert('Terima kasih atas ulasan bintang 5 Anda!');
      setShowReviewModal(null);
    }
  };

  // Print Invoice simulation
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 pb-28 space-y-4">
      {/* Page Title */}
      <div>
        <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
          Riwayat & Status Pesanan
        </h1>
        <p className="text-xs text-stone-500">Pantau pengantaran sembako secara real-time</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {[
          { key: 'ALL', label: 'Semua', count: orders.length },
          { key: 'UNPAID', label: 'Menunggu Bayar', count: unpaidCount },
          { key: 'PROCESSING', label: 'Diproses', count: processingCount },
          { key: 'DELIVERING', label: 'Sedang Diantar', count: deliveringCount },
          { key: 'COMPLETED', label: 'Selesai', count: completedCount },
          { key: 'CANCELLED', label: 'Dibatalkan', count: cancelledCount },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSelectedTab(tab.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              selectedTab === tab.key
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedTab === tab.key ? 'bg-emerald-800 text-white' : 'bg-stone-100 text-stone-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      {filteredOrders.length === 0 ? (
        <div className="p-8 sm:p-12 text-center bg-white rounded-3xl border border-stone-200 shadow-2xs space-y-4">
          <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-600">
            <Package className="w-7 h-7 stroke-1.5" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <p className="font-bold text-stone-800 text-base">
              {orders.length === 0 ? 'Belum Ada Riwayat Pesanan' : 'Tidak Ada Pesanan di Kategori Ini'}
            </p>
            <p className="text-xs text-stone-500">
              {orders.length === 0
                ? 'Pesanan sembako yang Anda beli akan tercatat di sini dengan pelacakan kurir real-time.'
                : `Anda memiliki total ${orders.length} pesanan di kategori lainnya.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {orders.length > 0 && selectedTab !== 'ALL' && (
              <button
                onClick={() => setSelectedTab('ALL')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
              >
                Tampilkan Semua Pesanan ({orders.length})
              </button>
            )}
            {onNavigateHome && (
              <button
                onClick={onNavigateHome}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Mulai Belanja Sembako</span>
              </button>
            )}
            <button
              onClick={() => store.seedDemoOrders()}
              className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Muat Pesanan Contoh</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredOrders.map((order) => {
            const badge = getStatusBadge(order.orderStatus);
            const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);

            return (
              <div
                key={order.id}
                onClick={() => setActiveOrderId(order.id)}
                className={`bg-white rounded-3xl p-4 border transition cursor-pointer ${
                  activeOrderId === order.id
                    ? 'border-emerald-500 shadow-md ring-1 ring-emerald-500/30'
                    : 'border-stone-200 hover:border-stone-300 shadow-2xs'
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-stone-100 text-xs">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-black text-stone-900 text-xs">{order.orderNumber}</span>
                    <span className="text-stone-300">•</span>
                    <span className="text-stone-500 text-[11px]">{formatDate(order.createdAt)}</span>
                    {order.sellerStoreName && (
                      <span className="inline-flex items-center gap-1 bg-teal-50 border border-teal-200 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Store className="w-3 h-3 text-teal-600" />
                        <span>{order.sellerStoreName}</span>
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>

                {/* Items preview snippet */}
                <div className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {order.items[0]?.imageUrl && (
                      <img
                        src={order.items[0].imageUrl}
                        alt="thumb"
                        className="w-13 h-13 rounded-2xl object-cover bg-stone-100 shrink-0 border border-stone-100 shadow-2xs"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                        {order.items[0]?.name || 'Pesanan Sembako'}
                      </p>
                      <p className="text-[11px] text-stone-500">
                        {order.items.length > 1
                          ? `+ ${order.items.length - 1} barang sembako lainnya (${totalQty} item)`
                          : `${order.items[0]?.quantity} ${order.items[0]?.unit}`}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] text-stone-600 font-semibold">
                          Bayar: {order.paymentMethod === 'COD' ? 'COD (Bayar di Tempat)' : order.paymentMethod === 'BANK_TRANSFER' ? 'Transfer Bank' : 'E-Wallet/QRIS'}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {order.paymentStatus === 'PAID' ? 'Lunas' : 'Belum Bayar'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-stone-400 block">Total Tagihan</span>
                    <span className="font-black text-xs sm:text-sm text-emerald-800">
                      {formatRupiah(order.grandTotal)}
                    </span>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-emerald-700 font-semibold">
                  <span className="flex items-center gap-1.5 text-[11px] text-stone-600">
                    {order.deliveryMethod === 'DELIVERY' ? <Truck className="w-3.5 h-3.5 text-emerald-600" /> : <Package className="w-3.5 h-3.5 text-amber-600" />}
                    <span>{order.deliveryMethod === 'DELIVERY' ? 'Pengantaran Kurir ke Alamat' : 'Ambil Mandiri di Warung'}</span>
                  </span>
                  <span className="flex items-center gap-0.5 text-xs text-emerald-700 font-bold hover:underline">
                    Lacak & Rincian <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ACTIVE ORDER DETAIL & TRACKING MODAL */}
      {activeOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
          <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 text-xs text-stone-900">
            {/* Modal Header */}
            <div className="p-4 border-b border-stone-200 bg-stone-50 flex items-center justify-between shrink-0">
              <div>
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Detail & Tracking Pesanan
                </span>
                <span className="font-mono font-black text-sm text-stone-900">{activeOrder.orderNumber}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="px-2.5 py-1.5 bg-white border border-stone-200 hover:bg-stone-100 rounded-xl text-stone-700 font-bold flex items-center gap-1 cursor-pointer"
                  title="Cetak Faktur"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Faktur</span>
                </button>
                <button
                  onClick={() => setActiveOrderId(null)}
                  className="p-1.5 text-stone-400 hover:text-stone-700 rounded-xl hover:bg-stone-200 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Status Ribbon */}
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-emerald-700 font-semibold uppercase tracking-wider">
                    Status Terkini
                  </span>
                  <p className="font-black text-sm text-emerald-900">
                    {getStatusBadge(activeOrder.orderStatus).label}
                  </p>
                  <p className="text-[11px] text-emerald-700 mt-0.5">
                    {activeOrder.deliveryMethod === 'DELIVERY'
                      ? 'Estimasi pengantaran: 30 - 45 Menit'
                      : 'Pesanan siap diambil di warung saat selesai dikemas'}
                  </p>
                </div>
                <div className="p-3 bg-emerald-600 text-white rounded-xl shadow-xs">
                  <Truck className="w-5 h-5" />
                </div>
              </div>

              {/* LIVE TRACKING TIMELINE (9 Stages) */}
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200">
                <h3 className="font-bold text-stone-900 text-sm mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  Pelacakan Perjalanan Pesanan
                </h3>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {timelineStages.map((stage, idx) => {
                    const currentIdx = getStageIndex(activeOrder.orderStatus);
                    const isDone = currentIdx >= idx;
                    const isCurrent = currentIdx === idx;

                    return (
                      <div key={stage.key} className="relative">
                        <div
                          className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${
                            isDone
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'bg-white border-stone-300'
                          }`}
                        >
                          {isDone && <CheckCircle2 className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <p className={`font-bold ${isCurrent ? 'text-emerald-700 text-xs sm:text-sm' : isDone ? 'text-stone-800' : 'text-stone-400'}`}>
                          {stage.label}
                          {isCurrent && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.2 rounded-full">Saat Ini</span>}
                        </p>
                        <p className="text-[11px] text-stone-500">{stage.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* COURIER CARD & INTERACTIVE ROUTE MAP (When on delivery) */}
              {activeOrder.courierName && (
                <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{activeOrder.courierName}</p>
                        <p className="text-[11px] text-stone-500">
                          Kurir Resmi Warungku • {activeOrder.courierVehicle || 'Honda Beat B 3456 SMR'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${activeOrder.courierPhone || '6281298765432'}?text=Halo%20Kurir%20Warungku%20untuk%20pesanan%20${activeOrder.orderNumber}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Simulated Map View */}
                  <div className="relative h-36 w-full rounded-xl overflow-hidden bg-stone-200 border border-amber-200">
                    <img
                      src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80"
                      alt="Peta Pengantaran"
                      className="w-full h-full object-cover filter contrast-75 brightness-95"
                    />
                    <div className="absolute inset-0 bg-emerald-950/20 backdrop-blur-2xs flex items-center justify-center p-3">
                      <div className="bg-white/95 backdrop-blur-md p-3 rounded-xl shadow-lg border border-stone-200 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center animate-bounce">
                          🛵
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-xs">Kurir Sedang Menuju Rumah Anda</p>
                          <p className="text-[10px] text-stone-500">Jarak tempuh ~ 1.2 KM (Estimasi 8 menit tiba)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Items in Order */}
              <div className="bg-white rounded-2xl border border-stone-200 p-4 space-y-2.5">
                <h4 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
                  Daftar Barang Sembako ({activeOrder.items.length})
                </h4>

                <div className="divide-y divide-stone-100">
                  {activeOrder.items.map((item, idx) => (
                    <div key={idx} className="py-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        {item.imageUrl && (
                          <img src={item.imageUrl} alt={item.name} className="w-9 h-9 rounded-lg object-cover bg-stone-100" />
                        )}
                        <div>
                          <p className="font-bold text-stone-800">{item.name}</p>
                          <p className="text-[11px] text-stone-400">
                            {item.quantity} {item.unit} x {formatRupiah(item.price)}
                          </p>
                        </div>
                      </div>
                      <span className="font-black text-stone-900">{formatRupiah(item.subtotal)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-stone-100 pt-2 space-y-1 text-[11px] text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-stone-900">{formatRupiah(activeOrder.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Biaya Pengantaran</span>
                    <span className="font-bold text-stone-900">{formatRupiah(activeOrder.deliveryFee)}</span>
                  </div>
                  {activeOrder.discount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Diskon ({activeOrder.voucherCode})</span>
                      <span>- {formatRupiah(activeOrder.discount)}</span>
                    </div>
                  )}
                  <div className="border-t border-stone-200 pt-1.5 flex justify-between font-black text-xs text-stone-900">
                    <span>Total Pembayaran</span>
                    <span className="text-emerald-800 text-sm">{formatRupiah(activeOrder.grandTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Destination Address / Notes */}
              {activeOrder.shippingAddress && (
                <div className="bg-stone-50 rounded-2xl border border-stone-200 p-4 text-xs space-y-1">
                  <p className="font-bold text-stone-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    Alamat Pengantaran
                  </p>
                  <p className="text-stone-700">
                    {activeOrder.shippingAddress.recipientName} ({activeOrder.shippingAddress.phone})
                  </p>
                  <p className="text-stone-500">{activeOrder.shippingAddress.street}, {activeOrder.shippingAddress.kelurahan}, {activeOrder.shippingAddress.kecamatan}</p>
                  {activeOrder.deliveryNotes && (
                    <p className="text-amber-800 font-medium pt-1">
                      Catatan Kurir: "{activeOrder.deliveryNotes}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Modal Action Footer */}
            <div className="p-4 border-t border-stone-200 bg-white flex flex-col gap-2 shrink-0">
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Cetak Struk</span>
                </button>

                {activeOrder.orderStatus !== 'COMPLETED' && activeOrder.orderStatus !== 'CANCELLED' && (
                  <button
                    onClick={() => {
                      const nextMap: Record<string, OrderStatus> = {
                        WAITING_PAYMENT: 'PAYMENT_CONFIRMED',
                        CREATED: 'ACCEPTED',
                        PAYMENT_CONFIRMED: 'ACCEPTED',
                        ACCEPTED: 'PACKING',
                        PROCESSING: 'PACKING',
                        PACKING: 'ON_DELIVERY',
                        READY_FOR_PICKUP: 'ON_DELIVERY',
                        ON_DELIVERY: 'ARRIVED',
                        DELIVERING: 'ARRIVED',
                        ARRIVED: 'COMPLETED',
                      };
                      const next = nextMap[activeOrder.orderStatus];
                      if (next) {
                        store.updateOrderStatus(activeOrder.id, next, `Simulasi status: ${next}`);
                      }
                    }}
                    className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Truck className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Simulasi Langkah Maju</span>
                  </button>
                )}
              </div>

              {activeOrder.orderStatus === 'COMPLETED' ? (
                <button
                  onClick={() => setShowReviewModal(activeOrder.id)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer text-xs"
                >
                  <Star className="w-4 h-4 fill-stone-950" />
                  <span>Beri Ulasan Produk</span>
                </button>
              ) : activeOrder.orderStatus === 'CREATED' || activeOrder.orderStatus === 'WAITING_PAYMENT' ? (
                <button
                  onClick={() => {
                    if (confirm('Yakin ingin membatalkan pesanan ini?')) {
                      store.updateOrderStatus(activeOrder.id, 'CANCELLED');
                    }
                  }}
                  className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-xl transition cursor-pointer text-xs"
                >
                  Batalkan Pesanan
                </button>
              ) : (
                <a
                  href={`https://wa.me/${settings.storePhone}?text=Halo%20Admin%20Warungku%20mohon%20info%20pesanan%20${activeOrder.orderNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition flex items-center justify-center gap-2 cursor-pointer text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hubungi Admin Warung via WA</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* REVIEW & RATING MODAL */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-4 animate-in zoom-in-95 text-xs text-stone-900">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-sm">Beri Ulasan Sembako</h3>
              <button onClick={() => setShowReviewModal(null)} className="text-stone-400 hover:text-stone-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1.5">Rating Bintang:</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer transition transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'}`}
                      />
                    </button>
                  ))}
                  <span className="font-bold text-amber-600 ml-2">{reviewRating} / 5 Bintang</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Komentar Ulasan:</label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full p-2.5 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder="Ceritakan pengalaman belanja sembako Anda..."
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition"
              >
                Kirim Penilaian
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
