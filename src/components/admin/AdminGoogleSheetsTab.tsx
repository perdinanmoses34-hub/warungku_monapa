import React, { useState } from 'react';
import { Order, Product, SystemSettings } from '../../types';
import { GoogleSheetsService } from '../../services/googleSheetsService';
import { GoogleWorkspaceService } from '../../services/googleWorkspaceService';
import {
  FileSpreadsheet,
  Download,
  UploadCloud,
  CheckCircle2,
  Copy,
  Check,
  Code,
  AlertCircle,
  HardDrive,
  Database,
  ExternalLink,
  Lock,
  RefreshCw,
  Mail,
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
  const targetEmail = GoogleWorkspaceService.getTargetEmail(); // perdinan.moses34@guru.smp.belajar.id

  // Direct Sheets ID state
  const [spreadsheetId, setSpreadsheetId] = useState(
    localStorage.getItem('warungku_sheet_id') || ''
  );
  const [accessToken, setAccessToken] = useState(
    GoogleWorkspaceService.getAccessToken() || ''
  );
  const [isSyncingDirect, setIsSyncingDirect] = useState(false);
  const [directSyncResult, setDirectSyncResult] = useState<{
    success?: boolean;
    message?: string;
  } | null>(null);

  // Drive Backup state
  const [isUploadingDrive, setIsUploadingDrive] = useState(false);
  const [driveUploadResult, setDriveUploadResult] = useState<{
    success?: boolean;
    message?: string;
    viewUrl?: string;
  } | null>(null);

  // Webhook Apps Script state
  const [webhookUrl, setWebhookUrl] = useState(
    settings.googleSheetsWebhookUrl || 'https://script.google.com/macros/s/AKfycbxExampleWarungkuSync/exec'
  );
  const [isSyncingWebhook, setIsSyncingWebhook] = useState(false);
  const [webhookStatus, setWebhookStatus] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showScriptCode, setShowScriptCode] = useState(false);

  // Firebase state
  const [firebaseProject] = useState('warungku-monapa-db');

  const handleSaveSheetId = (id: string) => {
    setSpreadsheetId(id);
    localStorage.setItem('warungku_sheet_id', id);
  };

  const handleSaveToken = (token: string) => {
    setAccessToken(token);
    GoogleWorkspaceService.setAccessToken(token, targetEmail);
  };

  const handleSyncToGoogleSheets = async () => {
    if (!spreadsheetId.trim()) {
      alert('Silakan masukkan Link atau ID Google Sheet terlebih dahulu.');
      return;
    }

    setIsSyncingDirect(true);
    setDirectSyncResult(null);

    const res = await GoogleWorkspaceService.syncProductsToSheet(
      spreadsheetId,
      'Katalog Sembako',
      products
    );

    // Also sync orders if products succeeded
    if (res.success) {
      await GoogleWorkspaceService.syncOrdersToSheet(spreadsheetId, 'Pesanan Warung', orders);
    }

    setIsSyncingDirect(false);
    setDirectSyncResult(res);
  };

  const handleBackupToGoogleDrive = async () => {
    setIsUploadingDrive(true);
    setDriveUploadResult(null);

    // Generate CSV content of both products & orders
    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `Backup_WARUNGKU_${dateStr}.csv`;
    
    // Create combined backup content
    const headers = ['Tipe', 'Kode/ID', 'Nama/Pelanggan', 'Kategori/Metode', 'Harga/Total', 'Status/Stok', 'Waktu'];
    const rows: string[][] = [];

    products.forEach((p) => {
      rows.push(['PRODUK', p.sku || '-', p.name, p.categoryName, p.normalPrice.toString(), p.stock.toString(), p.updatedAt]);
    });

    orders.forEach((o) => {
      rows.push(['PESANAN', o.orderNumber, o.customerName, o.deliveryMethod, o.grandTotal.toString(), o.orderStatus, o.createdAt]);
    });

    const csvContent = [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');

    const result = await GoogleWorkspaceService.uploadBackupToDrive(fileName, csvContent, 'text/csv');

    setIsUploadingDrive(false);
    setDriveUploadResult(result);
  };

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

    setIsSyncingWebhook(true);
    setWebhookStatus('Mengirim data pesanan ke Google Sheets...');

    const success = await GoogleSheetsService.syncOrdersToGoogleSheet(webhookUrl, orders);

    setIsSyncingWebhook(false);
    if (success) {
      setWebhookStatus(`Sinkronisasi berhasil! ${orders.length} pesanan telah tercatat di Google Sheet.`);
    } else {
      setWebhookStatus('Gagal menghubungkan ke webhook Google Sheets. Periksa URL Anda.');
    }
  };

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GoogleSheetsService.getAppsScriptTemplate());
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div className="space-y-4 text-xs text-stone-900 w-full max-w-full overflow-x-hidden">
      {/* Account Header Badge */}
      <div className="bg-emerald-900 text-white p-4 sm:p-5 rounded-3xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-emerald-800 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6 text-emerald-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">
                  Akun Cloud Terdaftar
                </span>
                <span className="bg-emerald-800 text-emerald-200 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                  Super Admin
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-black tracking-tight mt-0.5 flex items-center gap-1.5 break-all">
                <Mail className="w-4 h-4 text-emerald-300 shrink-0" />
                <span>{targetEmail}</span>
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1 leading-normal">
                Aplikasi disinkronkan langsung dengan Google Sheets, Google Drive, dan Firebase untuk katalog barang dan transaksi warung.
              </p>
            </div>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0">
            <div className="bg-emerald-800/80 px-3 py-1.5 rounded-xl border border-emerald-700/60 text-right">
              <div className="text-[10px] text-emerald-300 font-medium">Status Akun</div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 justify-end">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Terhubung</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Direct Google Sheets & Google Drive Integration */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Google Sheets Direct */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">Google Sheets (Katalog & Transaksi)</h3>
              <p className="text-stone-500 text-[11px]">Buka atau perbarui data barang warung langsung di Spreadsheet</p>
            </div>
          </div>

          <div className="space-y-2 pt-1">
            <label className="font-bold text-stone-700 block text-xs">
              Link atau ID Google Sheet Anda:
            </label>
            <input
              type="text"
              value={spreadsheetId}
              onChange={(e) => handleSaveSheetId(e.target.value)}
              placeholder="https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5.../edit"
              className="w-full p-2.5 bg-stone-50 border border-stone-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-600 font-mono text-xs"
            />
            <p className="text-[11px] text-stone-400">
              *Masukkan tautan spreadsheet sembako di akun <strong>{targetEmail}</strong>.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleSyncToGoogleSheets}
              disabled={isSyncingDirect}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingDirect ? 'animate-spin' : ''}`} />
              <span>{isSyncingDirect ? 'Menyinkronkan...' : 'Sinkronkan Data Sembako ke Sheet'}</span>
            </button>
            {spreadsheetId && (
              <a
                href={spreadsheetId.startsWith('http') ? spreadsheetId : `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Buka Sheet</span>
              </a>
            )}
          </div>

          {directSyncResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 ${
                directSyncResult.success
                  ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 border border-amber-200 text-amber-800'
              }`}
            >
              {directSyncResult.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              )}
              <span>{directSyncResult.message}</span>
            </div>
          )}
        </div>

        {/* Google Drive Direct Backup */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 shadow-2xs space-y-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-stone-900">Google Drive Database Backup</h3>
              <p className="text-stone-500 text-[11px]">Penyimpanan berkas cadangan dan arsip transaksi otomatis</p>
            </div>
          </div>

          <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 text-[11px] text-stone-600 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-700">Target Folder:</span>
              <span className="font-mono text-stone-900">Google Drive ({targetEmail})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-700">Format Backup:</span>
              <span className="font-mono text-stone-900">CSV & JSON Transaksi Warung</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="font-semibold text-stone-700">Total Produk / Pesanan:</span>
              <span className="font-bold text-emerald-700">{products.length} Produk / {orders.length} Pesanan</span>
            </div>
          </div>

          <button
            onClick={handleBackupToGoogleDrive}
            disabled={isUploadingDrive}
            className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 active:scale-95 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <UploadCloud className={`w-4 h-4 ${isUploadingDrive ? 'animate-spin' : ''}`} />
            <span>{isUploadingDrive ? 'Mengunggah ke Drive...' : 'Simpan Backup Baru ke Google Drive'}</span>
          </button>

          {driveUploadResult && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center justify-between gap-2 ${
                driveUploadResult.success
                  ? 'bg-blue-50 border border-blue-200 text-blue-900'
                  : 'bg-amber-50 border border-amber-200 text-amber-900'
              }`}
            >
              <div className="flex items-center gap-2">
                {driveUploadResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                )}
                <span>{driveUploadResult.message}</span>
              </div>
              {driveUploadResult.viewUrl && (
                <a
                  href={driveUploadResult.viewUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="underline font-bold shrink-0 text-blue-700 hover:text-blue-900"
                >
                  Buka File
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* CSV Direct Downloads */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-2xs space-y-3">
          <div className="flex items-center gap-2 text-stone-900 font-bold text-sm">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <span>Unduh Laporan Pesanan (.CSV)</span>
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
            <span>Unduh Katalog Stok Sembako (.CSV)</span>
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
              Webhook Google Apps Script (Sinkronisasi Otomatis Tanpa Login Ulang)
            </h3>
            <p className="text-stone-500 text-xs mt-0.5">
              Setiap kali pesanan baru dibuat atau diselesaikan, data dapat langsung dikirim ke sheet Google Anda secara otomatis.
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
              disabled={isSyncingWebhook}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingWebhook ? 'animate-spin' : ''}`} />
              <span>{isSyncingWebhook ? 'Mengirim...' : 'Kirim Uji Coba'}</span>
            </button>
          </div>

          {webhookStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{webhookStatus}</span>
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
              <span>{showScriptCode ? 'Sembunyikan Kode Apps Script' : 'Lihat Kode Google Apps Script Untuk Ditempel di Akun Anda'}</span>
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
            <div className="mt-3 p-3 bg-stone-900 text-stone-200 rounded-2xl overflow-x-auto font-mono text-[11px] leading-relaxed max-h-64 border border-stone-800 w-full max-w-full">
              <pre className="whitespace-pre overflow-x-auto">{GoogleSheetsService.getAppsScriptTemplate()}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
