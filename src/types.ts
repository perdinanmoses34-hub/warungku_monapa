export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COURIER' | 'CUSTOMER';

export interface Address {
  id: string;
  label: 'Rumah' | 'Kantor' | 'Lainnya';
  recipientName: string;
  phone: string;
  street: string;
  kelurahan: string;
  kecamatan: string;
  city: string;
  postalCode?: string;
  notes?: string; // e.g. "Rumah pagar hitam, dekat masjid Al-Hidayah"
  isDefault?: boolean;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: UserRole;
  avatarUrl: string;
  addresses: Address[];
  createdAt: string;
  totalSpent?: number;
  totalOrders?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  imageUrl?: string;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  categoryId: string;
  categoryName: string;
  description: string;
  normalPrice: number;
  promoPrice?: number;
  unit: string; // e.g., 'kg', 'liter', 'bungkus', 'dus', 'botol', 'sachet', 'butir', 'tabung'
  stock: number;
  minStock: number;
  weightGrams: number;
  imageUrl: string;
  galleryUrls?: string[];
  isAvailable: boolean;
  minPurchase: number;
  rating: number;
  reviewCount: number;
  soldCount: number;
  brand?: string;
  sku?: string;
  createdAt: string;
  updatedAt: string;
}

export type PaymentStatus = 'UNPAID' | 'PAID' | 'VERIFYING';

export type StockLog = StockMovement;

export interface CartItem {
  productId: string;
  quantity: number;
  selected: boolean;
}

export type OrderStatus =
  | 'CREATED'            // 1. Pesanan dibuat
  | 'WAITING_PAYMENT'    // 2. Menunggu pembayaran
  | 'PAYMENT_CONFIRMED'  // 3. Pembayaran dikonfirmasi
  | 'ACCEPTED'           // 4. Diterima warung
  | 'PROCESSING'         // 5. Pesanan diproses
  | 'PACKING'            // 6. Sedang dikemas
  | 'READY_FOR_PICKUP'   // 7. Siap diambil kurir
  | 'DELIVERING'         // 8. Sedang diantar
  | 'ON_DELIVERY'        // 8b. Sedang diantar
  | 'ARRIVED'            // 9. Pesanan tiba / sampai
  | 'COMPLETED'          // 10. Selesai
  | 'CANCELLED';         // 11. Dibatalkan

export type DeliveryMethod = 'DELIVERY' | 'PICKUP';

export type PaymentMethod = 'COD' | 'BANK_TRANSFER' | 'EWALLET';

export interface BankConfig {
  id: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  logoUrl?: string;
}

export interface EWalletConfig {
  id: string;
  walletName: 'GoPay' | 'OVO' | 'DANA' | 'ShopeePay' | 'LinkAja';
  phoneNumber: string;
  accountHolder: string;
  qrCodeUrl?: string;
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  weightGrams: number;
  subtotal: number;
  imageUrl: string;
}

export interface OrderStatusHistory {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface Order {
  id: string;
  orderNumber: string; // e.g. "WK-2026-000001"
  userId: string;
  customerName: string;
  customerPhone: string;
  deliveryMethod: DeliveryMethod;
  shippingAddress?: Address;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  voucherCode?: string;
  grandTotal: number;
  paymentMethod: PaymentMethod;
  paymentStatus: 'UNPAID' | 'PAID' | 'VERIFYING';
  paymentProofUrl?: string;
  paymentChannelInfo?: string;
  orderStatus: OrderStatus;
  statusHistory: OrderStatusHistory[];
  courierId?: string;
  courierName?: string;
  courierPhone?: string;
  deliveryNotes?: string;
  isScheduled?: boolean;
  scheduledDate?: string;
  scheduledTimeSlot?: string;
  estimatedDeliveryMinutes: number;
  createdAt: string;
  updatedAt: string;
  ratingGiven?: number;
}

export interface Review {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export interface PromoVoucher {
  id: string;
  code: string;
  title: string;
  description: string;
  discountType: 'PERCENT' | 'FIXED' | 'FREE_SHIPPING';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  validUntil: string;
  isActive: boolean;
}

export interface NotificationItem {
  id: string;
  userId?: string; // empty means broadcast to role or all
  targetRole?: UserRole | 'ALL';
  title: string;
  message: string;
  type: 'ORDER' | 'PROMO' | 'SYSTEM' | 'STOCK';
  orderId?: string;
  read: boolean;
  createdAt: string;
}

export interface OperatingHour {
  open: string;
  close: string;
  isOpen: boolean;
}

export interface SystemSettings {
  storeName: string;
  storeTagline: string;
  storeAddress: string;
  storePhone: string; // WhatsApp
  storeEmail: string;
  primaryColor: string;
  operatingHours: {
    [day: string]: OperatingHour; // 'Senin', 'Selasa', ...
  };
  deliverySettings: {
    baseFee: number;
    feePerKm: number;
    freeShippingMinOrder: number;
    maxRadiusKm: number;
    estimatedMinutesBase: number;
  };
  paymentMethods: {
    codEnabled: boolean;
    bankTransferEnabled: boolean;
    ewalletEnabled: boolean;
  };
  bankAccounts: BankConfig[];
  ewallets: EWalletConfig[];
  allowScheduledOrders: boolean;
  googleAppsScriptWebhookUrl?: string;
  googleSheetsSyncEnabled: boolean;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  module: string;
  description: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE';
  quantity: number;
  previousStock: number;
  currentStock: number;
  reason: string;
  timestamp: string;
  recordedBy: string;
}
