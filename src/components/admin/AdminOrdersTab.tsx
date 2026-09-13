import React, { useState } from 'react';
import { Order, OrderStatus, PaymentStatus, SystemSettings } from '../../types';
import { formatRupiah, formatDate, formatWeight } from '../../utils/formatters';
import { store } from '../../services/storeService';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Truck,
  Printer,
  MessageCircle,
  Eye,
  UserCheck,
  ChevronDown,
  X,
  CreditCard,
  Banknote,
  AlertCircle,
} from 'lucide-react';

interface Props {
  orders: Order[];
  settings: SystemSettings;
}

export const AdminOrdersTab: React.FC<Props> = ({ orders, settings }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showAssignCourierModal, setShowAssignCourierModal] = useState<Order | null>(null);
  const [courierNameInput, setCourierNameInput] = useState('Budi Santoso');
  const [courierPhoneInput, setCourierPhoneInput] = useState('6281298765432');
  const [courierPlateInput, setCourierPlateInput] = useState('Honda Vario B 4521 SXZ');

  // Filter logic
  const filteredOrders = orders.filter((o) => {
    const matchesSearch =
      o.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customerPhone.includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || o.orderStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleUpdateStatus = (orderId: string, newStatus: OrderStatus) => {
    store.updateOrderStatus(orderId, newStatus);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, orderStatus: newStatus });
    }
  };

  const handleUpdatePayment = (orderId: string, status: PaymentStatus) => {
    store.updateOrderPayment(orderId, status);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, paymentStatus: status });
    }
  };

  const handleAssignCourier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showAssignCourierModal) return;

    store.assignCourier(
      showAssignCourierModal.id,
      courierNameInput,
      courierPhoneInput,
      courierPlateInput
    );
    setShowAssignCourierModal(null);
  };

  const handlePrintPackingSlip = (order: Order) => {
    window.print();
  };

  return (
    <div className="space-y-4 text-xs text-stone-900 w-full max-w-full overflow-x-hidden">
      {/* Top Controls: Search & Filter */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari no. pesanan, nama, no HP..."
            className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="ALL">Semua Status ({orders.length})</option>
            <option value="WAITING_PAYMENT">Menunggu Pembayaran</option>
            <option value="CREATED">Pesanan Baru (Perlu Diterima)</option>
            <option value="PAYMENT_CONFIRMED">Pembayaran Terkonfirmasi</option>
            <option value="ACCEPTED">Diterima (Siap Dikemas)</option>
            <option value="PACKING">Sedang Dikemas</option>
            <option value="READY_FOR_PICKUP">Menunggu Kurir</option>
            <option value="ON_DELIVERY">Sedang Diantar</option>
            <option value="ARRIVED">Kurir Tiba</option>
            <option value="COMPLETED">Selesai</option>
            <option value="CANCELLED">Dibatalkan</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden w-full max-w-full">
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full min-w-[650px] text-left divide-y divide-stone-200">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="p-3.5">No. Pesanan</th>
                <th className="p-3.5">Pelanggan</th>
                <th className="p-3.5">Barang</th>
                <th className="p-3.5">Total & Bayar</th>
                <th className="p-3.5">Status Pesanan</th>
                <th className="p-3.5">Kurir</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-stone-400">
                    Tidak ada pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => {
                  const isCOD = order.paymentMethod === 'COD';
                  return (
                    <tr key={order.id} className="hover:bg-stone-50 transition">
                      <td className="p-3.5 font-mono font-bold text-stone-900 whitespace-nowrap">
                        {order.orderNumber}
                        <span className="block text-[10px] font-normal text-stone-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="font-bold text-stone-800">{order.customerName}</div>
                        <div className="text-[10px] text-stone-500">{order.customerPhone}</div>
                      </td>

                      <td className="p-3.5">
                        <span className="font-semibold text-stone-700">
                          {order.items.length} jenis ({order.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                        </span>
                        <div className="text-[10px] text-stone-400 truncate max-w-[160px]">
                          {order.items.map((i) => i.name).join(', ')}
                        </div>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-black text-emerald-800">{formatRupiah(order.grandTotal)}</div>
                        <div className="text-[10px] font-medium flex items-center gap-1">
                          <span className={isCOD ? 'text-amber-700' : 'text-stone-500'}>
                            {order.paymentMethod}
                          </span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                            order.paymentStatus === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}>
                            {order.paymentStatus}
                          </span>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={order.orderStatus}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value as OrderStatus)}
                          className="px-2 py-1 rounded-lg border border-stone-300 font-bold text-[11px] bg-white outline-none cursor-pointer"
                        >
                          <option value="WAITING_PAYMENT">Menunggu Bayar</option>
                          <option value="CREATED">Baru Masuk</option>
                          <option value="PAYMENT_CONFIRMED">Bayar Terkonfirmasi</option>
                          <option value="ACCEPTED">Diterima Warung</option>
                          <option value="PACKING">Sedang Dikemas</option>
                          <option value="READY_FOR_PICKUP">Menunggu Kurir</option>
                          <option value="ON_DELIVERY">Sedang Diantar</option>
                          <option value="ARRIVED">Kurir Tiba</option>
                          <option value="COMPLETED">Selesai</option>
                          <option value="CANCELLED">Batal</option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        {order.courierName ? (
                          <div>
                            <span className="font-bold text-stone-800">{order.courierName}</span>
                            <span className="block text-[10px] text-stone-400">{order.courierVehicle}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowAssignCourierModal(order)}
                            className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 rounded-lg text-[10px] font-bold cursor-pointer"
                          >
                            + Tugaskan Kurir
                          </button>
                        )}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedOrder(order)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
                            title="Lihat Detail Pesanan"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handlePrintPackingSlip(order)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
                            title="Cetak Struk Kemas"
                          >
                            <Printer className="w-3.5 h-3.5" />
                          </button>
                          <a
                            href={`https://wa.me/${order.customerPhone}?text=Halo%20${order.customerName}%20dari%20WARUNGKU%20mengenai%20pesanan%20${order.orderNumber}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg cursor-pointer"
                            title="Chat WhatsApp Pelanggan"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DETAIL MODAL & PACKING SLIP VIEW */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <div>
                <h3 className="font-bold text-sm text-stone-900">
                  Struk & Detail Pesanan #{selectedOrder.orderNumber}
                </h3>
                <span className="text-[11px] text-stone-400">{formatDate(selectedOrder.createdAt)}</span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1 text-xs">
              <div className="flex justify-between font-bold text-stone-900">
                <span>{selectedOrder.customerName}</span>
                <span>{selectedOrder.customerPhone}</span>
              </div>
              {selectedOrder.shippingAddress && (
                <p className="text-stone-600">
                  {selectedOrder.shippingAddress.street}, {selectedOrder.shippingAddress.kelurahan}, {selectedOrder.shippingAddress.kecamatan}
                </p>
              )}
              {selectedOrder.deliveryNotes && (
                <p className="text-amber-800 font-medium">Catatan: "{selectedOrder.deliveryNotes}"</p>
              )}
            </div>

            {/* Proof of Payment verification */}
            {selectedOrder.paymentProofUrl && (
              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-200 space-y-2">
                <span className="font-bold text-blue-900 block">Bukti Transfer dari Pelanggan:</span>
                <img
                  src={selectedOrder.paymentProofUrl}
                  alt="Bukti Transfer"
                  className="w-full max-h-48 object-contain rounded-xl border border-blue-200 bg-white"
                />
                <div className="flex items-center justify-between">
                  <span className="text-stone-600">Status Pembayaran Saat Ini: <strong>{selectedOrder.paymentStatus}</strong></span>
                  <button
                    onClick={() => handleUpdatePayment(selectedOrder.id, 'PAID')}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs cursor-pointer"
                  >
                    ✓ Verifikasi & Setujui Pembayaran
                  </button>
                </div>
              </div>
            )}

            {/* Packing List */}
            <div className="space-y-2">
              <span className="font-bold text-stone-900 block uppercase text-[10px]">Daftar Kemas Sembako:</span>
              <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl p-3">
                {selectedOrder.items.map((i, idx) => (
                  <div key={idx} className="py-1.5 flex justify-between">
                    <span>
                      <strong className="text-emerald-700">{i.quantity} {i.unit}</strong> {i.name}
                    </span>
                    <span className="font-mono">{formatRupiah(i.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total Billing */}
            <div className="p-3 bg-stone-50 rounded-2xl space-y-1 font-semibold">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatRupiah(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Ongkir</span>
                <span>{formatRupiah(selectedOrder.deliveryFee)}</span>
              </div>
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Diskon</span>
                  <span>- {formatRupiah(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="border-t border-stone-200 pt-1 flex justify-between font-black text-sm text-stone-900">
                <span>Total Tagihan</span>
                <span className="text-emerald-800">{formatRupiah(selectedOrder.grandTotal)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => handlePrintPackingSlip(selectedOrder)}
                className="px-4 py-2 bg-stone-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Nota Pengemasan</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ASSIGN COURIER MODAL */}
      {showAssignCourierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-sm">Tugaskan Kurir Pengantar</h3>
              <button onClick={() => setShowAssignCourierModal(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignCourier} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Kurir:</label>
                <input
                  type="text"
                  required
                  value={courierNameInput}
                  onChange={(e) => setCourierNameInput(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Nomor WhatsApp Kurir:</label>
                <input
                  type="text"
                  required
                  value={courierPhoneInput}
                  onChange={(e) => setCourierPhoneInput(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Kendaraan & Plat Nomor:</label>
                <input
                  type="text"
                  required
                  value={courierPlateInput}
                  onChange={(e) => setCourierPlateInput(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignCourierModal(null)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
                >
                  Tugaskan Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
