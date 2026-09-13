import React, { useState } from 'react';
import { Category, Product, SystemSettings } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { ProductCard } from './ProductCard';
import { store } from '../../services/storeService';
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
  Store,
  MapPin,
  CheckCircle2,
  UserPlus,
  Filter,
  X,
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
  onOpenAuth?: (mode?: 'REGISTER_BUYER' | 'REGISTER_SELLER' | 'LOGIN' | 'SWITCH_ADMIN') => void;
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
  onOpenAuth,
}) => {
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('ALL');
  const [activeSellerFilter, setActiveSellerFilter] = useState<string>('ALL');

  const sellers = store.getSellers();
  const selectedSeller = sellers.find((s) => s.id === activeSellerFilter);

  // Flash sale / promo products
  const promoProducts = products.filter((p) => {
    const isPromo = p.promoPrice && p.promoPrice < p.normalPrice;
    if (activeSellerFilter === 'ALL') return isPromo;
    return isPromo && p.sellerId === activeSellerFilter;
  });

  // Best selling products
  const popularProducts = [...products]
    .filter((p) => (activeSellerFilter === 'ALL' ? true : p.sellerId === activeSellerFilter))
    .sort((a, b) => b.soldCount - a.soldCount)
    .slice(0, 6);

  // Filtered product section
  const catalogProducts = products.filter((p) => {
    const matchesCategory = activeCategoryFilter === 'ALL' || p.categoryId === activeCategoryFilter;
    const matchesSeller = activeSellerFilter === 'ALL' || p.sellerId === activeSellerFilter;
    return matchesCategory && matchesSeller;
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
          <p className="text-xs sm:text-sm font-bold text-stone-800 leading-snug">
            Mau belanja sembako apa hari ini?
          </p>
          <p className="text-[11px] text-stone-400 truncate">
            Cari beras, minyak goreng, telur, gula, bumbu dapur dari semua warung...
          </p>
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
            <p className="text-[11px] sm:text-xs font-bold text-stone-800 leading-tight">Banyak Warung</p>
            <p className="text-[10px] text-stone-400 hidden sm:block">Pilihan Lengkap</p>
          </div>
        </div>
      </div>

      {/* WARUNG SEMBAKO TERDAFTAR (Multi-Seller Section for Buyers) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <div>
            <h2 className="text-sm sm:text-base font-black text-stone-900 tracking-tight flex items-center gap-1.5">
              <Store className="w-4 h-4 text-teal-700" />
              <span>Daftar Warung Sembako Terdaftar</span>
            </h2>
            <p className="text-[11px] text-stone-500">
              Pilih warung favorit Anda untuk melihat sembako yang mereka jual
            </p>
          </div>
          {onOpenAuth && (
            <button
              onClick={() => onOpenAuth('REGISTER_SELLER')}
              className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1 cursor-pointer bg-teal-50 px-2.5 py-1 rounded-xl border border-teal-200"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Buka Warung Anda</span>
            </button>
          )}
        </div>

        {/* Warungs list carousel / cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {/* Card: Semua Warung (Reset Filter) */}
          <div
            onClick={() => setActiveSellerFilter('ALL')}
            className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 ${
              activeSellerFilter === 'ALL'
                ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                : 'bg-white hover:bg-stone-50 border-stone-200/90 text-stone-800'
            }`}
          >
            <div
              className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
                activeSellerFilter === 'ALL' ? 'bg-white/20 text-white' : 'bg-teal-50 text-teal-800'
              }`}
            >
              🏪
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-extrabold text-xs sm:text-sm truncate">Semua Warung</div>
              <div
                className={`text-[10px] truncate ${
                  activeSellerFilter === 'ALL' ? 'text-teal-100' : 'text-stone-400'
                }`}
              >
                Tampilkan seluruh sembako dari semua penjual
              </div>
            </div>
            {activeSellerFilter === 'ALL' && (
              <CheckCircle2 className="w-4 h-4 text-teal-200 shrink-0" />
            )}
          </div>

          {/* Seller cards */}
          {sellers.map((seller) => {
            const isSelected = activeSellerFilter === seller.id;
            const sellerProductCount = products.filter((p) => p.sellerId === seller.id).length;
            const storeName = seller.storeProfile?.storeName || seller.name;
            const storeAddress = seller.storeProfile?.storeAddress || 'Monapa, Depok';

            return (
              <div
                key={seller.id}
                onClick={() => setActiveSellerFilter(seller.id)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center gap-3 relative ${
                  isSelected
                    ? 'bg-teal-700 text-white border-teal-800 shadow-xs'
                    : 'bg-white hover:bg-teal-50/40 border-stone-200/90 text-stone-800'
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-teal-100 text-teal-900'
                  }`}
                >
                  <Store className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs sm:text-sm truncate">{storeName}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded-md font-bold uppercase shrink-0 ${
                        isSelected ? 'bg-teal-800 text-teal-200' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      Buka
                    </span>
                  </div>
                  <div
                    className={`flex items-center gap-1 text-[10px] truncate ${
                      isSelected ? 'text-teal-100' : 'text-stone-500'
                    }`}
                  >
                    <MapPin className="w-3 h-3 shrink-0 opacity-70" />
                    <span className="truncate">{storeAddress}</span>
                    <span>• {sellerProductCount} Produk</span>
                  </div>
                </div>
                {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-200 shrink-0" />}
              </div>
            );
          })}
        </div>

        {/* Active Warung Filter Alert Bar */}
        {activeSellerFilter !== 'ALL' && selectedSeller && (
          <div className="mt-2.5 p-2.5 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs text-teal-900 animate-in fade-in">
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-teal-700 shrink-0" />
              <span>
                Menampilkan produk dari:{' '}
                <strong>{selectedSeller.storeProfile?.storeName || selectedSeller.name}</strong> (
                {catalogProducts.length} Produk)
              </span>
            </div>
            <button
              onClick={() => setActiveSellerFilter('ALL')}
              className="flex items-center gap-1 text-[11px] font-bold text-teal-800 bg-white px-2 py-0.5 rounded-lg border border-teal-200 hover:bg-teal-100 cursor-pointer"
            >
              <X className="w-3 h-3" />
              <span>Tampilkan Semua</span>
            </button>
          </div>
        )}
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
              <span className="text-[11px] font-bold text-stone-700 group-hover:text-emerald-800 line-clamp-1 leading-tight">
                {cat.name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Flash Sale / Promo Hari Ini */}
      {promoProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-rose-600 font-black text-sm sm:text-base">
                <Flame className="w-5 h-5 fill-rose-600 animate-pulse" />
                <span>Promo Kilat Hari Ini</span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700 border border-rose-200 animate-bounce">
                HEMAT HINGGA 20%
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {promoProducts.map((product) => (
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
            <p className="text-[11px] text-stone-500">
              {activeSellerFilter !== 'ALL' && selectedSeller
                ? `Menampilkan barang dari ${selectedSeller.storeProfile?.storeName || selectedSeller.name}`
                : 'Pilih kebutuhan dapur harian Anda dari semua warung'}
            </p>
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
              Semua Kategori ({products.length})
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

        {catalogProducts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 p-6">
            <Store className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="font-bold text-sm text-stone-700">Belum ada produk untuk filter ini</p>
            <p className="text-xs text-stone-400 mt-1">
              Coba ganti kategori atau pilih warung lain.
            </p>
            <button
              onClick={() => {
                setActiveCategoryFilter('ALL');
                setActiveSellerFilter('ALL');
              }}
              className="mt-3 px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : (
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
        )}
      </div>

      {/* Banner Ajakan Buka Warung Sendiri */}
      {onOpenAuth && (
        <div className="rounded-3xl bg-gradient-to-r from-teal-900 via-teal-800 to-emerald-900 text-white p-5 sm:p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-800/80 text-teal-200 text-[10px] font-bold uppercase tracking-wider">
              <Store className="w-3.5 h-3.5" />
              <span>Gabung Jadi Penjual</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight">
              Punya Warung Sembako di Lingkungan Anda?
            </h3>
            <p className="text-xs text-teal-100 max-w-xl">
              Daftar akun penjual sekarang. Atur nama warung Anda, kelola stok & harga sembako, terima pembayaran, dan atur kurir pengantaran langsung ke tetangga dan warga sekitar.
            </p>
          </div>
          <button
            onClick={() => onOpenAuth('REGISTER_SELLER')}
            className="px-5 py-3 bg-amber-400 hover:bg-amber-300 text-stone-950 font-black text-xs rounded-2xl shadow-lg transition active:scale-95 cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Buka Warung Sekarang</span>
          </button>
        </div>
      )}

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
              <p className="text-xs text-emerald-200 font-semibold">
                {cartCount} Barang di Keranjang
              </p>
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
