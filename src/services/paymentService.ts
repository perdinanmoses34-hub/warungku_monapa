import { BankConfig, EWalletConfig, Order, PaymentMethod } from '../types';

export interface PaymentProcessResult {
  success: boolean;
  message: string;
  paymentStatus: 'UNPAID' | 'PAID' | 'VERIFYING';
  transactionId: string;
  paymentChannelInfo: string;
  qrUrl?: string;
}

export class PaymentService {
  /**
   * Cash on Delivery (COD) / Bayar Tunai Saat Barang Diterima
   */
  static processCashOnDelivery(order: Partial<Order>): PaymentProcessResult {
    return {
      success: true,
      message: 'Metode Bayar Tunai Saat Barang Diterima dipilih. Siapkan uang pas saat kurir tiba.',
      paymentStatus: 'UNPAID',
      transactionId: `COD-${Date.now()}`,
      paymentChannelInfo: 'Tunai di Tempat (COD)',
    };
  }

  /**
   * Bank Transfer Manual / Otomatis
   */
  static processBankTransfer(bank: BankConfig, proofUrl?: string): PaymentProcessResult {
    return {
      success: true,
      message: `Transfer ke ${bank.bankName} No. Rek ${bank.accountNumber} a.n ${bank.accountHolder}. ${proofUrl ? 'Bukti transfer telah dilampirkan.' : 'Silakan upload bukti transfer agar segera diproses.'}`,
      paymentStatus: proofUrl ? 'VERIFYING' : 'UNPAID',
      transactionId: `TRF-${bank.bankName}-${Date.now()}`,
      paymentChannelInfo: `Transfer Bank ${bank.bankName} (${bank.accountNumber})`,
    };
  }

  /**
   * E-Wallet (GoPay, OVO, DANA, ShopeePay, LinkAja)
   */
  static processEWallet(ewallet: EWalletConfig, customerPhone: string): PaymentProcessResult {
    return {
      success: true,
      message: `Pembayaran ${ewallet.walletName} diproses untuk nomor ${customerPhone}.`,
      paymentStatus: 'PAID', // Instant verification simulation for seamless UX
      transactionId: `EW-${ewallet.walletName}-${Date.now()}`,
      paymentChannelInfo: `${ewallet.walletName} (${customerPhone})`,
      qrUrl: `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=WARUNGKU-${ewallet.walletName}-${Date.now()}`,
    };
  }

  /**
   * Modular Payment Gateway Router (Ready for Midtrans/Xendit/Doku integration)
   */
  static async processPayment(
    method: PaymentMethod,
    details: {
      order: Partial<Order>;
      bank?: BankConfig;
      ewallet?: EWalletConfig;
      proofUrl?: string;
      customerPhone?: string;
    }
  ): Promise<PaymentProcessResult> {
    switch (method) {
      case 'COD':
        return this.processCashOnDelivery(details.order);
      case 'BANK_TRANSFER':
        if (!details.bank) {
          throw new Error('Pilih rekening bank tujuan transfer');
        }
        return this.processBankTransfer(details.bank, details.proofUrl);
      case 'EWALLET':
        if (!details.ewallet) {
          throw new Error('Pilih jenis E-Wallet pembayaran');
        }
        return this.processEWallet(details.ewallet, details.customerPhone || '081234567890');
      default:
        throw new Error('Metode pembayaran tidak dikenali');
    }
  }
}
