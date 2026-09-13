import { Order, Product, StockMovement, User } from '../types';

export class GoogleSheetsService {
  /**
   * Export Orders to CSV file
   */
  static exportOrdersToCSV(orders: Order[]): void {
    const headers = [
      'No. Pesanan',
      'Tanggal',
      'Nama Pelanggan',
      'No. HP',
      'Metode Pengiriman',
      'Alamat / Catatan',
      'Jumlah Item',
      'Subtotal',
      'Ongkir',
      'Diskon',
      'Grand Total',
      'Metode Bayar',
      'Status Bayar',
      'Status Pesanan',
      'Kurir',
    ];

    const rows = orders.map((o) => [
      `"${o.orderNumber}"`,
      `"${new Date(o.createdAt).toLocaleString('id-ID')}"`,
      `"${o.customerName}"`,
      `"${o.customerPhone}"`,
      `"${o.deliveryMethod === 'DELIVERY' ? 'Antar Alamat' : 'Ambil di Warung'}"`,
      `"${o.shippingAddress ? `${o.shippingAddress.street}, ${o.shippingAddress.kelurahan}` : '-'}"`,
      o.items.reduce((sum, item) => sum + item.quantity, 0),
      o.subtotal,
      o.deliveryFee,
      o.discount,
      o.grandTotal,
      `"${o.paymentMethod}"`,
      `"${o.paymentStatus}"`,
      `"${o.orderStatus}"`,
      `"${o.courierName || '-'}"`,
    ]);

    this.downloadCSV('laporan_pesanan_warungku.csv', [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));
  }

  /**
   * Export Inventory / Products to CSV
   */
  static exportProductsToCSV(products: Product[]): void {
    const headers = [
      'SKU',
      'Nama Produk',
      'Kategori',
      'Harga Normal',
      'Harga Promo',
      'Satuan',
      'Stok Saat Ini',
      'Batas Minimum Stok',
      'Status Stok',
      'Terjual',
      'Rating',
    ];

    const rows = products.map((p) => [
      `"${p.sku || '-'}"`,
      `"${p.name.replace(/"/g, '""')}"`,
      `"${p.categoryName}"`,
      p.normalPrice,
      p.promoPrice || '',
      `"${p.unit}"`,
      p.stock,
      p.minStock,
      `"${p.stock <= p.minStock ? 'MENIPIS' : 'AMAN'}"`,
      p.soldCount,
      p.rating,
    ]);

    this.downloadCSV('laporan_stok_warungku.csv', [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));
  }

  /**
   * Export Customers to CSV
   */
  static exportCustomersToCSV(users: User[]): void {
    const customers = users.filter((u) => u.role === 'CUSTOMER');
    const headers = ['ID', 'Nama Pelanggan', 'No HP / WhatsApp', 'Email', 'Total Transaksi', 'Jumlah Pesanan', 'Tanggal Daftar'];

    const rows = customers.map((c) => [
      `"${c.id}"`,
      `"${c.name}"`,
      `"${c.phone}"`,
      `"${c.email}"`,
      c.totalSpent || 0,
      c.totalOrders || 0,
      `"${new Date(c.createdAt).toLocaleDateString('id-ID')}"`,
    ]);

    this.downloadCSV('data_pelanggan_warungku.csv', [headers.join(','), ...rows.map((r) => r.join(','))].join('\n'));
  }

  /**
   * Trigger Google Apps Script Webhook Sync
   */
  static async syncToGoogleAppsScript(
    webhookUrl: string,
    payload: {
      orders: Order[];
      products: Product[];
      timestamp: string;
      syncedBy: string;
    }
  ): Promise<{ success: boolean; message: string }> {
    if (!webhookUrl || !webhookUrl.startsWith('http')) {
      throw new Error('URL Webhook Google Apps Script belum dikonfigurasi di Pengaturan Super Admin.');
    }

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        mode: 'no-cors', // standard for GAS web apps
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'SYNC_WARUNGKU_DATA',
          data: payload,
        }),
      });

      return {
        success: true,
        message: 'Data transaksi dan stok berhasil dikirim ke Google Apps Script / Google Sheets.',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      throw new Error(`Gagal mengirim data ke Google Sheets: ${errorMsg}`);
    }
  }

  static async syncOrdersToGoogleSheet(webhookUrl: string, orders: Order[]): Promise<boolean> {
    try {
      await this.syncToGoogleAppsScript(webhookUrl, {
        orders,
        products: [],
        timestamp: new Date().toISOString(),
        syncedBy: 'WARUNGKU App',
      });
      return true;
    } catch {
      return false;
    }
  }

  static getAppsScriptTemplate(): string {
    return this.getAppsScriptCodeTemplate();
  }

  /**
   * Helper to trigger browser file download
   */
  private static downloadCSV(filename: string, content: string): void {
    const blob = new Blob(['\ufeff' + content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Ready-to-use Apps Script code template for the Super Admin
   */
  static getAppsScriptCodeTemplate(): string {
    return `// ==========================================
// WARUNGKU GOOGLE APPS SCRIPT WEBHOOK RECEIVER
// ==========================================
// 1. Buat Google Sheet baru dengan nama "WARUNGKU Database"
// 2. Buat 2 sheet bernama: "Pesanan" dan "Stok"
// 3. Masuk ke Extensions -> Apps Script
// 4. Paste kode ini, lalu klik Deploy -> New deployment -> Web app
// 5. Set 'Who has access' menjadi 'Anyone'
// 6. Copy Web App URL dan masukkan ke Pengaturan WARUNGKU

function doPost(e) {
  try {
    var json = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    if (json.action === 'SYNC_WARUNGKU_DATA') {
      var orders = json.data.orders || [];
      var products = json.data.products || [];
      
      // Update Sheet Pesanan
      var orderSheet = ss.getSheetByName('Pesanan') || ss.insertSheet('Pesanan');
      if (orderSheet.getLastRow() === 0) {
        orderSheet.appendRow(['No Pesanan', 'Tanggal', 'Pelanggan', 'HP', 'Total', 'Status', 'Metode Bayar']);
      }
      orders.forEach(function(o) {
        orderSheet.appendRow([o.orderNumber, o.createdAt, o.customerName, o.customerPhone, o.grandTotal, o.orderStatus, o.paymentMethod]);
      });
      
      // Update Sheet Stok
      var stockSheet = ss.getSheetByName('Stok') || ss.insertSheet('Stok');
      stockSheet.clearContents();
      stockSheet.appendRow(['SKU', 'Nama Produk', 'Kategori', 'Harga', 'Stok', 'Batas Min']);
      products.forEach(function(p) {
        stockSheet.appendRow([p.sku, p.name, p.categoryName, p.normalPrice, p.stock, p.minStock]);
      });
      
      return ContentService.createTextOutput(JSON.stringify({ status: 'success' })).setMimeType(ContentService.MimeType.JSON);
    }
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}`;
  }
}
