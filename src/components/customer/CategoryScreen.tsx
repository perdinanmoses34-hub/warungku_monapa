import React, { useState } from 'react';
import { Category, Product } from '../../types';
import { ProductCard } from './ProductCard';
import { ChevronRight, Sparkles } from 'lucide-react';

interface Props {
  categories: Category[];
  products: Product[];
  selectedCategoryId: string;
  onSelectCategory: (categoryId: string) => void;
  onOpenProductDetail: (product: Product) => void;
  onAddToCart: (productId: string) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  cartMap: Record<string, number>;
  wishlistSet: Set<string>;
  onToggleWishlist: (productId: string) => void;
}

export const CategoryScreen: React.FC<Props> = ({
  categories,
  products,
  selectedCategoryId,
  onSelectCategory,
  onOpenProductDetail,
  onAddToCart,
  onUpdateCartQty,
  cartMap,
  wishlistSet,
  onToggleWishlist,
}) => {
  const [activeCat, setActiveCat] = useState<string>(selectedCategoryId || 'ALL');

  const filteredProducts = products.filter((p) => {
    if (activeCat === 'ALL') return true;
    return p.categoryId === activeCat;
  });

  const currentCategory = categories.find((c) => c.id === activeCat);

  return (
    <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-4 pb-24 space-y-5">
      <div>
        <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight">
          Kategori Kebutuhan Sembako
        </h1>
        <p className="text-xs text-stone-500">Pilih kategori untuk mempermudah pencarian belanja dapur</p>
      </div>

      {/* Horizontal pill list */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        <button
          onClick={() => setActiveCat('ALL')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
            activeCat === 'ALL'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
          }`}
        >
          Semua ({products.length})
        </button>

        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCat(cat.id)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
              activeCat === cat.id
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-50'
            }`}
          >
            <span>
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
            </span>
            <span>{cat.name}</span>
          </button>
        ))}
      </div>

      {/* Current Category Info Banner */}
      {currentCategory && (
        <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200/70 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-emerald-900">{currentCategory.name}</h2>
            <p className="text-xs text-emerald-700 mt-0.5">{currentCategory.description || 'Pilihan sembako berkualitas untuk kebutuhan harian'}</p>
          </div>
          <span className="text-xs font-bold bg-white text-emerald-800 px-2.5 py-1 rounded-xl shadow-2xs border border-emerald-100">
            {filteredProducts.length} Produk
          </span>
        </div>
      )}

      {/* Products in this category */}
      {filteredProducts.length === 0 ? (
        <div className="p-12 text-center text-stone-400 bg-white rounded-2xl border border-stone-200">
          <p className="text-sm font-bold text-stone-700">Belum Ada Produk di Kategori Ini</p>
          <p className="text-xs text-stone-400 mt-1">Admin akan segera menambahkan produk sembako baru.</p>
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
  );
};
