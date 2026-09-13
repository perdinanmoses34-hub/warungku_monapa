import React, { useState } from 'react';
import { Order, Product, SystemSettings } from '../../types';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  Code,
  AlertCircle,
  Clock,
  RefreshCw,
} from 'lucide-react';

interface Props {
  orders: Order[];
  products: Product[];
  settings: SystemSettings;
}

export const AdminGoogleSheetsTab: React.FC<Props> = ({
  orders,
  products,
  settings,
}) => {
  const [webhookUrl, setWebhookUrl] = useState(
    settings.googleSheetsWebhookUrl || 'https://script.google.com/macros/s/AKfycbxExampleWarungkuSync/exec'
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);

  const handleExportOrders = () => {
    GoogleSheetsService.exportOrdersToCSV(orders);
  };

  const handleExportProducts = () => {
    GoogleSheetsService.exportProductsToCSV(products);
  };

  const handleSyncWebhook = async () => {
    if (!webhookUrl) {
      alert('Masukkan Webhook URL Google Apps Script terlebih dahulu.');
      return;
    }

    setIsSyncing(true);
    setSyncStatus('Mengirim data pesanan ke Google Sheets...');

    const success = await GoogleSheetsService.syncOrdersToGoogleSheet(webhookUrl, orders);

    setIsSyncing(false);
    if (success) {
      setSyncStatus(`Sinkronisasi berhasil! ${orders.length} pesanan telah tercatat di Google Sheet.`);
    } else {
      setSyncStatus('Gagal menghubungkan ke webhook Google Sheets. Periksa URL Anda.');
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GoogleSheetsService.getAppsScriptTemplate());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-4 text-xs text-stone-900">
      {/* Overview Card */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-950 text-white p-5 rounded-3xl shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-700/80 flex items-center justify-center">
            <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
              Google Sheets Synchronization
            </span>
            <h2 className="text-base sm:text-lg font-black tracking-tight mt-0.5">
              Sinkronisasi Pesanan & Stok ke Google Spreadsheet
            </h2>
            <p className="text-xs text-emerald-100 mt-1">
              Catat laporan keuangan, pembukuan warung, dan rekapan stok secara otomatis langsung ke Google Drive Anda.
            </p>
          </div>
        </div>
      </div>

      {/* CSV Direct Downloads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Ekspor Semua Pesanan (.CSV)</span>
          </div>
          <p className="text-stone-500 text-xs leading-relaxed">
            Unduh file spreadsheet format CSV berisi seluruh transaksi pelanggan, total belanja, metode pembayaran, dan status pesanan.
          </p>
          <button
            onClick={handleExportOrders}
            className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Pesanan ({orders.length} Data)</span>
          </button>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Ekspor Stok & Katalog Sembako (.CSV)</span>
          </div>
          <p className="text-stone-500 text-xs leading-relaxed">
            Unduh file spreadsheet berisi inventaris produk sembako, sisa stok gudang warung, harga modal/jual, dan batas minimum stok.
          </p>
          <button
            onClick={handleExportProducts}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV Stok ({products.length} Produk)</span>
          </button>
        </div>
      </div>

      {/* Webhook Automatic Sync Configuration */}
      <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-stone-900 flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-600" />
              Webhook Google Apps Script (Sinkronisasi Otomatis)
            </h3>
            <p className="text-stone-500 text-xs mt-0.5">
              Setiap kali pesanan baru dibuat atau diselesaikan, data dapat langsung dikirim ke sheet Google Anda.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="font-bold text-stone-700 block">Google Apps Script Web URL:</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="url"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/AKfycb.../exec"
              className="flex-1 p-2.5 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
            />
            <button
              onClick={handleSyncWebhook}
              disabled={isSyncing}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Mengirim...' : 'Sinkronkan Sekarang'}</span>
            </button>
          </div>

          {syncStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{syncStatus}</span>
            </div>
          )}
        </div>

        {/* Script template collapsible */}
        <div className="pt-3 border-t border-stone-100">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setShowScriptCode(!showScriptCode)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
            >
              <Code className="w-4 h-4" />
              <span>{showScriptCode ? 'Sembunyikan Kode Apps Script' : 'Lihat Kode Google Apps Script Untuk Ditempel'}</span>
            </button>

            <button
              onClick={handleCopyScript}
              className="px-3 py-1 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              {copiedScript ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedScript ? 'Tersalin' : 'Salin Kode'}</span>
            </button>
          </div>

          {showScriptCode && (
            <div className="mt-3 p-3 bg-stone-900 text-stone-200 rounded-2xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-64 border border-stone-800">
              <pre>{GoogleSheetsService.getAppsScriptTemplate()}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
