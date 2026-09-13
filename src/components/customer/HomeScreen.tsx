import React, { useState } from 'react';
import { Category, Product, SystemSettings } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ProductCard } from './ProductCard';
import {
  Search,
  Sparkles,
  Flame,
  Truck,
  ShieldCheck,
  Tag,
  ArrowRight,
  Clock,
  ShoppingCart,
  ChevronRight,
  Percent,
} from 'lucide-react';

interface Props {
  products: Product[];
  categories: Category[];
  settings: SystemSettings;
  cartCount: number;
  cartTotal: number;
  cartMap: Record<string, number>;
  wishlistSet: Set<string>;
  onOpenProductDetail: (product: Product) => void;
  onAddToCart: (productId: string) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  onToggleWishlist: (productId: string) => void;
  onOpenSearch: () => void;
  onSelectCategory: (categoryId: string) => void;
  onOpenCart: () => void;
  onOpenVoucherModal: () => void;
}

export const HomeScreen: React.FC<Props> = ({
  products,
  categories,
  settings,
  cartCount,
  cartTotal,
  cartMap,
  wishlistSet,
  onOpenProductDetail,
  onAddToCart,
  onUpdateCartQty,
  onToggleWishlist,
  onOpenSearch,
  onSelectCategory,
  onOpenCart,
  onOpenVoucherModal,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');

  // Flash sale / promo products
  const promoProducts = products.filter((p) => p.promoPrice && p.promoPrice < p.normalPrice);

  // Best selling products
  const popularProducts = [...products].sort((a, b) => b.soldCount - a.soldCount).slice(0, 6);

  // Filtered product section
  const catalogProducts = products.filter((p) => {
    if (activeCategoryFilter === 'ALL') return true;
    return p.categoryId === activeCategoryFilter;
  });

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 pt-3 space-y-5 sm:space-y-6 pb-24 overflow-x-hidden">
      {/* Search Bar Tap Trigger (Mobile & Android visual) */}
      <div
        onClick={onOpenSearch}
        className="w-full bg-white rounded-2xl p-3 border border-stone-200/90 shadow-2xs flex items-center gap-3 cursor-pointer hover:border-emerald-500 transition group"
      >
        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform shrink-0">
          <Search className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs sm:text-sm font-bold text-stone-800 leading-snug">Mau belanja sembako apa hari ini?</p>
          <p className="text-[11px] text-stone-400 truncate">Cari beras, minyak goreng, telur, gula, bumbu dapur...</p>
        </div>
        <span className="px-3 py-1 bg-emerald-600 text-white text-xs font-bold rounded-xl shadow-2xs shrink-0">
          Cari
        </span>
      </div>

      {/* Promo Banners Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {/* Banner 1: Gratis Ongkir */}
        <div
          onClick={onOpenVoucherModal}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 text-white p-4 sm:p-5 shadow-xs cursor-pointer hover:shadow-md transition"
        >
          <div className="relative z-10 max-w-[80%] sm:max-w-[75%]">
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
              <Truck className="w-3 h-3" /> BEBAS ONGKIR
            </span>
            <h2 className="text-base sm:text-lg font-black leading-snug tracking-tight">
              Belanja Min. Rp {settings.deliverySettings.freeShippingMinOrder.toLocaleString('id-ID')}
            </h2>
            <p className="text-xs text-emerald-100 mt-1 leading-normal">
              Barang sembako kami antar langsung ke dapur rumah Anda.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold bg-amber-400 hover:bg-amber-300 text-stone-950 px-3 py-1.5 rounded-xl shadow-xs transition">
              <span>Pakai Voucher</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="absolute -right-4 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute right-3 bottom-2 text-5xl sm:text-6xl opacity-30 select-none pointer-events-none">
            🍚
          </div>
        </div>

        {/* Banner 2: Hemat Diskon */}
        <div
          onClick={onOpenVoucherModal}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-4 sm:p-5 shadow-xs cursor-pointer hover:shadow-md transition"
        >
          <div className="relative z-10 max-w-[80%] sm:max-w-[75%]">
            <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full mb-2 uppercase tracking-wide">
              <Percent className="w-3 h-3" /> VOUCHER HEMAT
            </span>
            <h2 className="text-base sm:text-lg font-black leading-snug tracking-tight">
              KODE: WARUNGHEMAT
            </h2>
            <p className="text-xs text-amber-100 mt-1 leading-normal">
              Potongan 10% untuk semua kebutuhan dapur sehari-hari.
            </p>
            <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold bg-white hover:bg-amber-50 text-orange-700 px-3 py-1.5 rounded-xl shadow-xs transition">
              <span>Klaim Diskon</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="absolute right-3 bottom-2 text-5xl sm:text-6xl opacity-30 select-none pointer-events-none">
            🍳
          </div>
        </div>
      </div>

      {/* Service Highlights */}
      <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-2xl border border-stone-200/80 shadow-2xs text-center">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-center sm:text-left min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-stone-800 leading-tight">Antar Cepat</p>
            <p className="text-[10px] text-stone-400 hidden sm:block">30 - 45 Menit Sampai</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 border-x border-stone-100">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <div className="text-center sm:text-left min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-stone-800 leading-tight">Jaminan Segar</p>
            <p className="text-[10px] text-stone-400 hidden sm:block">Sembako Bersih</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
          <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
          <div className="text-center sm:text-left min-w-0">
            <p className="text-[11px] sm:text-xs font-bold text-stone-800 leading-tight">Harga Ramah</p>
            <p className="text-[10px] text-stone-400 hidden sm:block">Pas di Kantong</p>
          </div>
        </div>
      </div>

      {/* Categories Horizontal Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm sm:text-base font-black text-stone-900 tracking-tight flex items-center gap-1.5">
            <span>Kategori Sembako</span>
          </h2>
          <button
            onClick={() => onSelectCategory('ALL')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2 sm:gap-2.5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group bg-white hover:bg-emerald-50/70 p-2.5 rounded-2xl border border-stone-200/80 hover:border-emerald-300 shadow-2xs flex flex-col items-center text-center cursor-pointer transition active:scale-95"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 group-hover:bg-emerald-100 text-emerald-700 flex items-center justify-center mb-1.5 text-base transition">
                {cat.name.includes('Beras') && '🍚'}
                {cat.name.includes('Minyak') && '🫒'}
                {cat.name.includes('Gula') && '🍬'}
                {cat.name.includes('Telur') && '🥚'}
                {cat.name.includes('Tepung') && '🌾'}
                {cat.name.includes('Mie') && '🍜'}
                {cat.name.includes('Kopi') && '☕'}
                {cat.name.includes('Susu') && '🥛'}
                {cat.name.includes('Bumbu') && '🧂'}
                {cat.name.includes('Sabun') && '🧼'}
                {cat.name.includes('Deterjen') && '🧺'}
                {cat.name.includes('Gas') && '🔥'}
              </div>
              <span className="text-[11px] font-bold text-stone-700 group-hover:text-emerald-900 line-clamp-1 leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sale / Promo Hemat Section */}
      {promoProducts.length > 0 && (
        <div className="bg-rose-50/60 p-3.5 sm:p-5 rounded-3xl border border-rose-100">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-rose-500 text-white rounded-xl">
                <Flame className="w-4 h-4" />
              </span>
              <div>
                <h2 className="text-sm sm:text-base font-black text-rose-900 leading-tight">
                  Promo Hemat Hari Ini
                </h2>
                <p className="text-[11px] text-rose-700">Harga spesial sembako pilihan untuk keluarga hemat</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-600 bg-white px-2.5 py-1 rounded-full border border-rose-200">
              Diskon s/d 15%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {promoProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                cartQuantity={cartMap[product.id] || 0}
                onOpenDetail={onOpenProductDetail}
                onAddToCart={onAddToCart}
                onUpdateCartQty={onUpdateCartQty}
                isWishlisted={wishlistSet.has(product.id)}
                onToggleWishlist={onToggleWishlist}
              />
            ))}
          </div>
        </div>
      )}

      {/* Produk Terlaris */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-stone-900 leading-tight flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Paling Banyak Dibeli</span>
            </h2>
            <p className="text-[11px] text-stone-500">Sembako wajib dapur yang selalu dicari warga</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {popularProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cartQuantity={cartMap[product.id] || 0}
              onOpenDetail={onOpenProductDetail}
              onAddToCart={onAddToCart}
              onUpdateCartQty={onUpdateCartQty}
              isWishlisted={wishlistSet.has(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>

      {/* Semua Produk / Katalog Lengkap */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div>
            <h2 className="text-sm sm:text-base font-black text-stone-900 leading-tight">
              Katalog Lengkap Warung
            </h2>
            <p className="text-[11px] text-stone-500">Pilih kebutuhan dapur harian Anda</p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                activeCategoryFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              Semua ({products.length})
            </button>
            {categories.slice(0, 6).map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryFilter(cat.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold transition whitespace-nowrap cursor-pointer ${
                  activeCategoryFilter === cat.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {catalogProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              cartQuantity={cartMap[product.id] || 0}
              onOpenDetail={onOpenProductDetail}
              onAddToCart={onAddToCart}
              onUpdateCartQty={onUpdateCartQty}
              isWishlisted={wishlistSet.has(product.id)}
              onToggleWishlist={onToggleWishlist}
            />
          ))}
        </div>
      </div>

      {/* Sticky Bottom Cart Checkout Bar (Android UX requirement) */}
      {cartCount > 0 && (
        <div
          id="sticky-cart-bar"
          onClick={onOpenCart}
          className="fixed bottom-16 md:bottom-6 left-3 right-3 sm:left-auto sm:right-6 sm:max-w-md z-30 bg-emerald-700 text-white p-3 sm:p-3.5 rounded-2xl shadow-xl border border-emerald-500/30 flex items-center justify-between cursor-pointer hover:bg-emerald-800 transition active:scale-[0.99] animate-in slide-in-from-bottom-3 duration-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-800 flex items-center justify-center font-black text-sm relative">
              <ShoppingCart className="w-5 h-5 text-emerald-200" />
              <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-stone-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            </div>
            <div>
              <p className="text-xs text-emerald-200 font-semibold">{cartCount} Barang di Keranjang</p>
              <p className="text-sm font-black text-white">{formatRupiah(cartTotal)}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 text-xs font-bold bg-white text-emerald-800 px-3 py-2 rounded-xl shadow-xs">
            <span>Checkout</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
};
