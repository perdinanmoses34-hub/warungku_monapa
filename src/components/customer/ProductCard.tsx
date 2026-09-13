import React from 'react';
import { Product } from '../../types';
import { formatRupiah, formatWeight } from '../../utils/formatters';
import { ShoppingCart, Plus, Minus, Star, Heart, Store } from 'lucide-react';
import { store } from '../../services/storeService';

interface Props {
  product: Product;
  cartQuantity: number;
  onOpenDetail: (product: Product) => void;
  onAddToCart: (productId: string) => void;
  onUpdateCartQty: (productId: string, qty: number) => void;
  isWishlisted?: boolean;
  onToggleWishlist?: (productId: string) => void;
}

export const ProductCard: React.FC<Props> = ({
  product,
  cartQuantity,
  onOpenDetail,
  onAddToCart,
  onUpdateCartQty,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
  const discountPercent = product.promoPrice
    ? Math.round(((product.normalPrice - product.promoPrice) / product.normalPrice) * 100)
    : 0;

  return (
    <div
      id={`product-card-${product.id}`}
      className="group bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col relative"
    >
      {/* Badges on image */}
      <div className="relative aspect-square w-full bg-stone-100 overflow-hidden cursor-pointer" onClick={() => onOpenDetail(product)}>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            // fallback placeholder if image fails
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80';
          }}
        />

        {/* Wishlist button */}
        {onToggleWishlist && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(product.id);
            }}
            aria-label="Simpan ke Wishlist"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/85 hover:bg-white shadow-sm flex items-center justify-center transition cursor-pointer backdrop-blur-xs"
          >
            <Heart
              className={`w-4 h-4 transition ${
                isWishlisted ? 'fill-rose-500 text-rose-500' : 'text-stone-400 hover:text-rose-500'
              }`}
            />
          </button>
        )}

        {/* Promo Discount Tag */}
        {discountPercent > 0 && (
          <div className="absolute top-2 left-2 bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
            HEMAT {discountPercent}%
          </div>
        )}

        {/* Stock warning overlay or badge */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center">
            <span className="bg-stone-900 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              Stok Habis
            </span>
          </div>
        ) : isLowStock ? (
          <div className="absolute bottom-2 left-2 bg-amber-500 text-stone-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md shadow-xs">
            Sisa {product.stock} {product.unit}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between text-[11px] text-stone-400 mb-1">
            <span className="font-medium text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
              {product.categoryName}
            </span>
            <span>{formatWeight(product.weightGrams)}</span>
          </div>

          {product.sellerStoreName && (
            <div className="flex items-center gap-1 text-[10px] text-teal-700 font-semibold mb-1 truncate">
              <Store className="w-3 h-3 text-teal-600 shrink-0" />
              <span className="truncate">{product.sellerStoreName}</span>
            </div>
          )}

          <h3
            onClick={() => onOpenDetail(product)}
            className="font-bold text-xs sm:text-sm text-stone-800 line-clamp-2 hover:text-emerald-700 cursor-pointer leading-snug"
          >
            {product.name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-stone-500">
            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              {product.rating}
            </span>
            <span>•</span>
            <span>Terjual {product.soldCount}</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="mt-3 pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-black text-stone-900 leading-tight truncate">
              {formatRupiah(product.promoPrice || product.normalPrice)}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              {product.promoPrice && (
                <span className="text-[10px] text-stone-400 line-through">
                  {formatRupiah(product.normalPrice)}
                </span>
              )}
              <span className="text-[10px] font-medium text-stone-500">/{product.unit}</span>
            </div>
          </div>

          {/* Cart Control: If 0 -> + Keranjang. If > 0 -> Quantity Stepper */}
          {isOutOfStock ? (
            <span className="px-2 py-1 bg-stone-100 text-stone-400 text-[11px] font-semibold rounded-xl shrink-0">
              Habis
            </span>
          ) : cartQuantity > 0 ? (
            <div className="flex items-center bg-emerald-50 border border-emerald-200 rounded-xl p-0.5 shrink-0">
              <button
                onClick={() => onUpdateCartQty(product.id, cartQuantity - 1)}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-200/60 rounded-lg transition active:scale-95 cursor-pointer"
                aria-label="Kurang"
              >
                <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
              <span className="w-5 sm:w-6 text-center text-xs font-bold text-emerald-900">
                {cartQuantity}
              </span>
              <button
                onClick={() => onUpdateCartQty(product.id, cartQuantity + 1)}
                disabled={cartQuantity >= product.stock}
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-emerald-700 hover:bg-emerald-200/60 rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-40"
                aria-label="Tambah"
              >
                <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAddToCart(product.id)}
              className="flex items-center justify-center gap-1 px-2 sm:px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer shrink-0"
              title="Tambah ke Keranjang"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Beli</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
