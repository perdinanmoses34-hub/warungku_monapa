import React, { useState, useMemo } from 'react';
import { Product, Category } from '../../types';
import { store } from '../../services/storeService';
import { Search, X, SlidersHorizontal, ArrowUpDown, Tag, Sparkles } from 'lucide-react';
import { ProductCard } from './ProductCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onOpenProductDetail: (product: Product) => void;
  onAddToCart: (productId: string) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  cartMap: Record<string, number>;
  wishlistSet: Set<string>;
  onToggleWishlist: (productId: string) => void;
}

export const SearchModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onOpenProductDetail,
  onAddToCart,
  onUpdateCartQty,
  cartMap,
  wishlistSet,
  onToggleWishlist,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'POPULAR' | 'CHEAPEST' | 'EXPENSIVE' | 'NEWEST'>('POPULAR');
  const [showFilters, setShowFilters] = useState(false);

  const categories = store.getCategories();
  const allProducts = store.getProducts();

  const suggestions = ['Beras Pandan Wangi', 'Minyak Bimoli', 'Telur Ayam', 'Gula Pasir', 'Gas 3 Kg', 'Aqua Galon', 'Indomie'];

  const filteredProducts = useMemo(() => {
    return allProducts
      .filter((p) => {
        const matchesSearch =
          !searchTerm.trim() ||
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (p.brand && p.brand.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
        const matchesStock = !inStockOnly || p.stock > 0;

        return matchesSearch && matchesCat && matchesStock;
      })
      .sort((a, b) => {
        const priceA = a.promoPrice || a.normalPrice;
        const priceB = b.promoPrice || b.normalPrice;

        if (sortBy === 'CHEAPEST') return priceA - priceB;
        if (sortBy === 'EXPENSIVE') return priceB - priceA;
        if (sortBy === 'NEWEST') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        return b.soldCount - a.soldCount; // POPULAR
      });
  }, [allProducts, searchTerm, selectedCategory, inStockOnly, sortBy]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-white animate-in fade-in duration-200">
      {/* Top Search Bar */}
      <div className="p-3 sm:p-4 border-b border-stone-200 bg-stone-50 flex items-center gap-2 sm:gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Cari beras, minyak, telur, gula, dll..."
            autoFocus
            className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent text-stone-900 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition cursor-pointer ${
            showFilters || selectedCategory !== 'ALL' || inStockOnly
              ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
              : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-100'
          }`}
          title="Filter & Urutkan"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span className="hidden sm:inline">Filter</span>
        </button>

        <button
          onClick={onClose}
          className="p-2 text-stone-500 hover:text-stone-800 rounded-xl transition cursor-pointer"
          aria-label="Tutup Pencarian"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Suggestion pills if search empty */}
      {!searchTerm && (
        <div className="px-4 py-2.5 bg-stone-50 border-b border-stone-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          <span className="text-[11px] font-semibold text-stone-500 shrink-0">Populer:</span>
          {suggestions.map((sug, idx) => (
            <button
              key={idx}
              onClick={() => setSearchTerm(sug)}
              className="px-2.5 py-1 bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-700 rounded-lg text-xs border border-stone-200 transition shrink-0 cursor-pointer"
            >
              {sug}
            </button>
          ))}
        </div>
      )}

      {/* Expandable Filter Drawer */}
      {showFilters && (
        <div className="p-4 bg-stone-50 border-b border-stone-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs animate-in slide-in-from-top-2">
          {/* Category Filter */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">Kategori Produk</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
            >
              <option value="ALL">Semua Kategori</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="font-bold text-stone-700 block mb-1">Urutkan Berdasarkan</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full p-2 bg-white border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 outline-none"
            >
              <option value="POPULAR">Paling Terlaris</option>
              <option value="CHEAPEST">Harga Termurah</option>
              <option value="EXPENSIVE">Harga Tertinggi</option>
              <option value="NEWEST">Produk Terbaru</option>
            </select>
          </div>

          {/* Stock toggle & Reset */}
          <div className="flex items-end justify-between gap-2">
            <label className="flex items-center gap-2 cursor-pointer py-2">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded border-stone-300 focus:ring-emerald-500"
              />
              <span className="font-medium text-stone-700">Hanya Stok Tersedia</span>
            </label>

            <button
              onClick={() => {
                setSelectedCategory('ALL');
                setInStockOnly(false);
                setSortBy('POPULAR');
                setSearchTerm('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer py-2"
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* Search Results Grid */}
      <div className="flex-1 overflow-y-auto p-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-3 text-xs text-stone-500">
          <span>Ditemukan <strong>{filteredProducts.length}</strong> produk sembako</span>
          <span>Urutan: {sortBy === 'POPULAR' ? 'Terlaris' : sortBy === 'CHEAPEST' ? 'Termurah' : sortBy === 'EXPENSIVE' ? 'Tertinggi' : 'Terbaru'}</span>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-400 flex flex-col items-center justify-center">
            <Search className="w-12 h-12 text-stone-300 mb-2" />
            <p className="font-bold text-stone-700 text-sm">Produk Tidak Ditemukan</p>
            <p className="text-xs text-stone-400 mt-1 max-w-xs">
              Coba gunakan kata kunci lain seperti beras, minyak, tepung, atau periksa filter kategori.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
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
    </div>
  );
};
