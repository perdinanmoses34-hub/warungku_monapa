import React from 'react';
import { Order, Product, SystemSettings } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  TrendingUp,
  Package,
  Clock,
  Truck,
  AlertTriangle,
  DollarSign,
  FileSpreadsheet,
  ArrowUpRight,
} from 'lucide-react';

interface Props {
  orders: Order[];
  products: Product[];
  settings: SystemSettings;
  onNavigateTab: (tab: string) => void;
  onExportOrdersCSV: () => void;
}

export const AdminOverviewTab: React.FC<Props> = ({
  orders,
  products,
  settings,
  onNavigateTab,
  onExportOrdersCSV,
}) => {
  // Today's orders
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayOrders = orders.filter((o) => o.createdAt.startsWith(todayStr));
  const todayRevenue = todayOrders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const totalRevenueAll = orders
    .filter((o) => o.orderStatus !== 'CANCELLED')
    .reduce((sum, o) => sum + o.grandTotal, 0);

  const pendingOrders = orders.filter((o) =>
    ['CREATED', 'WAITING_PAYMENT', 'PAYMENT_CONFIRMED', 'ACCEPTED'].includes(o.orderStatus)
  );

  const deliveringOrders = orders.filter((o) =>
    ['PACKING', 'READY_FOR_PICKUP', 'ON_DELIVERY'].includes(o.orderStatus)
  );

  const lowStockProducts = products.filter((p) => p.stock <= p.minStock);

  return (
    <div className="space-y-5">
      {/* Top Banner with Quick Actions */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-emerald-950 text-white p-5 rounded-3xl shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
            Dashboard Pengelola Warung
          </span>
          <h2 className="text-lg sm:text-xl font-black tracking-tight mt-0.5">
            {settings.storeName} — Manajemen Sembako Online
          </h2>
          <p className="text-xs text-stone-300 mt-1">
            Pantau arus pesanan dapur, persediaan sembako, dan integrasi Google Sheets.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExportOrdersCSV}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Ekspor CSV Pesanan</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs">
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Penjualan Hari Ini</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-stone-900">{formatRupiah(todayRevenue)}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            {todayOrders.length} Transaksi Hari Ini
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('ORDERS')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-amber-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pesanan Perlu Diproses</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-amber-700">{pendingOrders.length} Pesanan</div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">
            Menunggu konfirmasi & pengemasan
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('ORDERS')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-blue-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Sedang Diantar</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-blue-800">{deliveringOrders.length} Pesanan</div>
          <p className="text-[11px] text-blue-600 font-semibold mt-1">Dalam perjalanan kurir</p>
        </div>

        <div
          onClick={() => onNavigateTab('PRODUCTS')}
          className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs hover:border-rose-400 transition cursor-pointer"
        >
          <div className="flex items-center justify-between text-stone-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stok Kritis</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl font-black text-rose-700">{lowStockProducts.length} Produk</div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Segera kulakan ke distributor</p>
        </div>
      </div>

      {/* Critical Stock Alert Table */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50/70 p-4 rounded-3xl border border-rose-200">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Peringatan Stok Sembako Menipis! Segera Kulakan:</span>
            </div>
            <button
              onClick={() => onNavigateTab('PRODUCTS')}
              className="text-xs font-bold text-rose-700 hover:text-rose-900 cursor-pointer"
            >
              Kelola Stok →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            {lowStockProducts.slice(0, 6).map((p) => (
              <div
                key={p.id}
                className="p-2.5 bg-white rounded-xl border border-rose-200 flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-stone-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-stone-400">Min. Stok: {p.minStock} {p.unit}</p>
                </div>
                <span className="px-2 py-0.5 rounded-lg bg-rose-100 text-rose-800 font-black text-xs shrink-0">
                  {p.stock} {p.unit}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Orders Overview */}
      <div className="bg-white rounded-3xl border border-stone-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Pesanan Terbaru Masuk</h3>
            <p className="text-xs text-stone-500">Antrian pesanan harian dari warga sekitar</p>
          </div>
          <button
            onClick={() => onNavigateTab('ORDERS')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            Lihat Semua Pesanan <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="divide-y divide-stone-100 text-xs">
          {orders.slice(0, 5).map((order) => (
            <div key={order.id} className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-stone-900">{order.orderNumber}</span>
                  <span className="text-stone-400">•</span>
                  <span className="font-semibold text-stone-800">{order.customerName}</span>
                </div>
                <p className="text-stone-500 text-[11px]">
                  {order.items.length} item ({order.items.map((i) => i.name).slice(0, 2).join(', ')}...)
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-black text-stone-900">{formatRupiah(order.grandTotal)}</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700">
                  {order.orderStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
