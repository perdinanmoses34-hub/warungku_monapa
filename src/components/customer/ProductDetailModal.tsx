import React, { useState } from 'react';
import { Product, Review } from '../../types';
import { formatRupiah, formatWeight, formatDate } from '../../utils/formatters';
import {
  X,
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Zap,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { store } from '../../services/storeService';

interface Props {
  product: Product;
  onClose: () => void;
  onAddToCart: (productId: string, quantity: number) => void;
  onInstantBuy: (productId: string, quantity: number) => void;
  isWishlisted: boolean;
  onToggleWishlist: (productId: string) => void;
  onSelectRelatedProduct: (product: Product) => void;
}

export const ProductDetailModal: React.FC<Props> = ({
  product,
  onClose,
  onAddToCart,
  onInstantBuy,
  isWishlisted,
  onToggleWishlist,
  onSelectRelatedProduct,
}) => {
  const [selectedImage, setSelectedImage] = useState<string>(product.imageUrl);
  const [quantity, setQuantity] = useState<number>(product.minPurchase || 1);
  const [copied, setCopied] = useState(false);

  const reviews = store.getReviews(product.id);
  const allProducts = store.getProducts();
  const relatedProducts = allProducts
    .filter((p) => p.categoryId === product.categoryId && p.id !== product.id)
    .slice(0, 4);

  const images = [product.imageUrl, ...(product.galleryUrls || [])].filter(Boolean);
  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= product.minStock;
  const discountPercent = product.promoPrice
    ? Math.round(((product.normalPrice - product.promoPrice) / product.normalPrice) * 100)
    : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Beli ${product.name} di WARUNGKU seharga ${formatRupiah(product.promoPrice || product.normalPrice)}!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-stone-200 flex items-center justify-between bg-stone-50 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {product.categoryName}
            </span>
            <span className="text-xs text-stone-500">SKU: {product.sku || 'WK-SEMBAKO'}</span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={handleShare}
              className="p-2 text-stone-500 hover:text-stone-800 rounded-full hover:bg-stone-200 transition cursor-pointer"
              title="Bagikan Produk"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onToggleWishlist(product.id)}
              className="p-2 text-stone-500 hover:text-rose-500 rounded-full hover:bg-stone-200 transition cursor-pointer"
              title="Simpan Wishlist"
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Main Gallery */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-inner">
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {discountPercent > 0 && (
                  <div className="absolute top-3 left-3 bg-rose-500 text-white text-xs font-black px-2.5 py-1 rounded-full shadow-md">
                    HEMAT {discountPercent}%
                  </div>
                )}
                {isOutOfStock && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                    <span className="bg-rose-600 text-white font-bold text-xs px-3 py-1 rounded-full">
                      STOK HABIS
                    </span>
                  </div>
                )}
              </div>

              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(img)}
                      className={`w-14 h-14 rounded-xl overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                        selectedImage === img ? 'border-emerald-600 ring-2 ring-emerald-600/30' : 'border-stone-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="thumb" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Overview Info */}
            <div className="flex flex-col justify-between">
              <div>
                <h1 className="text-lg sm:text-xl font-black text-stone-900 leading-snug">
                  {product.name}
                </h1>

                {/* Rating & Sold */}
                <div className="flex items-center gap-3 mt-2 text-xs text-stone-600">
                  <div className="flex items-center gap-1 text-amber-500 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    <span>{product.rating}</span>
                  </div>
                  <span>({reviews.length || product.reviewCount} ulasan)</span>
                  <span>•</span>
                  <span>Terjual <strong>{product.soldCount}</strong> {product.unit}</span>
                </div>

                {/* Price block */}
                <div className="mt-4 p-3.5 bg-emerald-50/60 rounded-2xl border border-emerald-100">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-emerald-800">
                      {formatRupiah(product.promoPrice || product.normalPrice)}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700">/{product.unit}</span>
                  </div>
                  {product.promoPrice && (
                    <div className="flex items-center gap-2 mt-0.5 text-xs">
                      <span className="text-stone-400 line-through">
                        {formatRupiah(product.normalPrice)}
                      </span>
                      <span className="text-rose-600 font-bold">
                        Hemat {formatRupiah(product.normalPrice - product.promoPrice)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Specs pill row */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block text-[10px] uppercase">Berat Produk</span>
                    <span className="font-bold text-stone-800">{formatWeight(product.weightGrams)}</span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-100">
                    <span className="text-stone-400 block text-[10px] uppercase">Ketersediaan</span>
                    <span className={`font-bold ${isOutOfStock ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                      {isOutOfStock ? 'Habis' : isLowStock ? `Sisa ${product.stock} ${product.unit}` : 'Tersedia Banyak'}
                    </span>
                  </div>
                </div>

                {/* Warung Guarantee perks */}
                <div className="mt-4 space-y-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Jaminan kualitas sembako asli & fresh</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Layanan pengantaran langsung ke dapur Anda</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="border-t border-stone-200 pt-4">
            <h3 className="font-bold text-stone-900 text-sm mb-2">Deskripsi Produk</h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {product.description || 'Barang sembako kebutuhan harian pilihan berkualitas tinggi dari warung kami.'}
            </p>
          </div>

          {/* Reviews Section */}
          <div className="border-t border-stone-200 pt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-stone-900 text-sm">
                Ulasan Pelanggan ({reviews.length})
              </h3>
              <div className="flex items-center gap-1 text-xs text-amber-600 font-bold">
                <Star className="w-4 h-4 fill-amber-400" />
                <span>{product.rating} / 5.0</span>
              </div>
            </div>

            {reviews.length === 0 ? (
              <p className="text-xs text-stone-400 italic bg-stone-50 p-4 rounded-xl text-center">
                Belum ada ulasan untuk produk ini. Jadilah yang pertama memberikan penilaian setelah membeli!
              </p>
            ) : (
              <div className="space-y-3">
                {reviews.map((rev) => (
                  <div key={rev.id} className="p-3 bg-stone-50 rounded-xl border border-stone-100 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                          alt={rev.userName}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="font-bold text-stone-800">{rev.userName}</span>
                      </div>
                      <span className="text-[10px] text-stone-400">{formatDate(rev.createdAt)}</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-amber-500 mb-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${i < rev.rating ? 'fill-amber-400' : 'text-stone-300'}`}
                        />
                      ))}
                    </div>
                    <p className="text-stone-600">{rev.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="border-t border-stone-200 pt-4">
              <h3 className="font-bold text-stone-900 text-sm mb-3">Produk Terkait</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {relatedProducts.map((rel) => (
                  <div
                    key={rel.id}
                    onClick={() => onSelectRelatedProduct(rel)}
                    className="p-2 bg-stone-50 hover:bg-stone-100 rounded-xl border border-stone-200 cursor-pointer transition"
                  >
                    <img src={rel.imageUrl} alt={rel.name} className="w-full aspect-square object-cover rounded-lg mb-1.5" />
                    <p className="text-xs font-bold text-stone-800 line-clamp-1">{rel.name}</p>
                    <p className="text-xs font-extrabold text-emerald-700 mt-0.5">
                      {formatRupiah(rel.promoPrice || rel.normalPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sticky Action Footer */}
        <div className="p-4 border-t border-stone-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          {/* Quantity Selector */}
          <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-3">
            <span className="text-xs font-semibold text-stone-500">Jumlah:</span>
            <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200">
              <button
                onClick={() => setQuantity(Math.max(product.minPurchase || 1, quantity - 1))}
                disabled={quantity <= (product.minPurchase || 1)}
                className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-40"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-bold text-stone-900">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                disabled={quantity >= product.stock}
                className="w-8 h-8 flex items-center justify-center text-stone-700 hover:bg-white rounded-lg transition active:scale-95 cursor-pointer disabled:opacity-40"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-xs text-stone-400 font-medium">
              Subtotal: <strong className="text-stone-900">{formatRupiah((product.promoPrice || product.normalPrice) * quantity)}</strong>
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => onAddToCart(product.id, quantity)}
              disabled={isOutOfStock}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>+ Keranjang</span>
            </button>

            <button
              onClick={() => onInstantBuy(product.id, quantity)}
              disabled={isOutOfStock}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>Beli Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
