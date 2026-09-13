import React from 'react';
import { Order } from '../../types';
import { formatRupiah, formatDate } from '../../utils/formatters';
import { CheckCircle2, Package, Clock, Truck, ArrowRight, Home } from 'lucide-react';

interface Props {
  order: Order;
  onViewOrderDetails: (orderId: string) => void;
  onGoHome: () => void;
}

export const OrderConfirmationModal: React.FC<Props> = ({
  order,
  onViewOrderDetails,
  onGoHome,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 text-stone-900">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="text-center space-y-1">
          <h2 className="text-xl font-black tracking-tight text-stone-900">
            Pesanan Sembako Berhasil Dibuat!
          </h2>
          <p className="text-xs text-stone-500">
            Terima kasih telah berbelanja di WARUNGKU. Pesanan Anda segera dipersiapkan.
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-2.5 text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-stone-200">
            <span className="text-stone-500">Nomor Pesanan</span>
            <span className="font-mono font-black text-stone-900 text-sm">{order.orderNumber}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">Waktu Pemesanan</span>
            <span className="font-semibold text-stone-800">{formatDate(order.createdAt)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">Metode Pengantaran</span>
            <span className="font-bold text-stone-900">
              {order.deliveryMethod === 'DELIVERY' ? '🛵 Antar ke Alamat' : '🏪 Ambil di Warung'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">Metode Pembayaran</span>
            <span className="font-bold text-emerald-700">
              {order.paymentMethod === 'COD'
                ? 'Bayar Tunai (COD)'
                : order.paymentMethod === 'BANK_TRANSFER'
                ? 'Transfer Bank'
                : 'E-Wallet / QRIS'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500">Estimasi Tiba</span>
            <span className="font-bold text-amber-600 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {order.isScheduled ? `${order.scheduledDate} (${order.scheduledTimeSlot})` : '30 - 45 Menit'}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-stone-200 font-black text-stone-900 text-sm">
            <span>Total Tagihan</span>
            <span className="text-emerald-800 text-base">{formatRupiah(order.grandTotal)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2 pt-2">
          <button
            onClick={() => onViewOrderDetails(order.id)}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <span>Lihat Status & Lacak Pengantaran</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onGoHome}
            className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Kembali ke Beranda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
