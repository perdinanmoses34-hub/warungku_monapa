/**
 * Google Workspace & Drive integration service for WARUNGKU
 * Connects directly with Google Sheets API and Google Drive API
 * targeted for: perdinan.moses34@guru.smp.belajar.id
 */

import { Order, Product } from '../types';

export interface GoogleAuthStatus {
  isSignedIn: boolean;
  userEmail: string | null;
  accessToken: string | null;
}

export class GoogleWorkspaceService {
  private static STORAGE_KEY_TOKEN = 'warungku_g_access_token';
  private static STORAGE_KEY_EMAIL = 'warungku_g_user_email';
  private static TARGET_EMAIL = 'perdinan.moses34@guru.smp.belajar.id';

  /**
   * Get target account email configured for this system
   */
  static getTargetEmail(): string {
    return this.TARGET_EMAIL;
  }

  /**
   * Get current stored access token
   */
  static getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(this.STORAGE_KEY_TOKEN);
  }

  /**
   * Get connected email
   */
  static getConnectedEmail(): string {
    if (typeof window === 'undefined') return this.TARGET_EMAIL;
    return localStorage.getItem(this.STORAGE_KEY_EMAIL) || this.TARGET_EMAIL;
  }

  /**
   * Save token after authorization
   */
  static setAccessToken(token: string, email?: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.STORAGE_KEY_TOKEN, token);
    localStorage.setItem(this.STORAGE_KEY_EMAIL, email || this.TARGET_EMAIL);
  }

  /**
   * Disconnect Google Account
   */
  static disconnect(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(this.STORAGE_KEY_TOKEN);
  }

  /**
   * Check if connected
   */
  static isConnected(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Sync Products / Sembako catalogue to Google Sheets directly via Google Sheets API
   */
  static async syncProductsToSheet(
    spreadsheetId: string,
    sheetName: string = 'Katalog Sembako',
    products: Product[]
  ): Promise<{ success: boolean; message: string; rowsCount?: number }> {
    const token = this.getAccessToken();
    if (!token) {
      return {
        success: false,
        message: 'Akses Google belum terhubung. Silakan login atau hubungkan akun Google Workspace Anda.',
      };
    }

    if (!spreadsheetId.trim()) {
      return {
        success: false,
        message: 'Masukkan ID Spreadsheet atau Link Google Sheet Anda terlebih dahulu.',
      };
    }

    const cleanSheetId = this.extractSpreadsheetId(spreadsheetId);

    const headers = [
      'SKU',
      'Nama Produk Sembako',
      'Kategori',
      'Harga Normal (Rp)',
      'Harga Promo (Rp)',
      'Satuan',
      'Stok Saat Ini',
      'Batas Min. Stok',
      'Status Ketersediaan',
      'Total Terjual',
      'Rating',
      'Terakhir Diperbarui',
    ];

    const values = [
      headers,
      ...products.map((p) => [
        p.sku || '-',
        p.name,
        p.categoryName,
        p.normalPrice,
        p.promoPrice || 0,
        p.unit,
        p.stock,
        p.minStock,
        p.isAvailable ? 'TERSEDIA' : 'HABIS',
        p.soldCount,
        p.rating,
        new Date(p.updatedAt || Date.now()).toLocaleString('id-ID'),
      ]),
    ];

    try {
      // 1. Update cells in Sheet
      const range = `${encodeURIComponent(sheetName)}!A1:L${values.length}`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanSheetId}/values/${range}?valueInputOption=USER_ENTERED`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `${sheetName}!A1:L${values.length}`,
          majorDimension: 'ROWS',
          values,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP error ${response.status}`);
      }

      return {
        success: true,
        message: `Berhasil sinkronisasi ${products.length} item sembako ke Google Sheet!`,
        rowsCount: values.length,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal memperbarui Google Sheet: ${err.message || 'Periksa izin Sheet atau masa berlaku token.'}`,
      };
    }
  }

  /**
   * Sync Orders to Google Sheet directly
   */
  static async syncOrdersToSheet(
    spreadsheetId: string,
    sheetName: string = 'Pesanan Warung',
    orders: Order[]
  ): Promise<{ success: boolean; message: string; rowsCount?: number }> {
    const token = this.getAccessToken();
    if (!token) {
      return {
        success: false,
        message: 'Akses Google belum terhubung. Silakan login atau hubungkan akun Google Workspace Anda.',
      };
    }

    const cleanSheetId = this.extractSpreadsheetId(spreadsheetId);

    const headers = [
      'No. Pesanan',
      'Tanggal Pesanan',
      'Nama Pelanggan',
      'Nomor WhatsApp',
      'Metode Antar',
      'Alamat Tujuan',
      'Total Item',
      'Subtotal Belanja',
      'Ongkos Kirim',
      'Potongan Diskon',
      'Grand Total (Rp)',
      'Metode Bayar',
      'Status Bayar',
      'Status Pesanan',
      'Nama Kurir',
    ];

    const values = [
      headers,
      ...orders.map((o) => [
        o.orderNumber,
        new Date(o.createdAt).toLocaleString('id-ID'),
        o.customerName,
        o.customerPhone,
        o.deliveryMethod === 'DELIVERY' ? 'Antar ke Rumah' : 'Ambil di Warung',
        o.shippingAddress ? `${o.shippingAddress.street}, ${o.shippingAddress.kelurahan}` : '-',
        o.items.reduce((s, i) => s + i.quantity, 0),
        o.subtotal,
        o.deliveryFee,
        o.discount,
        o.grandTotal,
        o.paymentMethod,
        o.paymentStatus,
        o.orderStatus,
        o.courierName || '-',
      ]),
    ];

    try {
      const range = `${encodeURIComponent(sheetName)}!A1:O${values.length}`;
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${cleanSheetId}/values/${range}?valueInputOption=USER_ENTERED`;

      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          range: `${sheetName}!A1:O${values.length}`,
          majorDimension: 'ROWS',
          values,
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP error ${response.status}`);
      }

      return {
        success: true,
        message: `Berhasil mencatat ${orders.length} pesanan ke Google Sheet!`,
        rowsCount: values.length,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal memperbarui sheet pesanan: ${err.message || 'Periksa kembali akses atau ID sheet Anda.'}`,
      };
    }
  }

  /**
   * Upload Receipt / Transaction Backup directly to Google Drive
   */
  static async uploadBackupToDrive(
    fileName: string,
    content: string,
    mimeType: string = 'text/csv'
  ): Promise<{ success: boolean; message: string; fileId?: string; viewUrl?: string }> {
    const token = this.getAccessToken();
    if (!token) {
      return {
        success: false,
        message: 'Google Drive belum terhubung. Silakan hubungkan akun Google Anda.',
      };
    }

    try {
      const metadata = {
        name: fileName,
        mimeType: mimeType,
        description: `Backup data otomatis dari aplikasi WARUNGKU Monapa (${new Date().toLocaleString('id-ID')})`,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', new Blob([content], { type: mimeType }));

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: form,
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error?.message || `HTTP ${response.status}`);
      }

      const resData = await response.json();
      return {
        success: true,
        message: `File "${fileName}" berhasil tersimpan aman di Google Drive akun Anda!`,
        fileId: resData.id,
        viewUrl: `https://drive.google.com/file/d/${resData.id}/view`,
      };
    } catch (err: any) {
      return {
        success: false,
        message: `Gagal mengunggah ke Google Drive: ${err.message}`,
      };
    }
  }

  /**
   * Helper to extract sheet ID from full URL or direct ID
   */
  static extractSpreadsheetId(urlOrId: string): string {
    const trimmed = urlOrId.trim();
    if (trimmed.includes('/spreadsheets/d/')) {
      const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
      if (match && match[1]) return match[1];
    }
    return trimmed;
  }
}
