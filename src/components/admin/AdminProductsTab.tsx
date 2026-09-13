import React, { useState } from 'react';
import { Category, Product, StockLog } from '../../types';
import { formatRupiah, formatWeight, formatDate } from '../../utils/formatters';
import { store } from '../../services/storeService';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  History,
  TrendingUp,
  X,
  Check,
} from 'lucide-react';

interface Props {
  products: Product[];
  categories: Category[];
}

export const AdminProductsTab: React.FC<Props> = ({ products, categories }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showStockHistoryModal, setShowStockHistoryModal] = useState(false);
  const [stockLogs, setStockLogs] = useState<StockLog[]>([]);

  // Form State
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState(categories[0]?.id || '');
  const [formNormalPrice, setFormNormalPrice] = useState(15000);
  const [formPromoPrice, setFormPromoPrice] = useState<string>('');
  const [formStock, setFormStock] = useState(20);
  const [formMinStock, setFormMinStock] = useState(5);
  const [formUnit, setFormUnit] = useState('kg');
  const [formWeightGrams, setFormWeightGrams] = useState(1000);
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoryName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = selectedCategory === 'ALL' || p.categoryId === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory(categories[0]?.id || '');
    setFormNormalPrice(15000);
    setFormPromoPrice('');
    setFormStock(20);
    setFormMinStock(5);
    setFormUnit('kg');
    setFormWeightGrams(1000);
    setFormDescription('Sembako berkualitas pilihan untuk kebutuhan harian.');
    setFormImageUrl('https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80');
    setShowProductModal(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormName(product.name);
    setFormCategory(product.categoryId);
    setFormNormalPrice(product.normalPrice);
    setFormPromoPrice(product.promoPrice ? String(product.promoPrice) : '');
    setFormStock(product.stock);
    setFormMinStock(product.minStock);
    setFormUnit(product.unit);
    setFormWeightGrams(product.weightGrams);
    setFormDescription(product.description || '');
    setFormImageUrl(product.imageUrl);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const cat = categories.find((c) => c.id === formCategory);

    const productPayload = {
      name: formName,
      categoryId: formCategory,
      categoryName: cat?.name || 'Sembako',
      normalPrice: Number(formNormalPrice),
      promoPrice: formPromoPrice ? Number(formPromoPrice) : undefined,
      stock: Number(formStock),
      minStock: Number(formMinStock),
      unit: formUnit,
      weightGrams: Number(formWeightGrams),
      description: formDescription,
      imageUrl: formImageUrl,
      isActive: true,
      soldCount: editingProduct ? editingProduct.soldCount : 0,
      rating: editingProduct ? editingProduct.rating : 5.0,
      reviewCount: editingProduct ? editingProduct.reviewCount : 1,
    };

    if (editingProduct) {
      store.updateProduct(editingProduct.id, productPayload);
    } else {
      store.addProduct(productPayload);
    }

    setShowProductModal(false);
  };

  const handleDeleteProduct = (productId: string) => {
    if (confirm('Yakin ingin menghapus produk ini dari katalog warung?')) {
      store.deleteProduct(productId);
    }
  };

  const handleQuickStockChange = (product: Product, delta: number) => {
    const newStock = Math.max(0, product.stock + delta);
    store.updateStock(product.id, newStock, delta > 0 ? 'RESTOCK' : 'CORRECTION', `Penyesuaian cepat ${delta > 0 ? '+' : ''}${delta}`);
  };

  const handleViewStockHistory = (productId?: string) => {
    const logs = store.getStockLogs(productId);
    setStockLogs(logs);
    setShowStockHistoryModal(true);
  };

  return (
    <div className="space-y-4 text-xs text-stone-900">
      {/* Top Bar: Controls & Add Product */}
      <div className="bg-white p-4 rounded-3xl border border-stone-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari produk sembako..."
              className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs outline-none"
          >
            <option value="ALL">Semua Kategori</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => handleViewStockHistory()}
            className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Riwayat Stok</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Produk</span>
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-stone-200">
            <thead className="bg-stone-50 text-[10px] font-bold uppercase tracking-wider text-stone-500">
              <tr>
                <th className="p-3.5">Produk</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5">Harga Normal / Promo</th>
                <th className="p-3.5">Stok Saat Ini</th>
                <th className="p-3.5">Berat</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-stone-400">
                    Tidak ada produk sembako yang cocok.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow = product.stock <= product.minStock;
                  return (
                    <tr key={product.id} className="hover:bg-stone-50 transition">
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-10 h-10 rounded-xl object-cover bg-stone-100 shrink-0"
                          />
                          <div>
                            <span className="font-bold text-stone-900 block">{product.name}</span>
                            <span className="text-[10px] text-stone-400">Terjual {product.soldCount} {product.unit}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-semibold text-[10px]">
                          {product.categoryName}
                        </span>
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="font-bold text-stone-900">{formatRupiah(product.promoPrice || product.normalPrice)}</div>
                        {product.promoPrice && (
                          <div className="text-[10px] text-stone-400 line-through">
                            {formatRupiah(product.normalPrice)}
                          </div>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-black ${
                            product.stock === 0
                              ? 'bg-rose-100 text-rose-800'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {product.stock} {product.unit}
                          </span>

                          {/* Quick Adjust Buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickStockChange(product, -1)}
                              className="w-6 h-6 bg-stone-100 hover:bg-stone-200 rounded flex items-center justify-center font-bold text-stone-700 cursor-pointer"
                              title="Kurang 1 stok"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleQuickStockChange(product, 5)}
                              className="px-1.5 h-6 bg-emerald-50 hover:bg-emerald-100 rounded flex items-center justify-center text-[10px] font-bold text-emerald-700 cursor-pointer"
                              title="Kulakan +5 stok"
                            >
                              +5
                            </button>
                          </div>
                        </div>
                        {isLow && (
                          <span className="text-[10px] text-rose-600 block mt-0.5 font-medium">
                            ⚠ Di bawah batas min. ({product.minStock})
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 whitespace-nowrap text-stone-600">
                        {formatWeight(product.weightGrams)}
                      </td>

                      <td className="p-3.5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenEditModal(product)}
                            className="p-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg cursor-pointer"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product.id)}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg cursor-pointer"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
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

      {/* ADD / EDIT PRODUCT MODAL */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-3xl p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-sm text-stone-900">
                {editingProduct ? 'Edit Produk Sembako' : 'Tambah Produk Sembako Baru'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-3">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Produk Sembako:</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Beras Ramos Wangi 5 Kg"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Kategori:</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Satuan:</label>
                  <select
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="liter">liter (Liter)</option>
                    <option value="pcs">pcs (Satuan)</option>
                    <option value="bungkus">bungkus</option>
                    <option value="butir">butir</option>
                    <option value="ikat">ikat</option>
                    <option value="kaleng">kaleng</option>
                    <option value="tabung">tabung</option>
                    <option value="galon">galon</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Harga Normal (Rp):</label>
                  <input
                    type="number"
                    required
                    value={formNormalPrice}
                    onChange={(e) => setFormNormalPrice(Number(e.target.value))}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Harga Promo (Opsional):</label>
                  <input
                    type="number"
                    placeholder="Kosongkan jika tidak promo"
                    value={formPromoPrice}
                    onChange={(e) => setFormPromoPrice(e.target.value)}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Jumlah Stok:</label>
                  <input
                    type="number"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Batas Min. Stok:</label>
                  <input
                    type="number"
                    required
                    value={formMinStock}
                    onChange={(e) => setFormMinStock(Number(e.target.value))}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Berat (Gram):</label>
                  <input
                    type="number"
                    required
                    value={formWeightGrams}
                    onChange={(e) => setFormWeightGrams(Number(e.target.value))}
                    className="w-full p-2 border border-stone-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">URL Foto Produk:</label>
                <input
                  type="url"
                  required
                  value={formImageUrl}
                  onChange={(e) => setFormImageUrl(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1">Deskripsi:</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2 border border-stone-300 rounded-xl"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK MOVEMENT HISTORY MODAL */}
      {showStockHistoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-5 shadow-2xl space-y-3 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-stone-200">
              <h3 className="font-bold text-sm">Riwayat Keluar Masuk Stok</h3>
              <button onClick={() => setShowStockHistoryModal(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {stockLogs.length === 0 ? (
                <p className="p-4 text-center text-stone-400">Belum ada riwayat pergerakan stok.</p>
              ) : (
                stockLogs.map((log) => (
                  <div key={log.id} className="py-2 flex justify-between">
                    <div>
                      <span className="font-bold text-stone-900 block">{log.productName}</span>
                      <span className="text-[10px] text-stone-400">
                        {formatDate(log.createdAt)} • {log.note}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className={`font-mono font-bold ${log.changeAmount > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {log.changeAmount > 0 ? `+${log.changeAmount}` : log.changeAmount}
                      </span>
                      <span className="block text-[10px] text-stone-400">
                        Sisa: {log.currentStock}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
