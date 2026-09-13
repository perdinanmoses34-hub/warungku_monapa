import { OrderStatus } from '../types';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatWeight(grams: number): string {
  if (grams >= 1000) {
    const kg = (grams / 1000).toFixed(grams % 1000 === 0 ? 0 : 1);
    return `${kg} kg`;
  }
  return `${grams} gr`;
}

export const ORDER_STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; step: number; desc: string }
> = {
  CREATED: {
    label: 'Pesanan Dibuat',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    step: 1,
    desc: 'Pesanan berhasil dibuat dan menunggu konfirmasi.',
  },
  WAITING_PAYMENT: {
    label: 'Menunggu Bayar',
    bg: 'bg-orange-100 dark:bg-orange-900/30',
    text: 'text-orange-700 dark:text-orange-400',
    step: 2,
    desc: 'Silakan lakukan pembayaran sesuai metode yang dipilih.',
  },
  PAYMENT_CONFIRMED: {
    label: 'Bayar Dikonfirmasi',
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    text: 'text-blue-700 dark:text-blue-400',
    step: 3,
    desc: 'Pembayaran telah diverifikasi oleh admin warung.',
  },
  ACCEPTED: {
    label: 'Diterima Warung',
    bg: 'bg-teal-100 dark:bg-teal-900/30',
    text: 'text-teal-700 dark:text-teal-400',
    step: 4,
    desc: 'Pesanan telah diterima dan segera disiapkan.',
  },
  PROCESSING: {
    label: 'Pesanan Diproses',
    bg: 'bg-indigo-100 dark:bg-indigo-900/30',
    text: 'text-indigo-700 dark:text-indigo-400',
    step: 4,
    desc: 'Pesanan Anda sedang disiapkan oleh tim warung.',
  },
  PACKING: {
    label: 'Sedang Dikemas',
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    text: 'text-purple-700 dark:text-purple-400',
    step: 5,
    desc: 'Barang sembako sedang dipacking rapi dan aman.',
  },
  READY_FOR_PICKUP: {
    label: 'Menunggu Kurir',
    bg: 'bg-amber-100 dark:bg-amber-900/30',
    text: 'text-amber-700 dark:text-amber-400',
    step: 6,
    desc: 'Paket siap diambil oleh kurir pengantar.',
  },
  DELIVERING: {
    label: 'Sedang Diantar',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-700 dark:text-cyan-400',
    step: 7,
    desc: 'Kurir sedang dalam perjalanan menuju alamat Anda.',
  },
  ON_DELIVERY: {
    label: 'Dalam Perjalanan',
    bg: 'bg-cyan-100 dark:bg-cyan-900/30',
    text: 'text-cyan-700 dark:text-cyan-400',
    step: 7,
    desc: 'Kurir sedang meluncur ke lokasi rumah Anda.',
  },
  ARRIVED: {
    label: 'Kurir Tiba',
    bg: 'bg-emerald-100 dark:bg-emerald-900/30',
    text: 'text-emerald-700 dark:text-emerald-400',
    step: 7,
    desc: 'Kurir telah tiba di alamat pengantaran.',
  },
  COMPLETED: {
    label: 'Pesanan Selesai',
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    step: 8,
    desc: 'Pesanan telah selesai diterima. Terima kasih telah berbelanja!',
  },
  CANCELLED: {
    label: 'Dibatalkan',
    bg: 'bg-rose-100 dark:bg-rose-900/30',
    text: 'text-rose-700 dark:text-rose-400',
    step: 0,
    desc: 'Pesanan telah dibatalkan.',
  },
};
