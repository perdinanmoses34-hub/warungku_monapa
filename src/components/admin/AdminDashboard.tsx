import React, { useState } from 'react';
import { Category, Order, Product, PromoVoucher, SystemSettings, UserRole } from '../../types';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminGoogleSheetsTab } from './AdminGoogleSheetsTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { AdminSuperAdminTab } from './AdminSuperAdminTab';
import { AdminSellerProfileTab } from './AdminSellerProfileTab';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { store } from '../../services/storeService';
import { formatRupiah } from '../../utils/formatters';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
  Shield,
  Coins,
  Store,
} from 'lucide-react';

interface Props {
  orders: Order[];
  products: Product[];
  categories: Category[];
  settings: SystemSettings;
  vouchers: PromoVoucher[];
  userRole: UserRole;
}

export const AdminDashboard: React.FC<Props> = ({
  orders,
  products,
  categories,
  settings,
  vouchers,
  userRole,
}) => {
  const currentUser = store.getCurrentUser();
  const allUsers = store.getUsers();

  // If super admin, default to SUPER_ADMIN tab; if seller, default to OVERVIEW or ORDERS
  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'ORDERS' | 'PRODUCTS' | 'SUPER_ADMIN' | 'SELLER_PROFILE' | 'SHEETS' | 'SETTINGS'
  >(userRole === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : 'OVERVIEW');

  // Filter orders and products for seller
  const displayOrders =
    userRole === 'SELLER'
      ? orders.filter((o) => o.sellerId === currentUser.id)
      : orders;

  const displayProducts =
    userRole === 'SELLER'
      ? products.filter((p) => p.sellerId === currentUser.id)
      : products;

  const handleExportOrdersCSV = () => {
    GoogleSheetsService.exportOrdersToCSV(displayOrders);
  };

  const superAdminEarnings = settings.superAdminEarnings || {
    currentBalance: 4000,
    totalFeeAccumulated: 4000,
    totalWithdrawn: 0,
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-28 space-y-4 overflow-x-hidden">
      {/* Subnav for admin/seller/superadmin */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 no-scrollbar max-w-full">
        {/* SUPER ADMIN DEDICATED TAB */}
        {userRole === 'SUPER_ADMIN' && (
          <button
            onClick={() => setActiveTab('SUPER_ADMIN')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'SUPER_ADMIN'
                ? 'bg-purple-900 text-white shadow-md'
                : 'bg-purple-50 text-purple-800 hover:bg-purple-100 border border-purple-200'
            }`}
          >
            <Shield className="w-4 h-4 text-purple-300" />
            <span>Super Admin & Komisi</span>
            <span className="px-1.5 py-0.2 rounded-full bg-purple-800 text-purple-200 text-[10px] font-black">
              {formatRupiah(superAdminEarnings.currentBalance)}
            </span>
          </button>
        )}

        {/* SELLER STORE PROFILE TAB */}
        {userRole === 'SELLER' && (
          <button
            onClick={() => setActiveTab('SELLER_PROFILE')}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              activeTab === 'SELLER_PROFILE'
                ? 'bg-teal-800 text-white shadow-md'
                : 'bg-teal-50 text-teal-800 hover:bg-teal-100 border border-teal-200'
            }`}
          >
            <Store className="w-4 h-4 text-teal-300" />
            <span>Pengaturan Warung ({currentUser.storeProfile?.storeName || currentUser.name})</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ringkasan {userRole === 'SELLER' ? 'Toko' : 'Penjualan'}</span>
        </button>

        <button
          onClick={() => setActiveTab('ORDERS')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'ORDERS'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Kelola Pesanan ({displayOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('PRODUCTS')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'PRODUCTS'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Boxes className="w-4 h-4" />
          <span>Katalog & Stok ({displayProducts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('SHEETS')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'SHEETS'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'bg-white text-emerald-800 hover:bg-emerald-50 border border-emerald-300'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Google Sheets & Drive</span>
        </button>

        <button
          onClick={() => setActiveTab('SETTINGS')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'SETTINGS'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Pengaturan & Voucher</span>
        </button>
      </div>

      {/* Active Tab Component */}
      {activeTab === 'SUPER_ADMIN' && userRole === 'SUPER_ADMIN' && (
        <AdminSuperAdminTab
          settings={settings}
          users={allUsers}
          currentUserId={currentUser.id}
        />
      )}

      {activeTab === 'SELLER_PROFILE' && userRole === 'SELLER' && (
        <AdminSellerProfileTab currentUser={currentUser} />
      )}

      {activeTab === 'OVERVIEW' && (
        <AdminOverviewTab
          orders={displayOrders}
          products={displayProducts}
          settings={settings}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
          onExportOrdersCSV={handleExportOrdersCSV}
        />
      )}

      {activeTab === 'ORDERS' && (
        <AdminOrdersTab orders={displayOrders} settings={settings} />
      )}

      {activeTab === 'PRODUCTS' && (
        <AdminProductsTab products={displayProducts} categories={categories} />
      )}

      {activeTab === 'SHEETS' && (
        <AdminGoogleSheetsTab orders={displayOrders} products={displayProducts} settings={settings} />
      )}

      {activeTab === 'SETTINGS' && (
        <AdminSettingsTab settings={settings} vouchers={vouchers} />
      )}
    </div>
  );
};
