import React, { useState } from 'react';
import { Category, Order, Product, PromoVoucher, SystemSettings, UserRole } from '../../types';
import { AdminOverviewTab } from './AdminOverviewTab';
import { AdminOrdersTab } from './AdminOrdersTab';
import { AdminProductsTab } from './AdminProductsTab';
import { AdminGoogleSheetsTab } from './AdminGoogleSheetsTab';
import { AdminSettingsTab } from './AdminSettingsTab';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import {
  LayoutDashboard,
  Package,
  Boxes,
  FileSpreadsheet,
  Settings,
  ShieldAlert,
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
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ORDERS' | 'PRODUCTS' | 'SHEETS' | 'SETTINGS'>('OVERVIEW');

  const handleExportOrdersCSV = () => {
    GoogleSheetsService.exportOrdersToCSV(orders);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-4 pb-28 space-y-4 overflow-x-hidden">
      {/* Subnav for admin */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-stone-200 no-scrollbar max-w-full">
        <button
          onClick={() => setActiveTab('OVERVIEW')}
          className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeTab === 'OVERVIEW'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Ringkasan</span>
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
          <span>Kelola Pesanan ({orders.length})</span>
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
          <span>Katalog & Stok ({products.length})</span>
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
      {activeTab === 'OVERVIEW' && (
        <AdminOverviewTab
          orders={orders}
          products={products}
          settings={settings}
          onNavigateTab={(tab) => setActiveTab(tab as any)}
          onExportOrdersCSV={handleExportOrdersCSV}
        />
      )}

      {activeTab === 'ORDERS' && (
        <AdminOrdersTab orders={orders} settings={settings} />
      )}

      {activeTab === 'PRODUCTS' && (
        <AdminProductsTab products={products} categories={categories} />
      )}

      {activeTab === 'SHEETS' && (
        <AdminGoogleSheetsTab orders={orders} products={products} settings={settings} />
      )}

      {activeTab === 'SETTINGS' && (
        <AdminSettingsTab settings={settings} vouchers={vouchers} />
      )}
    </div>
  );
};
