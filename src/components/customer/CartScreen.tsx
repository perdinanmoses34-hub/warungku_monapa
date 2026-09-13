import React from 'react';
import { CartItem, Product, SystemSettings } from '../../types';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckSquare,
  Square,
} from 'lucide-react';

interface Props {
  cart: CartItem[];
  products: Product[];
  settings: SystemSettings;
  onUpdateQty: (productId: string, qty: number) => void;
  onRemoveItem: (productId: string) => void;
  onToggleSelect: (productId: string) => void;
  onToggleSelectAll: (selected: boolean) => void;
  onProceedCheckout: () => void;
  onContinueShopping: () => void;
}

export const CartScreen: React.FC<Props> = ({
  cart,
  products,
  settings,
  onUpdateQty,
  onRemoveItem,
  onToggleSelect,
  onToggleSelectAll,
  onProceedCheckout,
  onContinueShopping,
}) => {
  // Map cart items with actual product details
  const itemsWithProduct = cart.map((item) => {
    const product = products.find((p) => p.id === item.productId);
    return {
      ...item,
      product,
      price: product ? (product.promoPrice || product.normalPrice) : 0,
      subtotal: product ? (product.promoPrice || product.normalPrice) * item.quantity : 0,
    };
  }).filter((item) => item.product !== undefined);

  const selectedItems = itemsWithProduct.filter((item) => item.selected);
  const allSelected = itemsWithProduct.length > 0 && selectedItems.length === itemsWithProduct.length;

  const subtotal = selectedItems.reduce((sum, item) => sum + item.subtotal, 0);
  const totalWeight = selectedItems.reduce((sum, item) => sum + (item.product?.weightGrams || 0) * item.quantity, 0);

  // Delivery fee estimation: free if subtotal >= freeShippingMinOrder
  const freeShipping = subtotal >= settings.deliverySettings.freeShippingMinOrder && subtotal > 0;
  const estimatedDeliveryFee = subtotal === 0 ? 0 : freeShipping ? 0 : settings.deliverySettings.baseFee;
  const grandTotal = subtotal + estimatedDeliveryFee;

  if (itemsWithProduct.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-600">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-black text-stone-900">Keranjang Anda Masih Kosong</h2>
        <p className="text-xs text-stone-500 max-w-xs mx-auto leading-relaxed">
          Yuk mulai belanja kebutuhan sembako dan keperluan harian keluarga langsung diantar ke rumah!
        </p>
        <button
          onClick={onContinueShopping}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-2xl shadow-md transition active:scale-95 cursor-pointer"
        >
          Mulai Belanja Sekarang
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3.5 sm:px-6 py-4 pb-28 space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
            Keranjang Belanja ({itemsWithProduct.length} Jenis Barang)
          </h1>
          <p className="text-xs text-stone-500">Periksa barang sembako sebelum melanjutkan ke pembayaran</p>
        </div>
      </div>

      {/* Free shipping progress bar */}
      <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs">
        <div className="flex items-center justify-between font-bold text-emerald-900 mb-1">
          <span className="flex items-center gap-1.5">
            <Truck className="w-4 h-4 text-emerald-700" />
            {freeShipping
              ? 'Selamat! Anda berhak mendapatkan GRATIS ONGKIR!'
              : `Tambah ${formatRupiah(settings.deliverySettings.freeShippingMinOrder - subtotal)} lagi untuk Bebas Ongkir!`}
          </span>
        </div>
        <div className="w-full bg-emerald-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-emerald-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${Math.min(100, (subtotal / settings.deliverySettings.freeShippingMinOrder) * 100)}%` }}
          />
        </div>
      </div>

      {/* Select All Checkbox bar */}
      <div className="bg-white p-3 rounded-2xl border border-stone-200 flex items-center justify-between text-xs font-bold text-stone-800">
        <button
          onClick={() => onToggleSelectAll(!allSelected)}
          className="flex items-center gap-2 cursor-pointer hover:text-emerald-700 transition"
        >
          {allSelected ? (
            <CheckSquare className="w-5 h-5 text-emerald-600" />
          ) : (
            <Square className="w-5 h-5 text-stone-300" />
          )}
          <span>Pilih Semua Barang ({itemsWithProduct.length})</span>
        </button>
        <span className="text-stone-400 font-normal">
          Dipilih: {selectedItems.length} barang
        </span>
      </div>

      {/* Cart Items List */}
      <div className="space-y-2.5">
        {itemsWithProduct.map((item) => {
          const p = item.product!;
          return (
            <div
              key={item.productId}
              className={`bg-white rounded-2xl p-3 sm:p-4 border transition-all flex items-center gap-3 ${
                item.selected ? 'border-emerald-300 shadow-xs' : 'border-stone-200 opacity-75'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggleSelect(item.productId)}
                className="cursor-pointer shrink-0 text-stone-400 hover:text-emerald-600"
              >
                {item.selected ? (
                  <CheckSquare className="w-5 h-5 text-emerald-600" />
                ) : (
                  <Square className="w-5 h-5 text-stone-300" />
                )}
              </button>

              {/* Product Thumbnail */}
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl bg-stone-100 shrink-0"
              />

              {/* Product Info */}
              <div className="flex-1 min-w-0">
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {p.categoryName}
                </span>
                <h3 className="font-bold text-xs sm:text-sm text-stone-800 line-clamp-1 mt-0.5">
                  {p.name}
                </h3>
                <p className="text-[11px] text-stone-400">
                  {formatWeight(p.weightGrams)} / {p.unit}
                </p>

                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs sm:text-sm font-black text-stone-900">
                    {formatRupiah(item.price)}
                  </span>
                  {p.promoPrice && (
                    <span className="text-[10px] text-stone-400 line-through">
                      {formatRupiah(p.normalPrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* Quantity Stepper & Delete */}
              <div className="flex flex-col items-end justify-between self-stretch shrink-0">
                <button
                  onClick={() => onRemoveItem(item.productId)}
                  className="p-1 text-stone-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                  title="Hapus dari keranjang"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                  <button
                    onClick={() => onUpdateQty(item.productId, item.quantity - 1)}
                    className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg transition active:scale-95 cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-7 text-center text-xs font-bold text-stone-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => onUpdateQty(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= p.stock}
                    className="w-7 h-7 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-40"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Box */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200 space-y-2 text-xs">
        <h3 className="font-bold text-stone-900 text-sm mb-2">Ringkasan Belanja</h3>
        <div className="flex justify-between text-stone-600">
          <span>Subtotal ({selectedItems.length} produk)</span>
          <span className="font-bold text-stone-900">{formatRupiah(subtotal)}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Estimasi Ongkos Kirim</span>
          <span className={`font-bold ${freeShipping ? 'text-emerald-600' : 'text-stone-900'}`}>
            {freeShipping ? 'GRATIS' : formatRupiah(estimatedDeliveryFee)}
          </span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Total Berat Barang</span>
          <span className="font-semibold text-stone-700">{formatWeight(totalWeight)}</span>
        </div>

        <div className="border-t border-stone-100 pt-2 flex justify-between items-baseline">
          <div>
            <span className="text-sm font-bold text-stone-900">Total Pembayaran</span>
            <span className="block text-[10px] text-stone-400">Termasuk pajak & layanan</span>
          </div>
          <span className="text-base sm:text-lg font-black text-emerald-800">
            {formatRupiah(grandTotal)}
          </span>
        </div>
      </div>

      {/* Sticky Bottom Checkout Action */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-3 sm:p-4 shadow-xl z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] text-stone-400 block">Total Tagihan ({selectedItems.length} barang):</span>
            <span className="text-base sm:text-xl font-black text-emerald-800">
              {formatRupiah(grandTotal)}
            </span>
          </div>

          <button
            onClick={onProceedCheckout}
            disabled={selectedItems.length === 0}
            className="px-6 sm:px-8 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Lanjut Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
